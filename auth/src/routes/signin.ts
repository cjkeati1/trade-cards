import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {User} from "../models/user";
import {BadRequestError} from "../errors/bad-request-error";
import {validateRequest} from "../middleware/validate-request";

const router = express.Router();

router.post('/api/users/signin', validateRequest,
   async (req: Request, res: Response) => {

    const {email} = req.body;

    const existingUser = await User.findOne({email});

    if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
    }
});

export {router as signinRouter};
