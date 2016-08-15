import mongoose, { Schema } from 'mongoose';

// card schema
const CardSchema = new Schema({
  number: Number,
  securityCode: Number,
  expirationDate: String,
  nameOnCard: String,
  billingAddress: {
    streetAddress: String,
    city: String,
    state: String,
    zipCode: Number,
  },
  owner: { type: Schema.Types.ObjectId, ref: 'Renter' },
});

// create model class
const CardModel = mongoose.model('Card', CardSchema);

export default CardModel;
