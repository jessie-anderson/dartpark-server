import mongoose, { Schema } from 'mongoose';

// car schema
const CarSchema = new Schema({
  make: String,
  model: String,
  year: String,
  color: String,
  plateNumber: String,
  owner: { type: Schema.Types.ObjectId, ref: 'Renter' },
});

// create model class
const CarModel = mongoose.model('Car', CarSchema);

export default CarModel;
