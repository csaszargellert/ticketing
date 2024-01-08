import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import {
  NotFoundError,
  ErrorHandler,
  currentUser,
  requireAuth,
} from '@gellert-ticketing/common';

import natsWrapper from './nats-wrapper';
import { newOrderRouter } from './routes/new-order';
import { cancelOrderRouter } from './routes/cancel-order';
import { getOrderRouter } from './routes/get-order';
import { getAllOrdersRouter } from './routes/get-all-orders';

import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

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
app.use(requireAuth);

app.use(newOrderRouter);
app.use(cancelOrderRouter);
app.use(getOrderRouter);
app.use(getAllOrdersRouter);

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

    new TicketUpdatedListener(natsWrapper.client).listen();
    new TicketCreatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log('Orders is listening on port 3000');
  });
};

startup();
