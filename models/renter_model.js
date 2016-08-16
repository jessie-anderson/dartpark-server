import mongoose, { Schema } from 'mongoose';

// create a schema for posts with a field
const RenterSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: String,
  name: String,
  bio: {
    type: String,
    default: '',
  },
  spots: {
    type: [Schema.Types.ObjectId],
    ref: 'Spot',
    default: [],
  },
  cards: {
    type: [Schema.Types.ObjectId],
    ref: 'Card',
    default: [],
  },
  cars: {
    type: [Schema.Types.ObjectId],
    ref: 'Car',
    default: [],
  },
  conversations: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
}, {
  timestamp: true,
}
);

const RenterModel = mongoose.model('Renter', RenterSchema);

export default RenterModel;
