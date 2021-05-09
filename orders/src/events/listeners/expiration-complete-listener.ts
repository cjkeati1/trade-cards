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
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const {orderId} = data;

        const order = await Order.findById(orderId).populate('card');
        if (!order) {
            throw new Error('Order not found');
        }

        // If the order expired, we need to cancel it and then publish an Order Cancelled
        // event
        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();

        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            card: {
                id: order.card.id
            }
        });


        msg.ack();
    };
}
