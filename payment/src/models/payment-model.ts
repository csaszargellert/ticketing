import mongoose from 'mongoose';

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  version: number;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build: (attrs: PaymentAttrs) => PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
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

paymentSchema.set('versionKey', 'version');

paymentSchema.statics.build = function (attrs: PaymentAttrs) {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
