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
            console.log(result);
            try {
              res.json({ message: `Vendor created with \'id\' ${result._id}!` });
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
