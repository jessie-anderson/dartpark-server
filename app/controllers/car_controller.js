import Car from '../models/car_model';

export const createCar = (req, res) => {
  const car = new Car();
  car.make = req.body.make;
  car.model = req.body.model;
  car.year = req.body.year;
  car.plateNumber = req.body.plateNumber;
  car.owner = req.user; // make sure that user is the right word to user
  car.save()
  .then(result => {
    res.json({ message: 'Car successfully added!' });
  })
  .catch(error => {
    res.json({ error });
  });
};

export const updateCar = (req, res) => {
  const updatedCar = {
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    plateNumber: req.body.plateNumber,
    owner: req.user, // make sure user is the right thing to use
  };
  // make sure carId is the right thing to use here
  Car.update({ _id: req.params.carId }, updatedCar)
  .then(response => {
    res.json({ message: 'Car information successfully updated!' });
  })
  .catch(error => {
    res.json(error);
  });
};

export const deleteCar = (req, res) => {
  // make sure that carId is the right thing to use here
  Car.findById(req.params.carId).remove(error => { res.json(error); });
};
