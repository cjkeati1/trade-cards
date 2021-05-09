import {Listener, OrderCreatedEvent, Subjects} from "@ckcards/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process the job:', delay);
        // Add this order to the queue so it can be processed by the
        // expirationQueue.process method
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });

        msg.ack();
    }
}
