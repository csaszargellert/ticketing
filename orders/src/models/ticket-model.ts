import mongoose from 'mongoose';

import { Order, OrderStatus } from './order-model';

interface TicketAttr {
  id: string;
  title: string;
  price: number;
  version: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved: () => Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build: (attrs: TicketAttr) => TicketDoc;
  findByEvent: (event: { id: string; version: number }) => TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

ticketSchema.set('versionKey', 'version');
ticketSchema.pre('save', function (done) {
  this.$where = {
    version: this.get('version') - 1,
  };

  done();
});

ticketSchema.statics.build = function (attrs: TicketAttr) {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
    version: attrs.version,
  });
};

ticketSchema.statics.findByEvent = function (event: {
  id: string;
  version: number;
}) {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.AwaitingPayment,
        OrderStatus.Created,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
