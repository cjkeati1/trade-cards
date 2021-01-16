import {Publisher, OrderCreatedEvent, Subjects} from "@ckcards/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
