import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const CarSchema = new Schema({
  make: String,
  model: String,
  year: String,
  plateNumber: String,
  owner: { type: Schema.Types.ObjectId, ref: 'Renter' },
});

// create model class
const CarModel = mongoose.model('Car', CarSchema);

export default CarModel;
