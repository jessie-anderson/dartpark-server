import mongoose, { Schema } from 'mongoose';

// conversation schema
const ConversationHeadSchema = new Schema({
  next: { type: Schema.Types.ObjectId, ref: 'Conversation' },
});

// create model class
const ConversationHeadModel = mongoose.model('ConversationHead', ConversationHeadSchema);

export default ConversationHeadModel;
