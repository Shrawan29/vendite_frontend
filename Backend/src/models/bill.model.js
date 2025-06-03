import mongoose,{Schema} from 'mongoose';

const billSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      email: {
        type: String
      }
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: {
          type: mongoose.Schema.Types.String,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        unitPrice: {
          type: Number,
          required: true
        },
        tax:{
          type: Number,
          default: 0,
          required: true
        },
        totalPrice: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    },
    totalTax:{
        type: Number,
        default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash','Online'],
      required: true
    }
  },
  { timestamps: true }
);

// Virtual to calculate total amount after discount and tax
// Virtual to calculate finalAmount (after applying discount and tax)
billSchema.index({ invoiceNumber: 1 }, { unique: true });

  
  // Calculate the total amount (sum of all product prices) and taxes before saving
  billSchema.pre('save', function (next) {
    this.totalAmount = this.products.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );
    next();
  });

const Bill = mongoose.model('Bill', billSchema);

export { Bill };
