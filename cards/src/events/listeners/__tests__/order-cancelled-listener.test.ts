import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent, CardCondition} from "@ckcards/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Card} from "../../../models/card";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a card
    const orderId = mongoose.Types.ObjectId().toHexString();
    // Create and save a card
    const card = Card.build({
        title: 'Borrelsword Dragon',
        condition: CardCondition.Mint,
        description: 'Maximum Gold - Singles',
        price: 4,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    card.set({orderId});
    await card.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        card: {
            id: card.id,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, card, data, msg, orderId};
};


it('updates the card, publishes an event, and acks the message', async () => {
    const {listener, card, data, msg} = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedCard = await Card.findById(card.id);

    // Cancelling an order should nullify the orderId attribute
    expect(updatedCard!.orderId).not.toBeDefined();

    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
