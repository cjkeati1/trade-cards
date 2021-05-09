import {Message} from 'node-nats-streaming';
import {
    Subjects,
    Listener,
    ExpirationCompleteEvent,
    OrderStatus
} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const {orderId} = data;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.set({
            status: OrderStatus.Cancelled,
            expiresAt: undefined
        });
        await order.save();

        const card = await Card.findById(order.card.id);
        if (!card) {
            throw new Error('card associated with this order is not found');
        }

        card.set({
            orderId: undefined
        });


        msg.ack();
    };
}
