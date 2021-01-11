import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {User} from "../models/user";
import {BadRequestError} from "../errors/bad-request-error";
import {validateRequest} from "../middlewares/validate-request";
import {PasswordManager} from "../../services/passwordManager";

const router = express.Router();

router.post('/api/users/signin', validateRequest,
    async (req: Request, res: Response) => {

        const {email, password} = req.body;

        const existingUser = await User.findOne({email});

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await PasswordManager.compare(
            existingUser.password,
            password
        );

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email
            },
            process.env.JWT_KEY! // The ! tells TS that we 100% know JWT_KEY will be defined
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    });

export {router as signinRouter};
