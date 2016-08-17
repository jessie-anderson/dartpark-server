import Vendor from '../models/vendor_model';
import Conversation from '../models/conversation_model';

export const createVendor = (req, res) => {
  try {
    const vendor = new Vendor();
    const conversationHead = new Conversation();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.name === 'undefined') {
      res.json({
        error: 'ERR: Vendors need \'email\', \'password\', and  \'name\' fields',
      });
    } else {
      vendor.email = req.body.email;
      vendor.password = req.body.password;
      vendor.name = req.body.name;

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
                id: result._id,
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

// ========================= add routes for these ========================== //

export const updateBio = (req, res) => {
  try {
    if (typeof req.body.bio === 'undefined') {
      res.json({ error: 'request body must include \'bio\' field' });
      return;
    }
    Vendor.findById(req.params.vendorId)
    .then(vendor => {
      const updatedVendor = Object.assign({}, vendor._doc, { bio: req.body.bio });
      Vendor.update({ _id: req.params.vendorId }, updatedVendor)
      .then(success => {
        res.json(success);
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
    Vendor.findById(req.params.vendorId)
    .then(vendor => {
      const updatedVendor = Object.assign({}, vendor._doc, { password: req.body.password });
      Vendor.update({ _id: req.params.vendorId }, updatedVendor)
      .then(success => {
        res.json(success);
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

export const getSpots = (req, res) => {
  try {
    Vendor.findById(req.params.vendorId)
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
