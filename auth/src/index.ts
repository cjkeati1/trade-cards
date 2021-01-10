import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";

import {currentUserRouter} from "./routes/current-user";
import {signoutRouter} from "./routes/signout";
import {signinRouter} from "./routes/signin";
import {signupRouter} from "./routes/signup";
import {errorHandler} from "./middleware/error-handler";
import {NotFoundError} from "./errors/not-found-error";
import mongoose from "mongoose";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: true
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.use(errorHandler);

// User goes to a route that is not defined
app.all('*', async () => {
    throw new NotFoundError();
});

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    try {
        await mongoose.connect('mongodb://cards-auth-mongo-srv:27017/auth', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        console.log('Connected to MongoDB');
    } catch (e) {
        console.log(e);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
};

start();
