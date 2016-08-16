import Spot from '../models/spot_model';

export const createSpot = (req, res) => {
  const spot = new Spot();
  spot.vendor = req.params.vendorId;
  spot.address = req.body.address;
  spot.price = req.body.price;
  spot.startDate = req.body.startDate;
  spot.endDate = req.body.endDate;

  // when a spot is first created, no one has bought it yet
  spot.renter = null;

  spot.save()
  .then(resposne => {
    res.json({ message: 'Spot successfully created!' });
  })
  .catch(error => {
    res.json(error);
  });
};

// only called to update fields BESIDES renter
export const updateSpot = (req, res) => {
  if (req.body.isBuying) {
    Spot.findById(req.params.spotId, (error, spot) => {
      // don't let someone else buy a spot
      if (spot.renter) {
        res.json({ message: 'Spot already purchased!' });
        return;
      }

      const updatedSpot = {
        vendor: spot.user,
        address: req.body.address,
        price: req.body.price,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        renter: req.user,
      };

      Spot.update({ _id: req.params.spotId }, updatedSpot)
      .then(response => {
        res.json({ message: 'Spot purchased successfully!' });
      })
      .catch(err => {
        res.json(err);
      });
    });
  } else {
    Spot.findById(req.params.spotId, (error, spot) => {
      // if the spot isn't being bought, then don't need to change the user
      const updatedSpot = {
        vendor: req.user,
        address: req.body.address,
        price: req.body.price,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        renter: spot.renter,
      };
      // is spotId the right thing to use?
      Spot.update({ _id: req.params.spotId }, updatedSpot)
      .then(response => {
        res.json({ message: 'Spot information successfully updated!' });
      })
      .catch(err => {
        res.json(err);
      });
    });
  }
};

export const deleteSpot = (req, res) => {
  Spot.findById(req.params.spotId).remove(error => { res.json(error); });
};
