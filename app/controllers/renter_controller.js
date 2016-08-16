import Renter from '../models/renter_model';
import Conversation from '../models/conversation_model';

export const createRenter = (req, res) => {
  try {
    const renter = new Renter();
    const conversationHead = new Conversation();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.name === 'undefined') {
      res.json({
        error: 'ERR: Renters need \'email\', \'password\', and  \'name\' fields',
      });
    } else {
      renter.email = req.body.email;
      renter.password = req.body.password;
      renter.name = req.body.name;

      if (typeof renter.bio !== 'undefined') {
        renter.bio = req.body.bio;
      }

      conversationHead.renter = renter._id;
      conversationHead.next.renter = conversationHead.prev.renter = conversationHead._id;
      conversationHead.head = true;

      conversationHead.save()
      .then(resultConvo => {
        try {
          renter.conversations = resultConvo._id;

          renter.save()
          .then(result => {
            console.log(result);
            try {
              res.json({ message: `Renter created with \'id\' ${result._id}!` });
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
//
// export const buySpot = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const getSpots = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const getSpot = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const deleteSpot = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
//
// export const sendMessage = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const deleteConversation = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const updateBio = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const updateProfilePicture = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const addCard = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const addCard = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const deleteCard = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const addCar = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const deleteCar = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
// export const changePassword = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
