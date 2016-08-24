import Renter from '../models/renter_model';
import Conversation from '../models/conversation_model';
import Spot from '../models/spot_model';
import Vendor from '../models/vendor_model';
import { tokenForUser } from '../utils';
import bcrypt from 'bcrypt-nodejs';

export const createRenter = (req, res) => {
  try {
    const renter = new Renter();
    const conversationHead = new Conversation();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.username === 'undefined') {
      console.log('not all fields present');
      res.json({
        error: 'ERR: Renters need \'email\', \'password\', and  \'username\' fields',
      });
    } else {
      renter.email = req.body.email;
      renter.password = req.body.password;
      renter.username = req.body.username;

      if (typeof req.body.bio !== 'undefined') {
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
            try {
              res.json({
                renter: result,
                token: tokenForUser(result),
                message: `Renter created with \'id\' ${result._id}!`,
              });
            } catch (err) {
              console.log(`res json error: ${err}`);
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            console.log(`renter save error: ${error}`);
            res.json({ error: `${error}` });
          });
        } catch (err) {
          console.log(`general error level 2: ${err}`);
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        console.log(`conversation save error: ${error}`);
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    console.log(`general error: ${err}`);
    res.json({ error: `${err}` });
  }
};

export const signin = (req, res) => {
  try {
    Renter.findById(req.user._id)
    .then(renter => {
      res.json({
        renter,
        token: tokenForUser(req.user),
      });
    })
    .catch(err => {
      res.json({ renterFindError: err });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const buySpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId).then(spot => {
      if (spot.renter === null) {
        Renter.findById(req.user._id).then(renter => {
          const updatedSpot = Object.assign({}, spot._doc, { renter: renter._id });

          // update the spot to show that it has a renter
          Spot.update({ _id: req.params.spotId }, updatedSpot)
          .then(spotSuccess => {
            renter.spots.push(req.params.spotId);

            // update the renter's spot list to include spot they bought
            const updatedRenter = Object.assign({}, renter._doc, { spots: renter.spots });
            Renter.update({ _id: renter._id }, updatedRenter)
            .then(renterSuccess => {
              Vendor.findById(spot.vendor)
              .then(vendor => {
                // if the renter isn't already in the vendor's list...
                if (vendor.renters.find(curId => {
                  return String(curId).valueOf() === String(renter._id).valueOf();
                }) === undefined) {
                  vendor.renters.push(renter._id);

                  // add this renter to the spot's vendor's list of renters
                  const updatedVendor = Object.assign({}, vendor._doc, { renters: vendor.renters });
                  Vendor.update({ _id: vendor._id }, updatedVendor)
                  .then(vendorSuccess => {
                    // find updated renter and spot and send them to frontend
                    Renter.findOne({ _id: renter._id })
                    .populate('spots')
                    .then(newRenter => {
                      Spot.findById(req.params.spotId)
                      .then(newSpot => {
                        res.json({ renter: newRenter, spot: newSpot });
                      })
                      .catch(err => {
                        res.json({ spotFindError: err });
                      });
                    })
                    .catch(err => {
                      res.json({ renterFindError: err });
                    });
                  })
                  .catch(err => {
                    res.json({ errorUpdatingVendor: err });
                  });
                }
              })

              // now all the error catching...
              .catch(err => {
                res.json({ errorFindingVendor: err });
              });
            })
            .catch(err => {
              res.json({ errorUpdatingRenter: err });
            });
          })
          .catch(err => {
            res.json({ errorUpdatingSpot: err });
          });
        })
        .catch(err => {
          res.json({ errorFindingRenter: err });
        });
      } else {
        throw new alreadyBoughtException();
      }
    })
    .catch(err => {
      res.json({ errorFindingSpot: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

function alreadyBoughtException() {
  this.name = 'err_already_purchased';
  this.message = 'Error: spot already purchased';
}

export const getSpots = (req, res) => {
  try {
    Renter.findById(req.user._id)
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

export const deleteSpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId)
    .then(spot => {
      Renter.findById(req.user._id)
      .then(renter => {
        const idIndex = findIndexOfItem(req.params.spotId, renter.spots);
        if (idIndex === -1) {
          res.json({ error: `spot ${req.params.spotId} not in renter ${renter._id}\'s spot list` });
          return;
        }

        renter.spots.splice(idIndex, 1);

        const newRenter = Object.assign({}, renter._doc, { spots: renter.spots });
        Renter.update({ _id: renter._id }, newRenter)
        .then(renterUpdateSuccess => {
          const newSpot = Object.assign({}, spot._doc, { renter: null });
          Spot.update({ _id: req.params.spotId }, newSpot)
          .then(spotUpdateSuccess => {
            Renter.findById(renter._id)
            .populate('spots')
            .then(populatedRenter => {
              let vendorStillInSpots = false;
              for (let i = 0; i < populatedRenter.spots.length; i++) {
                if (String(populatedRenter.spots[i].vendor).valueOf() === String(spot.vendor).valueOf()) {
                  vendorStillInSpots = true;
                }
              }
              if (!vendorStillInSpots) {
                Vendor.findById(spot.vendor)
                .then(vendor => {
                  const renterIndex = findIndexOfItem(renter._id, vendor.renters);
                  if (renterIndex !== -1) {
                    vendor.renters.splice(renterIndex, 1);
                    const updatedVendor = Object.assign({}, vendor._doc, { renters: vendor.renters });
                    Vendor.update({ _id: vendor._id }, updatedVendor)
                    .then(vendorUpdateSuccess => {
                      Renter.findOne({ _id: renter._id })
                      .populate('spots')
                      .then(updatedRenter => {
                        res.json(updatedRenter);
                      })
                      .catch(err => {
                        res.json({ newRenterFindError: err });
                      });
                    })
                    .catch(err => {
                      res.json({ vendorUpdateError: err });
                    });
                  }
                })
                .catch(err => {
                  res.json({ vendorFindError: err });
                });
              }
            })
            .catch(err => {
              res.json({ spotPopulationError: err });
            });
          })
          .catch(err => {
            res.json({ spotUpdateError: err });
          });
        })
        .catch(err => {
          res.json(err);
        });
      })
      .catch(err => {
        res.json(err);
      });
    })
    .catch(err => {
      res.json(err);
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

// returns -1 if item is not in list
// otherwise returns index of item
function findIndexOfItem(item, list) {
  let itemIndex = -1;
  list.find((curItem, curIndex) => {
    if (String(curItem).valueOf() === String(item).valueOf()) {
      itemIndex = curIndex;
      return true;
    }
    return false;
  });
  return itemIndex;
}

// ========================= add routes for these ========================== //

export const updateBioAndName = (req, res) => {
  try {
    if (typeof req.body.bio === 'undefined' || typeof req.body.username === 'undefined') {
      res.json({ error: 'request body must include \'bio\' and \'name\' fields' });
      return;
    }
    Renter.findById(req.user._id)
    .then(renter => {
      const updatedRenter = Object.assign({}, renter._doc, { bio: req.body.bio, username: req.body.username });
      Renter.update({ _id: renter._id }, updatedRenter)
      .then(success => {
        Renter.findById(req.user._id)
        .then(newRenter => {
          res.json(newRenter);
        })
        .catch(err => {
          res.json({ renterFindError2: err });
        });
      })
      .catch(err => {
        res.json({ renterUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ renterFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};
//
// export const updateProfilePicture = (req, res) => {
//   try {
//   } catch (err) {
//     res.json({ error: `${err}` });
//   }
// };
//
export const changePassword = (req, res) => {
  try {
    if (typeof req.body.password === 'undefined') {
      res.json({ error: 'request body must include \'password\' field' });
      return;
    }
    Renter.findById(req.user._id)
    .then(renter => {
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
              const updatedRenter = Object.assign({}, renter._doc, { password: hash });
              Renter.update({ _id: renter._id }, updatedRenter)
              .then(success => {
                Renter.findById(req.user._id)
                .then(newRenter => {
                  res.json(newRenter);
                })
                .catch(err => {
                  res.json({ renterFindError2: err });
                });
              })
              .catch(err => {
                res.json({ renterUpdateError: err });
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
      res.json({ renterFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

// export const updatePicture = (req, res) => {

// }
