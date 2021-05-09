import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteEvent, CardCondition, OrderStatus} from "@ckcards/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Card} from "../../../models/card";

import {Order} from "../../../models/order";

const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const card = Card.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Borrelsword Dragon',
        condition: CardCondition.Mint,
        description: 'Maximum Gold - Singles',
        price: 4,
    });
    await card.save();

    const order = Order.build({
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        status: OrderStatus.Complete,
        card
    });
    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, card, order};
};

it('updates the order status to cancelled', async () => {
    const {listener, data, msg, order} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an order cancelled event', async () => {
    const {listener, data, msg, order} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData =
        JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
