import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

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


RenterSchema.pre('save', function encryptPassword(next) {
  try {
    const renter = this;

    if (!renter.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
      try {
        if (err) { return next(err); }

        // hash (encrypt) our password using the salt
        bcrypt.hash(renter.password, salt, null, (err, hash) => {
          try {
            if (err) { return next(err); }

            // overwrite plain text password with encrypted password
            renter.password = hash;
            return next();
          } catch (err) {
            next(err);
          }
        });
      } catch (err) {
        return next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
});

RenterSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  try {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      try {
        if (err) { return callback(err); }

        callback(null, isMatch);
      } catch (err) {
        callback(err);
      }
    });
  } catch (err) {
    callback(err);
  }
};

const RenterModel = mongoose.model('Renter', RenterSchema);

export default RenterModel;
