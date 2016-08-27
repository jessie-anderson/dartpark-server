import Renter from '../models/renter_model';
import Vendor from '../models/vendor_model';
import Car from '../models/car_model';
import Spot from '../models/spot_model';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: 'dartpark',
  api_key: '279693734154677',
  api_secret: '5Bm1NQl7mSEVX60KAIXASVG-J2E',
});

export const uploadUserPic = (req, res) => {
  if (typeof req.body.imageName === 'undefined' || typeof req.body.userType === 'undefined') {
    res.json({ error: 'request body must include fields \'imageName\' and \'userType\'' });
    return;
  }

  let User;
  if (req.body.userType.valueOf() === 'renter') User = Renter;
  else if (req.body.userType.valueOf() === 'vendor') User = Vendor;
  else {
    res.json({ error: `invalid userType ${req.body.userType}` });
    return;
  }

  User.findById(req.user._id)
  .then(user => {
    console.log('user:');
    console.log(user);
    cloudinary.uploader.upload(req.body.imageName, result => {
      const updatedUser = Object.assign({}, user._doc, { picUrl: result.secure_url });
      console.log('updated user:');
      console.log(updatedUser);
      User.update({ _id: req.user._id }, updatedUser)
      .then(success => {
        User.findOne({ _id: req.user._id })
        .populate('spots cars')
        .then(newUser => {
          res.json({ user: newUser, imageInfo: result });
        })
        .catch(err => {
          res.json({ userPopulateError: err });
        });
      })
      .catch(err => {
        res.json({ userFindoneError: err });
      });
    });
  })
  .catch(err => {
    res.json({ userFindError: err });
  });
};

export const uploadCarPic = (req, res) => {
  if (typeof req.body.imageName === 'undefined') {
    res.json({ error: 'request body must include field \'imageName\'' });
    return;
  }
  Renter.findById(req.user._id)
  .then(renter => {
    Car.findById(req.params.carId)
    .then(car => {
      try {
        cloudinary.uploader.upload(req.body.imageName, result => {
          const updatedCar = Object.assign({}, car._doc, { picUrl: result.secure_url });
          Car.update({ _id: req.params.carId }, updatedCar)
          .then(success => {
            Car.findOne({ _id: req.params.carId })
            .then(newCar => {
              Renter.findOne({ _id: req.user._id })
              .populate('cars spots')
              .then(newRenter => {
                res.json({ renter: newRenter, car: newCar, imageInfo: result });
              })
              .catch(err => {
                res.json({ renterPopulateError: err });
              });
            })
            .catch(err => {
              res.json({ carFindError2: err });
            });
          })
          .catch(err => {
            res.json({ carUpdateError: err });
          });
        });
      } catch (err) {
        res.json(err);
      }
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  })
  .catch(err => {
    res.json({ renterFindError: err });
  });
};

export const uploadSpotPic = (req, res) => {
  if (typeof req.body.imageName === 'undefined') {
    res.json({ error: 'request body must include field \'imageName\'' });
    return;
  }
  Vendor.findById(req.user._id)
  .then(vendor => {
    Spot.findById(req.params.spotId)
    .then(spot => {
      try {
        cloudinary.uploader.upload(req.body.imageName, result => {
          const updatedSpot = Object.assign({}, spot._doc, { picUrl: result.secure_url });
          Spot.update({ _id: req.params.spotId }, updatedSpot)
          .then(success => {
            Spot.findOne({ _id: req.params.spotId })
            .then(newSpot => {
              Vendor.findOne({ _id: req.user._id })
              .populate('renters spots')
              .then(newVendor => {
                res.json({ vendor: newVendor, spot: newSpot, imageInfo: result });
              })
              .catch(err => {
                res.json({ renterPopulateError: err });
              });
            })
            .catch(err => {
              res.json({ carFindError2: err });
            });
          })
          .catch(err => {
            res.json({ carUpdateError: err });
          });
        });
      } catch (err) {
        res.json(err);
      }
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  })
  .catch(err => {
    res.json({ renterFindError: err });
  });
};
