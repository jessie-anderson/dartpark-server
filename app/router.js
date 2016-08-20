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
      .post(requireAuthRenter, Car.createCar);

router.route('/cars/:carId')
      .put(requireAuthRenter, Car.updateCar)
      .delete(requireAuthRenter, Car.deleteCar);

// card routes
router.route('/cards')
      .post(requireAuthRenter, Card.createCard);

router.route('/cards/:cardId')
      .put(requireAuthRenter, Card.updateCard)
      .delete(requireAuthRenter, Card.deleteCard);

// spot routes: vendor
router.route('/vendor/spots')
      .post(requireAuthVendor, Spot.createSpot)
      .get(requireAuthVendor, Vendor.getSpots);


router.route('/vendor/spots/:spotId')
      .put(requireAuthVendor, Spot.updateSpot)
      .delete(requireAuthVendor, Spot.deleteSpot)
      .get(requireAuthVendor, Spot.getSpot);

// spot routes: renter
router.route('/buySpot/:spotId')
      .put(requireAuthRenter, Renter.buySpot);

router.route('/renter/spots')
      .get(requireAuthRenter, Renter.getSpots);

router.route('/renter/spots/:spotId')
      .get(requireAuthRenter, Spot.getSpot)
      .delete(requireAuthRenter, Renter.deleteSpot);

// signup routes
router.route('/renter/signup')
      .post(Renter.createRenter);
//
router.route('/renter/signin')
      .post(requireSigninRenter, Renter.signin);
//
router.route('/vendor/signup')
      .post(Vendor.createVendor);

router.route('/vendor/signin')
      .post(requireSigninVendor, Vendor.signin);

router.route('/conversations')
      .put(requireAuthRenter, requireAuthVendor, Conversation.createConversation);

router.route('/conversations/:id/requester/:requester')
      .get(requireAuthVersatile, Conversation.getConversations);

router.route('/conversations/:conversationId')
      .get(Conversation.getConversation)
      .put(Conversation.popConversationToTop)
      .post(Conversation.sendMessage)
      .delete(Conversation.deleteConversation);

// change password: renter
router.route('/renter/changePassword')
      .put(requireAuthRenter, Renter.changePassword);

// change password: vendor
router.route('/vendor/changePassword')
      .put(requireAuthVendor, Vendor.changePassword);

// change bio: renter
router.route('/renter/changeBio')
      .put(requireAuthRenter, Renter.updateBio);

// change bio: vendor
router.route('/vendor/changeBio')
      .put(requireAuthVendor, Vendor.updateBio);

export default router;
