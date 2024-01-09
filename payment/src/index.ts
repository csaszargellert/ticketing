import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import {
  NotFoundError,
  ErrorHandler,
  currentUser,
} from '@gellert-ticketing/common';

import { createPaymentRouter } from './routes/new-payment';
import natsWrapper from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(
  cookieSession({
    secure: true,
    signed: false,
  })
);

app.use(currentUser);
app.use(createPaymentRouter);

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
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('No NATS_CLUSTER_ID secret is provided!');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('No NATS_CLIENT_ID secret is provided!');
  }
  if (!process.env.NATS_SERVER_URL) {
    throw new Error('No NATS_SERVER_URL secret is provided!');
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error('No NATS_SERVER_URL secret is provided!');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_SERVER_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGTERM', () => natsWrapper.client.close());
    process.on('SIGINT', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log('Payment is listening on port 3000');
  });
};

startup();
