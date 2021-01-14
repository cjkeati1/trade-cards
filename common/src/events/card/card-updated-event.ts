import {Subjects} from "../subjects";
import {CardCondition} from "../..";

export interface CardUpdatedEvent {
    subject: Subjects.CardUpdated;
    data: {
        id: string;
        title: string;
        condition: CardCondition
        description: string;
        price: number;
        userId: string;
    };
}
