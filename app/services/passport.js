import passport from 'passport';
import LocalStrategy from 'passport-local';
import CustomStrategy from 'passport-custom';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';
import { userFromToken } from '../utils';

// and import User and your config with the secret
import Renter from '../models/renter_model';
import Vendor from '../models/vendor_model';

// options for local strategy, we'll use email AS the username
// not have separate ones
const localOptions = { usernameField: 'email' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there

const extractAuthRenter = req => {
  try {
    const token = !req.headers ? null : req.headers.authorizationrenter;

    console.log(token);

    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const extractAuthVendor = req => {
  try {
    const token = !req.headers ? null : req.headers.authorizationvendor;

    console.log(token);

    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const jwtOptionsRenter = {
  jwtFromRequest: extractAuthRenter,
  secretOrKey: config.secret,
};

const jwtOptionsVendor = {
  jwtFromRequest: extractAuthVendor,
  secretOrKey: config.secret,
};

const jwtOptionsVersatile = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
};

// username + password authentication strategy
const localLoginRenter = new LocalStrategy(localOptions, (email, password, done) => {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  Renter.findOne({ email }, (err, renter) => {
    if (err) { return done(err); }

    if (!renter) { return done(null, false); }

    // compare passwords - is `password` equal to user.password?
    renter.comparePassword(password, (err, isMatch) => {
      if (err) {
        done(err);
      } else if (!isMatch) {
        done(null, false);
      } else {
        done(null, renter);
      }
    });
  });
});


const localLoginVendor = new LocalStrategy(localOptions, (email, password, done) => {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  console.log(email, password);
  Vendor.findOne({ email }, (err, vendor) => {
    if (err) { return done(err); }

    if (!vendor) { return done(null, false); }

    console.log(vendor);

    // compare passwords - is `password` equal to user.password?
    vendor.comparePassword(password, (err, isMatch) => {
      if (err) {
        console.log(err);
        done(err);
      } else if (!isMatch) {
        done(null, false);
      } else {
        console.log(vendor);
        done(null, vendor);
      }
    });
  });
});

const jwtLoginRenter = new JwtStrategy(jwtOptionsRenter, (payload, done) => {
  console.log(payload);
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  Renter.findById(payload.sub, (err, renter) => {
    if (err) {
      done(err, false);
    } else if (renter) {
      done(null, renter);
    } else {
      done(null, false);
    }
  });
});

const jwtLoginVendor = new JwtStrategy(jwtOptionsVendor, (payload, done) => {
  console.log(payload);
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  Vendor.findById(payload.sub, (err, vendor) => {
    if (err) {
      done(err, false);
    } else if (vendor) {
      done(null, vendor);
    } else {
      done(null, false);
    }
  });
});


const jwtLoginVersatile = new CustomStrategy((req, done) => {
  try {
    const token = jwtOptionsVersatile.jwtFromRequest(req);
    let decodedToken;
    let userId;
    let User;
    let parameters;
    let userSpecifier;

    if (!token) {
      done('Unauthorized');
    } else if (req.body || req.params) {
      decodedToken = userFromToken(token);

      if (decodedToken == null) {
        done('Unauthorized');
      } else {
        userId = decodedToken.sub;

        if ((req.body.requester && req.body.sender) || (req.params.requester && req.params.sender)) {
          done('Incomplete request.');
        } else {
          parameters = req.body.requester || req.body.sender ? req.body : req.params;
          userSpecifier = parameters.requester ? parameters.requester : parameters.sender;

          User = userSpecifier === 'renter' ? Renter : Vendor;

          User.findById(userId)
          .then(user => {
            try {
              if (user) {
                done(null, user);
              } else {
                done(null, false);
              }
            } catch (err) {
              done(err);
            }
          })
          .catch(error => {
            done(error);
          });
        }
      }
    } else {
      done('Incomplete request.');
    }
  } catch (err) {
    done(err);
  }
});

// Tell passport to use this strategy
passport.use('renterLogin', localLoginRenter);
passport.use('vendorLogin', localLoginVendor);

passport.use('renterAuth', jwtLoginRenter);
passport.use('vendorAuth', jwtLoginVendor);
passport.use('versatileAuth', jwtLoginVersatile);


export const requireSigninRenter = passport.authenticate('renterLogin', { session: false });
export const requireSigninVendor = passport.authenticate('vendorLogin', { session: false });

export const requireAuthRenter = passport.authenticate('renterAuth', { session: false });
export const requireAuthVendor = passport.authenticate('vendorAuth', { session: false });

export const requireAuthVersatile = passport.authenticate('versatileAuth', { session: false });
