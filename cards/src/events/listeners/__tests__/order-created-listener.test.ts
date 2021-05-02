import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus, CardCondition} from "@ckcards/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Card} from "../../../models/card";
import {CardUpdatedListener} from "../../../../../orders/src/events/listeners/card-updated-listener";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create an save a card
    const card = Card.build({
        title: 'Borrelsword Dragon',
        condition: CardCondition.Mint,
        description: 'Maximum Gold - Singles',
        price: 4,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    await card.save();

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: '',
        card: {
            id: card.id,
            price: card.price
        }
    };


    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, card};

};

it('sets the orderId of the card', async () => {
    const {listener, data, msg, card} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedCard = await Card.findById(card.id);

    expect(updatedCard!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a card updated event', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    // write assertions to make sure the publish event was called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const cardUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(data.id).toEqual(cardUpdatedData.orderId);
});
