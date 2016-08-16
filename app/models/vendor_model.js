import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const VendorSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: String,
  name: String,
  bio: String,
  spots: [{
    type: Schema.Types.ObjectId,
    ref: 'Spot',
  }],
  renters: [{
    type: Schema.Types.ObjectId,
    ref: 'Renter',
  }],
  conversations: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
}, {
  timestamp: true,
});

const VendorModel = mongoose.model('Vendor', VendorSchema);

export default VendorModel;
