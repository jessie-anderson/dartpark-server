import mongoose, { Schema } from 'mongoose';

// message schema
const MessageSchema = new Schema({
  timestamp: Date,
  text: String,
  sender: String,
});

// create model class
const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
