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
import {Card} from "../../models/card";
import {Order} from "../../models/order";

const router = express.Router();

router.post('/api/orders',
    requireAuth,
    [
        body('cardId')
            .not()
            .isEmpty()
            .custom((input: string) =>
                mongoose.Types.ObjectId.isValid(input))
            .withMessage('CardId is required'),
        body('price')
            .isFloat({gt: 0})
            .withMessage('Price must be greater than 0'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {cardId} = req.body;

        const card = await Card.findById(cardId);

        if (!card) {
            throw new NotFoundError;
        }


        const isReserved = card.isReserved();
        
        if (isReserved) {
            throw new BadRequestError('Card is already reserved');
        }

        // Calculate an expiration date for this order

        // Build the order and save it to the db

        // Publish an event saying that an order was created

    });

export {router as newOrderRouter};
