import {Message} from 'node-nats-streaming';
import {Subjects, Listener, OrderCreatedEvent} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";
import {CardUpdatedPublisher} from "../publishers/card-updated-publisher";

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

        // Whenever an order is created, a card gets updated with the order id, and
        // that makes the version number change, so we need to publish the event back
        // to the orders service so the card version is synced with this one
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

        // Ack the message
        msg.ack();
    };
}
