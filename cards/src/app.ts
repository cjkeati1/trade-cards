import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";

import {errorHandler, NotFoundError, currentUser} from "@ckcards/common";
import {createCardRouter} from "./routes/new";
import {showCardRouter} from "./routes/show";
import {indexCardRouter} from "./routes";
import {updateCardRouter} from "./routes/update";

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

app.use(showCardRouter);
app.use(createCardRouter);
app.use(indexCardRouter);
app.use(updateCardRouter);

// User goes to a route that is not defined
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
