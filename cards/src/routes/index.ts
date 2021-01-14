import express, {Request, Response} from 'express';
import {Card} from '../models/card';

const router = express.Router();

router.get('/api/cards/', async (req: Request, res: Response) => {
    const cards = await Card.find({});

    res.send(cards);
});

export {router as indexCardRouter};
