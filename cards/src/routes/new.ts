import express, {Request, Response} from "express";
import {requireAuth} from "@ckcards/common";

const router = express.Router();

router.post('/api/cards', requireAuth, (req: Request, res: Response) => {
    res.sendStatus(200);
});

export {router as createCardRouter};
