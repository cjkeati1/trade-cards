import {
    Publisher,
    Subjects,
    CardCreatedEvent
} from "@ckcards/common";

export class CardCreatedPublisher extends Publisher<CardCreatedEvent> {
    readonly subject = Subjects.CardCreated;
}
