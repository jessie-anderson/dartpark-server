import Spot from '../models/spot_model';
import Vendor from '../models/vendor_model';

export const createSpot = (req, res) => {
  const spot = new Spot();
  spot.vendor = req.params.vendorId;
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
    Vendor.findById(req.params.vendorId)
    .then(vendor => {
      vendor.spots.push(newSpot._id);
      const updatedVendor = Object.assign({}, vendor._doc, { spots: vendor.spots });
      Vendor.update({ _id: req.params.vendorId }, updatedVendor)
      .then(vendorUpdateSuccess => {
        res.json(vendorUpdateSuccess);
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
        res.json({ message: 'Spot information successfully updated!' });
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
        populatedSpot.vendor.spots.splice(spotIndex, 1);
        const updatedVendor = Object.assign({}, populatedSpot.vendor._doc, { spots: populatedSpot.vendor.spots });
        Vendor.update({ _id: populatedSpot.vendor._id }, updatedVendor)
        .then(vendorUpdateSuccess => {
          Spot.findById(req.params.spotId).remove()
          .then(success => {
            res.json(success);
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
