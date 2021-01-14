import {
    Publisher,
    Subjects,
    CardUpdatedEvent
} from "@ckcards/common";

export class CardUpdatedPublisher extends Publisher<CardUpdatedEvent> {
    readonly subject = Subjects.CardUpdated;
}
