import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

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
  spots: {
    type: [Schema.Types.ObjectId],
    ref: 'Spot',
  },
  vendors: {
    type: [Schema.Types.ObjectId],
    ref: 'Renter',
  },
  conversations: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
}, {
  timestamp: true,
}
);

VendorSchema.pre('save', function encryptPassword(next) {
  try {
    const vendor = this;

    if (!vendor.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
      try {
        if (err) { return next(err); }

        // hash (encrypt) our password using the salt
        bcrypt.hash(vendor.password, salt, null, (err, hash) => {
          try {
            if (err) { return next(err); }

            // overwrite plain text password with encrypted password
            vendor.password = hash;
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

// note use of named function rather than arrow notation
//  this arrow notation is lexically scoped and prevents binding scope, which mongoose relies on
VendorSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
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

const VendorModel = mongoose.model('Vendor', VendorSchema);

export default VendorModel;
