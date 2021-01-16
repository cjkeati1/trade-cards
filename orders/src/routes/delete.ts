import express, {Request, Response} from "express";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus
} from "@ckcards/common";
import {Order} from "../models/order";
import {param} from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.patch('/api/orders/:orderId', requireAuth,
    [
        param('orderId')
            .not()
            .isEmpty()
            .custom((input: string) =>
                mongoose.Types.ObjectId.isValid(input))
            .withMessage('A valid OrderId is required'),
    ],
    validateRequest, async (req: Request, res: Response) => {
        const {orderId} = req.params;

        const order = await Order.findById(orderId).populate('card');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();


        res.status(204).send(order);
    });

export {router as cancelOrderRouter};
