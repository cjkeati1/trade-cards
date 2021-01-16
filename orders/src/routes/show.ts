import express, {Request, Response} from "express";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError
} from "@ckcards/common";
import {param} from "express-validator";
import mongoose from "mongoose";
import {Order} from "../models/order";

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth,
    [
        param('orderId')
            .not()
            .isEmpty()
            .custom((input: string) =>
                mongoose.Types.ObjectId.isValid(input))
            .withMessage('A valid OrderId is required'),
    ],
    validateRequest, async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('card');

        if (!order) {
            return new NotFoundError();
        }

        if (req.currentUser!.id !== order.userId) {
            return new NotAuthorizedError();
        }

        res.send(order);
    });

export {router as showOrderRouter};
