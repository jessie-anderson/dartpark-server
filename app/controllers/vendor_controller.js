import Vendor from '../models/vendor_model';
import Conversation from '../models/conversation_model';
import bcrypt from 'bcrypt-nodejs';

import { tokenForUser } from '../utils';

export const createVendor = (req, res) => {
  try {
    const vendor = new Vendor();
    const conversationHead = new Conversation();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.username === 'undefined') {
      res.json({
        error: 'ERR: Vendors need \'email\', \'password\', and  \'username\' fields',
      });
    } else {
      vendor.email = req.body.email;
      vendor.password = req.body.password;
      vendor.username = req.body.username;

      if (typeof vendor.bio !== 'undefined') {
        vendor.bio = req.body.bio;
      }

      conversationHead.vendor = vendor._id;
      conversationHead.next.vendor = conversationHead.prev.vendor = conversationHead._id;
      conversationHead.head = true;

      conversationHead.save()
      .then(resultConvo => {
        try {
          vendor.conversations = resultConvo._id;

          vendor.save()
          .then(result => {
            try {
              res.json({
                vendor: result,
                token: tokenForUser(result),
                message: `Vendor created with \'id\' ${result._id}!`,
              });
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const updateBioAndName = (req, res) => {
  try {
    if (typeof req.body.bio === 'undefined' || typeof req.body.username === 'undefined') {
      res.json({ error: 'request body must include \'bio\' and \'username\' fields' });
      return;
    }
    Vendor.findById(req.user._id)
    .then(vendor => {
      const updatedVendor = Object.assign({}, vendor._doc, { bio: req.body.bio, username: req.body.username });
      Vendor.update({ _id: req.user._id }, updatedVendor)
      .then(success => {
        Vendor.findById(req.user._id)
        .then(newVendor => {
          res.json(newVendor);
        })
        .catch(err => {
          res.json({ findVendorError2: err });
        });
      })
      .catch(err => {
        res.json({ vendorUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ vendorFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const changePassword = (req, res) => {
  try {
    if (typeof req.body.password === 'undefined') {
      res.json({ error: 'request body must include \'password\' field' });
      return;
    }
    Vendor.findById(req.user._id)
    .then(vendor => {
      bcrypt.genSalt(10, (err, salt) => {
        try {
          if (err) {
            res.json({ saltErr: err });
            return;
          }
          bcrypt.hash(req.body.password, salt, null, (err, hash) => {
            try {
              if (err) {
                res.json({ hashErr: err });
                return;
              }
              const updatedVendor = Object.assign({}, vendor._doc, { password: hash });
              Vendor.update({ _id: vendor._id }, updatedVendor)
              .then(success => {
                Vendor.findById(req.user._id)
                .then(newVendor => {
                  res.json(newVendor);
                })
                .catch(err => {
                  res.json({ vendorFindError2: err });
                });
              })
              .catch(err => {
                res.json({ vendorUpdateError: err });
              });
            } catch (err) {
              res.json({ hashErr: err });
            }
          });
        } catch (err) {
          res.json({ saltErr: err });
        }
      });
    })
    .catch(err => {
      res.json({ vendorFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const getSpots = (req, res) => {
  try {
    Vendor.findById(req.user._id)
    .populate('spots')
    .then(response => {
      res.json(response.spots);
    })
    .catch(err => {
      res.json({ errorPopulatingSpots: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const signin = (req, res) => {
  try {
    Vendor.findById(req.user._id)
    .then(vendor => {
      res.json({
        vendor,
        token: tokenForUser(req.user),
      });
    })
    .catch(err => {
      res.json({ vendorFindError: err });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};
