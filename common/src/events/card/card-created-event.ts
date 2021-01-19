import {Subjects} from "../..";
import {CardCondition} from "../..";

export interface CardCreatedEvent {
    subject: Subjects.CardCreated;
    data: {
        id: string;
        version: number;
        title: string;
        condition: CardCondition
        description: string;
        price: number;
        userId: string;
    };
}
