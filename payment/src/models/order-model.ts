import mongoose from 'mongoose';
import { OrderStatus } from '@gellert-ticketing/common';

interface OrderAttrs {
  id: string;
  userId: string;
  version: number;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  price: number;
  status: OrderStatus;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build: (attrs: OrderAttrs) => OrderDoc;
  findByEvent: (data: { id: string; version: number }) => Promise<OrderDoc>;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      required: true,
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret._id;
      },
      virtuals: true,
    },
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.pre('save', function (done) {
  this.$where = {
    version: this.get('version') - 1,
  };
  done();
});

orderSchema.statics.build = function (attrs: OrderAttrs) {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    version: attrs.version,
    price: attrs.price,
    status: attrs.status,
  });
};

orderSchema.statics.findByEvent = function (data: {
  id: string;
  version: number;
}) {
  return Order.findOne({
    _id: data.id,
    version: data.version - 1,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
