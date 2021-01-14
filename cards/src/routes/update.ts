import express, {Request, Response} from "express";
import {body} from "express-validator";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError,
    CardCondition
} from "@ckcards/common";
import {Card} from "../models/card";

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

    res.send(card);
});

export {router as updateCardRouter};
