import express, {Request, Response} from 'express';
import {NotFoundError} from '@ckcards/common';
import {Card} from "../models/card";

const router = express.Router();

router.get('/api/cards/:id', async (req: Request, res: Response) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        throw new NotFoundError();
    }

    res.send(card);
});

export {router as showCardRouter};
