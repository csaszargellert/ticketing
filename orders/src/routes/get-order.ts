import express, { Request, Response } from 'express';
import { NotFoundError, NotAuthorizedError } from '@gellert-ticketing/common';

import { Order } from '../models/order-model';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  async function (req: Request, res: Response) {
    const existingOrder = await Order.findById(req.params.orderId);

    if (!existingOrder) {
      throw new NotFoundError();
    }
    if (existingOrder.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.status(200).send(existingOrder);
  }
);

export { router as getOrderRouter };
