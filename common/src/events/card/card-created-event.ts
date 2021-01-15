import {Subjects} from "../types/subjects";
import {CardCondition} from "../..";

export interface CardCreatedEvent {
    subject: Subjects.CardCreated;
    data: {
        id: string;
        title: string;
        condition: CardCondition
        description: string;
        price: number;
        userId: string;
    };
}
