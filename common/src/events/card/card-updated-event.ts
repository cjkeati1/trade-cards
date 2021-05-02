import {Subjects} from "../..";
import {CardCondition} from "../..";

export interface CardUpdatedEvent {
    subject: Subjects.CardUpdated;
    data: {
        id: string;
        version: number;
        title: string;
        condition: CardCondition
        description: string;
        price: number;
        userId: string;
        orderId?: string;
    };
}
