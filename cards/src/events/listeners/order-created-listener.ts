import {Message} from 'node-nats-streaming';
import {Subjects, Listener, OrderCreatedEvent} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Find the card that the order is reserving
        const card = await Card.findById(data.card.id);

        // If not card, throw error
        if (!card) {
            throw new Error('card not found');
        }

        // Mark the card as being reserved by setting its orderId property
        card.set({orderId: data.id});

        // Save the card
        await card.save();

        // Ack the message
        msg.ack();
    };
}
