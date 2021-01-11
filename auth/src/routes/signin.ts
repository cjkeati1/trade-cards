import express, {Request, Response} from 'express';
import {body, validationResult} from "express-validator";
import jwt from 'jsonwebtoken';

import {User} from "../models/user";
import {RequestValidationError} from "../errors/request-validation-error";
import {BadRequestError} from "../errors/bad-request-error";

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const {email} = req.body;

    const existingUser = await User.findOne({email});

    if (!existingUser) {
        throw new BadRequestError('A user with that email does not exist');
    }
});

export {router as signinRouter};
