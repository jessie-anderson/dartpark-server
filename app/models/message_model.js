import mongoose, { Schema } from 'mongoose';

// message schema
// "sender" will be either "renter" or "vendor" so we know which
// name in the conversation to attach to the message
const MessageSchema = new Schema({
  timestamp: Date,
  text: String,
  sender: String,
});

// create model class
const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
