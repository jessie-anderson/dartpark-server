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
  bio: String,
  spots: {
    type: [Schema.Types.ObjectId],
    ref: 'Spot',
  },
  cards: {
    type: [Schema.Types.ObjectId],
    ref: 'Card',
  },
  cars: {
    type: [Schema.Types.ObjectId],
    ref: 'Car',
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
