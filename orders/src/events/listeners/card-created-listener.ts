import {Message} from 'node-nats-streaming';
import {Subjects, Listener, CardCreatedEvent} from "@ckcards/common";
import {Card} from "../../models/card";

export class TicketCreatedListener extends Listener<CardCreatedEvent> {
    readonly subject = Subjects.CardCreated;
    queueGroupName = 'orders-service';

    onMessage(data: CardCreatedEvent['data'], msg: Message): void {
        throw new Error('Method not implemented.');
    }
}
