import express, {Request, Response} from 'express';
import {body} from "express-validator";
import jwt from 'jsonwebtoken';

import {User} from "../models/user";
import {validateRequest} from "@ckcards/common/build/middlewares/validate-request";
import {BadRequestError} from "@ckcards/common/build/errors/bad-request-error";

const router = express.Router();

router.post('/api/users/signup', [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email});

        if (existingUser) {
            throw new BadRequestError('Email is already in use');
        }

        // If a user with that email DNE, create one and persist to db
        const user = User.build({email, password});
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY! // The ! tells TS that we 100% know JWT_KEY will be defined
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);

    });
export {router as signupRouter};
