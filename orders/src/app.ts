import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";

import {errorHandler, NotFoundError, currentUser} from "@ckcards/common";
import {newOrderRouter} from "./routes/new";
import {showOrderRouter} from "./routes/show";
import {cancelOrderRouter} from "./routes/delete";
import {indexOrderRouter} from "./routes";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);


app.use(currentUser);

app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(cancelOrderRouter);
app.use(indexOrderRouter);

// User goes to a route that is not defined
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
