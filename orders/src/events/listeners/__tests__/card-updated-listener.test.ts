import {CardUpdatedListener} from "../card-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {CardUpdatedEvent, CardCondition} from "@ckcards/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Card} from "../../../models/card";

const setup = async () => {
    // create an instance of the listener
    const listener = new CardUpdatedListener(natsWrapper.client);

    // create an save a card
    const card = Card.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Borrelsword Dragon',
        condition: CardCondition.Mint,
        description: 'Maximum Gold - Singles',
        price: 4,
    });
    await card.save();

    // create a fake data object
    const data: CardUpdatedEvent['data'] = {
        version: card.version + 1,
        id: card.id,
        title: 'Borrelsword Dragon',
        condition: CardCondition.Good,
        description: 'Maximum Gold - Singles',
        price: 3.50,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, card};

};

it('finds, updates, and saves a card', async () => {
    const {listener, data, msg, card} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was created
    const updatedCard = await Card.findById(card.id);

    expect(updatedCard).toBeDefined();
    expect(updatedCard!.title).toEqual(data.title);
    expect(updatedCard!.condition).toEqual(data.condition);
    expect(updatedCard!.description).toEqual(data.description);
    expect(updatedCard!.price).toEqual(data.price);

});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    // await listener.onMessage(updatedTicketData, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is out of order', async () => {
    const {msg, data, listener, card} = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);

    } catch (e) {

    }

    expect(msg.ack).not.toHaveBeenCalled();

});
