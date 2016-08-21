import Spot from '../models/spot_model';
import Vendor from '../models/vendor_model';

export const createSpot = (req, res) => {
  const spot = new Spot();
  spot.vendor = req.user._id;
  if (typeof req.body.address === 'undefined' || typeof req.body.price === 'undefined'
  || typeof req.body.startDate === 'undefined' || typeof req.body.endDate === 'undefined'
  || typeof req.body.number === 'undefined') {
    res.json({
      error: 'request must include the fields \'address\', \'price\', \'number\', \'startDate\', and \'endDate\'',
    });
    return;
  }
  spot.address = req.body.address;
  spot.price = req.body.price;
  spot.startDate = req.body.startDate;
  spot.endDate = req.body.endDate;
  spot.number = req.body.number;

  // when a spot is first created, no one has bought it yet
  spot.renter = null;

  spot.save()
  .then(newSpot => {
    console.log(req.user);
    Vendor.findById(req.user._id)
    .then(vendor => {
      vendor.spots.push(newSpot._id);
      const updatedVendor = Object.assign({}, vendor._doc, { spots: vendor.spots });
      Vendor.update({ _id: req.user._id }, updatedVendor)
      .then(newVendor => {
        Vendor.findOne({ _id: vendor._id })
        .populate('spots')
        .then(populatedVendor => {
          res.json({ vendor: populatedVendor, spot: newSpot });
        })
        .catch(err => {
          res.json({ vendorPopulateError: err });
        });
      })
      .catch(err => {
        res.json({ vendorUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ findVendorError: err });
    });
  })
  .catch(error => {
    res.json(error);
  });
};

// only called to update fields BESIDES renter
export const updateSpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId)
    .then(spot => {
      if (spot.renter !== null) {
        res.json({ spotAlreadyBoughtError: 'Cannot modify a spot that is already bought' });
        return;
      }
      if (typeof req.body.address === 'undefined' || typeof req.body.price === 'undefined'
      || typeof req.body.startDate === 'undefined' || typeof req.body.endDate === 'undefined'
      || typeof req.body.number === 'undefined') {
        res.json({ error: 'update request must include \'address\', \'price\', \'startDate\', \'endDate\', and \'number\' fields' });
        return;
      }
      const updates = {
        address: req.body.address,
        price: req.body.price,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        number: req.body.number,
      };
      const updatedSpot = Object.assign({}, spot._doc, updates);
      Spot.update({ _id: req.params.spotId }, updatedSpot)
      .then(response => {
        Vendor.findOne({ _id: spot.vendor })
        .populate('cars')
        .then(populatedVendor => {
          Spot.findById(req.params.spotId)
          .then(newSpot => {
            res.json({ vendor: populatedVendor, spot: response });
          })
          .catch(err => {
            res.json({ spotFindError2: err });
          });
        })
        .catch(err => {
          res.json({ vendorPopulateError: err });
        });
      })
      .catch(err => {
        res.json(err);
      });
    })
    .catch(err => {
      res.json({ spotFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

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

export const deleteSpot = (req, res) => {
  try {
    Spot.findById(req.params.spotId)
    .then(spot => {
      if (spot.renter !== null) {
        res.json({ spotAlreadyBoughtError: 'Error: cannot delete spot because it\'s already been bought' });
        return;
      }
      Spot.findOne({ _id: req.params.spotId })
      .populate('vendor')
      .then(populatedSpot => {
        const spotIndex = findIndexOfItem(req.params.spotId, populatedSpot.vendor.spots);
        if (spotIndex < 0) {
          res.json({ error: 'spot not in vendor\'s list' });
          return;
        }
        populatedSpot.vendor.spots.splice(spotIndex, 1);
        const updatedVendor = Object.assign({}, populatedSpot.vendor._doc, { spots: populatedSpot.vendor.spots });
        Vendor.update({ _id: populatedSpot.vendor._id }, updatedVendor)
        .then(update => {
          Spot.findById(req.params.spotId).remove()
          .then(success => {
            Vendor.findById(populatedSpot.vendor._id)
            .then(vendor => {
              res.json(vendor);
            })
            .catch(err => {
              res.json({ vendorFindError: err });
            });
          })
          .catch(err => {
            res.json({ spotDeleteError: err });
          });
        })
        .catch(err => {
          res.json({ vendorUpdateError: err });
        });
      })
      .catch(err => {
        res.json({ spotPopulationError: err });
      });
    })
    .catch(err => {
      res.json({ spotFindError: err });
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
