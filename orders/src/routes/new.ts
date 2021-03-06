import express, {Request, Response} from "express";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    BadRequestError,
    OrderStatus
} from "@ckcards/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Card} from "../models/card";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60;

router.post('/api/orders',
    requireAuth,
    [
        body('cardId')
            .not()
            .isEmpty()
            .custom((input: string) =>
                mongoose.Types.ObjectId.isValid(input))
            .withMessage('CardId is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {cardId} = req.body;

        const card = await Card.findById(cardId);

        if (!card) {
            throw new NotFoundError;
        }


        const isReserved = await card.isReserved();

        if (isReserved) {
            throw new BadRequestError('Card is already reserved');
        }

        // Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // Build the order and save it to the db
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            card
        });

        await order.save();

        // Publish an event saying that an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            card: {
                id: card.id,
                price: card.price
            },
            version: order.version
        });

        res.status(201).send(order);
    });

export {router as newOrderRouter};
