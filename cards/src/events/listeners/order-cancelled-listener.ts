import {Message} from 'node-nats-streaming';
import {Subjects, Listener, OrderCancelledEvent} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";
import {CardUpdatedPublisher} from "../publishers/card-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const card = await Card.findById(data.card.id);

        if (!card) {
            throw new Error('card not found');
        }

        // The order is being cancelled so we need to set the card's order ID to undefined
        card.set({orderId: undefined});

        await card.save();


        await new CardUpdatedPublisher(this.client).publish({
            id: card.id,
            version: card.version,
            title: card.title,
            price: card.price,
            condition: card.condition,
            description: card.description,
            userId: card.userId,
            orderId: card.orderId
        });

        msg.ack();
    };
}
