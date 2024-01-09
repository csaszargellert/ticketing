import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { CurrentUserRouter } from './routes/current-user';
import { SignoutRouter } from './routes/signout';
import { SigninRouter } from './routes/signin';
import { SignupRouter } from './routes/signup';
import { ErrorHandler, NotFoundError } from '@gellert-ticketing/common';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(
  cookieSession({
    secure: false,
    signed: false,
  })
);
console.log('CHANGE');
app.use(CurrentUserRouter);
app.use(SignoutRouter);
app.use(SigninRouter);
app.use(SignupRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(ErrorHandler);

const startup = async function () {
  if (!process.env.JWT_KEY) {
    throw new Error('No JWT_KEY secret is provided!');
  }

  if (!process.env.DB_URI) {
    throw new Error('No DB_URI secret is provided!');
  }

  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log('Auth is listening on port 3000');
  });
};

startup();
