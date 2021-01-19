import {Message} from 'node-nats-streaming';
import {Subjects, Listener, CardCreatedEvent} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";

export class TicketCreatedListener extends Listener<CardCreatedEvent> {
    readonly subject = Subjects.CardCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: CardCreatedEvent['data'], msg: Message) {
        const {title, price, id, description, condition} = data;

        const ticket = Card.build({
            id, title, price, description, condition
        });
        await ticket.save();

        msg.ack();
    };
}
