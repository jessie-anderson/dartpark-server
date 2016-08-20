import mongoose, { Schema } from 'mongoose';

// spot schema
const SpotSchema = new Schema({
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
  },
  address: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  number: {
    type: String,
    default: '',
  },
  renter: {
    type: Schema.Types.ObjectId,
    ref: 'Renter',
    default: null,
  },
});

// create model class
const SpotModel = mongoose.model('Spot', SpotSchema);

export default SpotModel;
