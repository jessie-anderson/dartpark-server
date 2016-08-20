import Car from '../models/car_model';
import Renter from '../models/renter_model';

export const createCar = (req, res) => {
  try {
    const car = new Car();
    if (typeof req.body.make === 'undefined' || typeof req.body.model === 'undefined'
    || typeof req.body.year === 'undefined' || typeof req.body.color === 'undefined'
    || typeof req.body.plateNumber === 'undefined') {
      res.json({ error: 'request body must include fields \'make\', \'model\', \'year\', \'color\', and \'plateNumber\'' });
      return;
    }
    car.make = req.body.make;
    car.model = req.body.model;
    car.year = req.body.year;
    car.color = req.body.color;
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
          res.json(success);
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
    || typeof req.body.year === 'undefined' || typeof req.body.color === 'undefined'
    || typeof req.body.plateNumber === 'undefined') {
      res.json({ error: 'request body must include fields \'make\', \'model\', \'year\', \'color\', and \'plateNumber\'' });
      return;
    }
    Car.findById(req.params.carId)
    .then(car => {
      const updates = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        color: req.body.color,
        plateNumber: req.body.plateNumber,
      };
      const updatedCar = Object.assign({}, car._doc, updates);
      Car.update({ _id: req.params.carId }, updatedCar)
      .then(newCar => {
        res.json({ message: 'Car information successfully updated!' });
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
          res.json(success);
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
