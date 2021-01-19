import {Message} from 'node-nats-streaming';
import {Subjects, Listener, CardUpdatedEvent} from "@ckcards/common";
import {Card} from "../../models/card";
import {queueGroupName} from "./queue-group-name";

export class CardUpdatedListener extends Listener<CardUpdatedEvent> {
    readonly subject = Subjects.CardUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: CardUpdatedEvent['data'], msg: Message) {
        const card = await Card.findByEvent(data);

        if (!card) {
            throw new Error('Card not found');
        }

        const {title, price, id, description, condition} = data;

        card.set({title, price, id, description, condition});
        await card.save();

        msg.ack();
    };
}
