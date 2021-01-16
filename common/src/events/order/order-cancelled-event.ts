import {OrderStatus, Subjects} from "../..";

export interface OrderCancelledEvent {
    subject: Subjects.OrderCancelled;
    data: {
        id: string,
        card: {
            id: string;
        }
    };
}
