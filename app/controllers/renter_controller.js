import Renter from '../models/renter_model';
import Conversation from '../models/conversation_model';
import Spot from '../models/spot_model';
import Vendor from '../models/vendor_model';

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
            try {
              res.json({
                id: result._id,
                message: `Renter created with \'id\' ${result._id}!`,
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

export const buySpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId).then(spot => {
      if (spot.renter === null) {
        Renter.findById(req.params.renterId).then(renter => {
          const updatedSpot = Object.assign({}, spot._doc, { renter: renter._id });

          // update the spot to show that it has a renter
          Spot.update({ _id: req.params.spotId }, updatedSpot)
          .then(spotSuccess => {
            renter.spots.push(req.params.spotId);

            // update the renter's spot list to include spot they bought
            const updatedRenter = Object.assign({}, renter._doc, { spots: renter.spots });
            Renter.update({ _id: req.params.renterId }, updatedRenter)
            .then(renterSuccess => {
              Vendor.findById(spot.vendor)
              .then(vendor => {
                // if the renter isn't already in the vendor's list...
                if (vendor.renters.find(curId => {
                  return String(curId).valueOf() === String(renter._id).valueOf();
                }) === undefined) {
                  vendor.renters.push(req.params.renterId);

                  // add this renter to the spot's vendor's list of renters
                  const updatedVendor = Object.assign({}, vendor._doc, { renters: vendor.renters });
                  Vendor.update({ _id: vendor._id }, updatedVendor)
                  .then(vendorSuccess => {
                    res.json(vendorSuccess);
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
              res.json(renterSuccess);
            })
            .catch(err => {
              res.json({ errorUpdatingRenter: err });
            });

            res.json(spotSuccess);
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
    Renter.findById(req.params.renterId)
    .populate('spots')
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.json({ errorPopulatingSpots: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const getSpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.json({ errorFindingSpot: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

// problem: how to update vendor's list of renters?
export const deleteSpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId)
    .then(spot => {
      Renter.findById(req.params.renterId)
      .then(renter => {
        const idIndex = findIndexOfItem(req.params.spotId, renter.spots);
        if (idIndex === -1) {
          res.json({ error: `spot ${req.params.spotId} not in renter ${req.params.renterId}\'s spot list` });
          return;
        }

        renter.spots.splice(idIndex, 1);

        const newRenter = Object.assign({}, renter._doc, { spots: renter.spots });
        Renter.update({ _id: req.params.renterId }, newRenter)
        .then(renterUpdateSuccess => {
          const newSpot = Object.assign({}, spot._doc, { renter: null });
          Spot.update({ _id: req.params.spotId }, newSpot)
          .then(spotUpdateSuccess => {
            Renter.findById(req.params.renterId)
            .populate('spots')
            // fix!!!!!!
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
                  const renterIndex = findIndexOfItem(req.params.renterId, vendor.renters);
                  if (renterIndex !== -1) {
                    vendor.renters.splice(renterIndex, 1);
                    const updatedVendor = Object.assign({}, vendor._doc, { renters: vendor.renters });
                    Vendor.update({ _id: vendor._id }, updatedVendor)
                    .then(vendorUpdateSuccess => {
                      res.json(vendorUpdateSuccess);
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
            res.json(spotUpdateSuccess);
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
