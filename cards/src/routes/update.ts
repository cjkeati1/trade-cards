import express, {Request, Response} from "express";
import {body} from "express-validator";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError,
    CardCondition,
    BadRequestError
} from "@ckcards/common";
import {Card} from "../models/card";
import {CardCreatedPublisher} from "../events/publishers/card-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.put('/api/cards/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('condition')
        .not()
        .isEmpty()
        .custom((input: string) =>
            (Object.values(CardCondition) as string[])
                .includes(input))
        .withMessage('Not a valid card condition'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        throw new NotFoundError;
    }

    // Don't update if the card is reserved
    if (card.orderId !== undefined) {
        throw new BadRequestError('Cannot edit a reserved card');
    }

    if (card.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError;
    }
    const {title, price, description, condition} = req.body;

    card.set({
        title,
        price,
        description,
        condition
    });

    await card.save();

    new CardCreatedPublisher(natsWrapper.client).publish({
        id: card.id,
        title: card.title,
        description: card.description,
        condition: card.condition,
        price: card.price,
        userId: card.userId,
        version: card.version
    });


    res.send(card);
});

export {router as updateCardRouter};
