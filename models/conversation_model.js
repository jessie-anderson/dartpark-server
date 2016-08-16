import mongoose, { Schema } from 'mongoose';

// conversation schema
const ConversationSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
  renter: { type: Schema.Types.ObjectId, ref: 'Renter', default: null },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message', default: [] }],
  prev: {
    renter: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    vendor: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  },
  next: {
    renter: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    vendor: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  },
  head: { type: Boolean, default: false },
});

// create model class
const ConversationModel = mongoose.model('Conversation', ConversationSchema);

export default ConversationModel;
