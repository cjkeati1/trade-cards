import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

// Tell TS the express request object has an optional currentUser field
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // IF there is no JWT, then dont set the currentUser
    if (!req.session?.jwt) {
        return next();
    }

    try {
        req.currentUser = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    } catch (e) {

    }

    next();
};
