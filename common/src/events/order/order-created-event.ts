import {Subjects, OrderStatus} from "../..";

export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated;
    data: {
        id: string,
        status: OrderStatus;
        userId: string;
        expiresAt: string;
        card: {
            id: string;
            price: number;
        }
    };
}
