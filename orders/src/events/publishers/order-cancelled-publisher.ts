import {Publisher, OrderCancelledEvent, Subjects} from "@ckcards/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
