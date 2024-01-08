import Queue from 'bull';
import { ExpirationCompletePublisher } from './events/publishers/expiration-complete-publisher';
import natsWrapper from './nats-wrapper';

interface OrderJob {
  orderId: string;
}

const expirationQueue = new Queue<OrderJob>('expiration-queue', {
  redis: { host: process.env.REDIS_URI },
});

expirationQueue.process(async function (job) {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
