import mongoose from 'mongoose';
import { OrderStatus } from '@gellert-ticketing/common';
import { TicketDoc } from './ticket-model';

export { OrderStatus };

interface OrderAttr {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build: (attrs: OrderAttr) => OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      required: true,
      type: Date,
    },
    ticket: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret._id;
      },
      virtuals: true,
    },
    optimisticConcurrency: true,
  }
);

orderSchema.set('versionKey', 'version');

orderSchema.statics.build = function (attrs: OrderAttr) {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
