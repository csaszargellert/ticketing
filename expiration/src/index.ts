import natsWrapper from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const startup = async function () {
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('No NATS_CLUSTER_ID secret is provided!');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('No NATS_CLIENT_ID secret is provided!');
  }
  if (!process.env.NATS_SERVER_URL) {
    throw new Error('No NATS_SERVER_URL secret is provided!');
  }
  if (!process.env.REDIS_URI) {
    throw new Error('No REDIS_URI secret is provided!');
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
  } catch (error) {
    console.log(error);
  }
};
startup();
