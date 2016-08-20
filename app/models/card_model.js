import mongoose, { Schema } from 'mongoose';

// card schema
const CardSchema = new Schema({
  number: {
    type: String,
    default: '',
  },
  securityCode: {
    type: String,
    default: '',
  },
  expirationDate: {
    type: String,
    default: '',
  },
  nameOnCard: {
    type: String,
    default: '',
  },
  billingAddress: {
    streetAddress: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    zipCode: {
      type: String,
      default: '',
    },
  },
  owner: { type: Schema.Types.ObjectId, ref: 'Renter' },
});

// create model class
const CardModel = mongoose.model('Card', CardSchema);

export default CardModel;
