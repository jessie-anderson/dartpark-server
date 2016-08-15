import mongoose, { Schema } from 'mongoose';

// conversation schema
const ConversationSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  renter: { type: Schema.Types.ObjectId, ref: 'Renter' },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  prev: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  next: { type: Schema.Types.ObjectId, ref: 'Conversation' },
});

// create model class
const ConversationModel = mongoose.model('Conversation', ConversationSchema);

export default ConversationModel;
