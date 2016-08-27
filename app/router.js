import { Router } from 'express';

// import all controllers
import * as Car from './controllers/car_controller';
import * as Card from './controllers/card_controller';
import * as Conversation from './controllers/conversation_controller';
import * as Renter from './controllers/renter_controller';
import * as Spot from './controllers/spot_controller';
import * as Vendor from './controllers/vendor_controller';

// passport
import { requireSigninRenter, requireSigninVendor, requireAuthRenter, requireAuthVendor, requireAuthVersatile } from './services/passport';

// set up router
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome the dartpark api!' });
});

// car routes
router.route('/cars')
      .post(requireAuthRenter, Car.createCar)
      .get(requireAuthRenter, Car.getCars);

router.route('/cars/:carId')
      .put(requireAuthRenter, Car.updateCar)
      .get(requireAuthRenter, Car.getCar)
      .delete(requireAuthRenter, Car.deleteCar);

router.route('/carsAndSpots')
      .get(requireAuthRenter, Renter.getSpotsAndCars);

// card routes
router.route('/cards')
      .post(requireAuthRenter, Card.createCard);

router.route('/cards/:cardId')
      .put(requireAuthRenter, Card.updateCard)
      .delete(requireAuthRenter, Card.deleteCard);

// spot routes
router.route('/vendor/spots')
      .post(requireAuthVendor, Spot.createSpot)
      .get(requireAuthVendor, Vendor.getSpots);


router.route('/vendor/spots/:spotId')
      .put(requireAuthVendor, Spot.updateSpot)
      .delete(requireAuthVendor, Spot.deleteSpot)
      .get(requireAuthVendor, Spot.getSpot);

router.route('/buySpot/:spotId')
      .put(requireAuthRenter, Renter.buySpot);

router.route('/renter/spots')
      .get(requireAuthRenter, Renter.getSpots);

router.route('/renter/spots/:spotId')
      .get(requireAuthRenter, Spot.getSpot)
      .delete(requireAuthRenter, Renter.deleteSpot);

router.route('/spots')
      .get(requireAuthRenter, Spot.getAllSpots);

// signup/signin routes
router.route('/renter/signup')
      .post(Renter.createRenter);

router.route('/renter/signin')
      .post(requireSigninRenter, Renter.signin);

router.route('/vendor/signup')
      .post(Vendor.createVendor);

router.route('/vendor/signin')
      .post(requireSigninVendor, Vendor.signin);

// conversation routes
router.route('/conversations')
      .put(requireAuthRenter, Conversation.createConversation);

router.route('/conversations/requester/:requester')
      .get(requireAuthVersatile, Conversation.getConversations);

router.route('/conversations/:conversationId/requester/:requester')
      .get(requireAuthVersatile, Conversation.getConversation)
      .put(requireAuthVersatile, Conversation.popConversationToTop)
      .delete(Conversation.deleteConversation);

// change password: renter
router.route('/renter/changePassword')
      .put(requireAuthRenter, Renter.changePassword);

// change password: vendor
router.route('/vendor/changePassword')
      .put(requireAuthVendor, Vendor.changePassword);

// change bio: renter
router.route('/renter/updateBioAndName')
      .put(requireAuthRenter, Renter.updateBioAndName);

// change bio: vendor
router.route('/vendor/updateBioAndName')
      .put(requireAuthVendor, Vendor.updateBioAndName);

export default router;
