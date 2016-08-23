import Car from '../models/car_model';
import Renter from '../models/renter_model';

export const createCar = (req, res) => {
  try {
    const car = new Car();
    if (typeof req.body.make === 'undefined' || typeof req.body.model === 'undefined'
    || typeof req.body.year === 'undefined' || typeof req.body.paintcolor === 'undefined'
    || typeof req.body.plateNumber === 'undefined') {
      res.json({ error: 'request body must include fields \'make\', \'model\', \'year\', \'paintcolor\', and \'plateNumber\'' });
      return;
    }
    car.make = req.body.make;
    car.model = req.body.model;
    car.year = req.body.year;
    car.paintcolor = req.body.paintcolor;
    car.plateNumber = req.body.plateNumber;
    car.owner = req.user._id;
    car.save()
    .then(savedCar => {
      Renter.findById(req.user._id)
      .then(renter => {
        renter.cars.push(savedCar._id);
        const updatedRenter = Object.assign({}, renter._doc, { cars: renter.cars });
        Renter.update({ _id: renter._id }, updatedRenter)
        .then(success => {
          Renter.findOne({ _id: renter._id })
          .populate('cars')
          .then(populatedRenter => {
            res.json({ renter: populatedRenter, car: savedCar });
          })
          .catch(err => {
            res.json({ renterPopulateError: err });
          });
        })
        .catch(err => {
          res.json({ renterUpdateError: err });
        });
      })
      .catch(err => {
        res.json({ renterFindError: err });
      });
    })
    .catch(error => {
      res.json({ error });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const updateCar = (req, res) => {
  try {
    if (typeof req.body.make === 'undefined' || typeof req.body.model === 'undefined'
    || typeof req.body.year === 'undefined' || typeof req.body.paintcolor === 'undefined'
    || typeof req.body.plateNumber === 'undefined') {
      res.json({ error: 'request body must include fields \'make\', \'model\', \'year\', \'paintcolor\', and \'plateNumber\'' });
      return;
    }
    Car.findById(req.params.carId)
    .then(car => {
      const updates = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        paintcolor: req.body.paintcolor,
        plateNumber: req.body.plateNumber,
      };
      const updatedCar = Object.assign({}, car._doc, updates);
      Car.update({ _id: req.params.carId }, updatedCar)
      .then(success => {
        Car.findById(req.params.carId)
        .then(newCar => {
          Renter.findOne({ _id: newCar.owner })
          .populate('cars')
          .then(populatedRenter => {
            res.json({ renter: populatedRenter, car: newCar });
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
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const deleteCar = (req, res) => {
  try {
    Car.findOne({ _id: req.params.carId })
    .populate('owner')
    .then(populatedCar => {
      const carIdIndex = findIndexOfItem(req.params.carId, populatedCar.owner.cars);
      if (carIdIndex < 0) {
        res.json({ error: 'car ID not found' });
        return;
      }
      populatedCar.owner.cars.splice(carIdIndex, 1);
      const updatedRenter = Object.assign({}, populatedCar.owner._doc, { cars: populatedCar.owner.cars });
      Renter.update({ _id: populatedCar.owner._id }, updatedRenter)
      .then(renterUpdateSuccess => {
        Car.findById(req.params.carId).remove()
        .then(success => {
          Renter.findOne({ _id: updatedRenter._id })
          .populate('cars')
          .then(populatedRenter => {
            // return new list of cars and updated renter to frontend
            res.json(populatedRenter);
          })
          .catch(err => {
            res.json({ renterPopulateError: err });
          });
        })
        .catch(err => {
          res.json({ carDeleteError: err });
        });
      })
      .catch(err => {
        res.json({ renterUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const getCar = (req, res) => {
  try {
    Car.findById(req.params.carId)
    .then(car => {
      res.json(car);
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const getCars = (req, res) => {
  try {
    Renter.findOne({ _id: req.user._id })
    .populate('cars')
    .then(populatedRenter => {
      res.json(populatedRenter.cars);
    })
    .catch(err => {
      res.json({ renterPopulateError: err });
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
