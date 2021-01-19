import {CardCreatedListener} from "../card-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {CardCreatedEvent, CardCondition} from "@ckcards/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Card} from "../../../models/card";

const setup = async () => {
    // create an instance of the listener
    const listener = new CardCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: CardCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Borrelsword Dragon',
        condition: CardCondition.Mint,
        description: 'Maximum Gold - Singles',
        price: 4,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg};

};

it('creates and saves a card', async () => {
    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a card was created
    const card = await Card.findById(data.id);

    expect(card).toBeDefined();
    expect(card!.title).toEqual(data.title);
    expect(card!.condition).toEqual(data.condition);
    expect(card!.description).toEqual(data.description);
    expect(card!.price).toEqual(data.price);

});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});
