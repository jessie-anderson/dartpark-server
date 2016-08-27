import mongoose, { Schema } from 'mongoose';

// car schema
const CarSchema = new Schema({
  make: {
    type: String,
    default: '',
  },
  model: {
    type: String,
    default: '',
  },
  year: {
    type: String,
    default: '',
  },
  paintcolor: {
    type: String,
    default: '',
  },
  plateNumber: {
    type: String,
    default: '',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Renter',
    default: null,
  },
  picUrl: {
    type: String,
    default: '',
  },
});

// create model class
const CarModel = mongoose.model('Car', CarSchema);

export default CarModel;
