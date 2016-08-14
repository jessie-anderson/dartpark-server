import mongoose, { Schema } from 'mongoose';

// spot schema
const SpotSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  address: String,
  price: Number,
  renter: { type: Schema.Types.ObjectId, ref: 'Renter', default: null },
});

// create model class
const SpotModel = mongoose.model('Spot', SpotSchema);

export default SpotModel;
