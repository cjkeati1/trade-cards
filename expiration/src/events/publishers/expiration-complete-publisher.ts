import {Subjects, Publisher, ExpirationCompleteEvent} from "@ckcards/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;

}
