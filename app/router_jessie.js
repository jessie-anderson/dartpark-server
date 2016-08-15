import { Router } from 'express';

// import all controllers
import * as CarController from './controllers/car_controller';
import * as CardController from './controllers/card_controller';
import * as ConversationController from './controllers/conversation_controller';
import * as MessageController from './controllers/message_controller';
import * as RenterController from './controllers/renter_controller';
import * as SpotController from './controllers/spot_controller';
import * as VendorController from './controllers/vendor_controller';

// set up router
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome the dartpark api!' });
});

// car routes
router.route('/cars')
.post(CarController.createCar);

router.route('/cars/:carId')
.put(CarController.updateCar)
.delete(CarController.deleteCar);

// card routes
router.route('/cards')
.post(CardController.createCard);

router.route('/cards/:cardId')
.put(CardController.updateCard)
.delete(CardController.deleteCard);

// spot routes
router.route('/spots')
.post(SpotController.createSpot);

router.route('/spots/:spotId')
.put(SpotController.updateSpot)
.delete(SpotController.deleteSpot);

export default router;
