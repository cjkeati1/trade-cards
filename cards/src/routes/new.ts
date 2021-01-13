import express, {Request, Response} from "express";
import {requireAuth, validateRequest, CardCondition} from "@ckcards/common";
import {body} from "express-validator";
import {Card} from "../models/card";

const router = express.Router();

router.post('/api/cards', requireAuth, requireAuth, [
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
    const {title, condition, description, price} = req.body;

    const card = Card.build({
        title,
        condition,
        description,
        price,
        userId: req.currentUser!.id
    });

    await card.save();

    res.status(201).send(card);
});
export {router as createCardRouter};
