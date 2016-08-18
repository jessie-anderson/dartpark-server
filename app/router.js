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
router.route(requireAuthRenter, '/cars')
      .post(Car.createCar);

router.route(requireAuthRenter, '/cars/:carId')
      .put(Car.updateCar)
      .delete(Car.deleteCar);

// card routes
router.route(requireAuthRenter, '/cards')
      .post(Card.createCard);

router.route(requireAuthRenter, '/cards/:cardId')
      .put(Card.updateCard)
      .delete(Card.deleteCard);

// spot routes: vendor
router.route(requireAuthVendor, '/vendor/spots')
      .post(Spot.createSpot)
      .get(Vendor.getSpots);


router.route(requireAuthVendor, '/vendor/spots/:spotId')
      .put(Spot.updateSpot)
      .delete(Spot.deleteSpot)
      .get(Spot.getSpot);

// spot routes: renter
router.route(requireAuthRenter, '/buySpot/:spotId')
      .put(Renter.buySpot);

router.route(requireAuthRenter, '/renter/spots')
      .get(Renter.getSpots);

router.route(requireAuthRenter, '/renter/spots/:spotId')
      .delete(Renter.deleteSpot);

// signup routes
router.route('/renter/signup')
      .post(Renter.createRenter);

router.route('/renter/signin')
      .post(requireSigninRenter, Renter.signin);

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
router.route(requireAuthRenter, '/renter/changePassword')
      .put(Renter.changePassword);

// change password: vendor
router.route(requireAuthVendor, '/vendor/changePassword')
      .put(Vendor.changePassword);

// change bio: renter
router.route(requireAuthRenter, '/renter/changeBio')
      .put(Renter.updateBio);

// change bio: vendor
router.route(requireAuthVendor, '/vendor/changeBio')
      .put(Vendor.updateBio);

export default router;
