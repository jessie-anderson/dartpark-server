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
      .post(Car.createCar);

router.route('/cars/:carId')
      .put(Car.updateCar)
      .delete(Car.deleteCar);

// card routes
router.route('/cards')
      .post(Card.createCard);

router.route('/cards/:cardId')
      .put(Card.updateCard)
      .delete(Card.deleteCard);

// spot routes
router.route('/spots')
      .post(Spot.createSpot);

router.route('/spots/:spotId')
      .put(Spot.updateSpot)
      .delete(Spot.deleteSpot);

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

router.route('/buySpot/:spotId/renter/:renterId')
      .put(Renter.buySpot);

router.route('/spots/:renterId')
      .get(Renter.getSpots);

router.route('/spots/:renterId/spot/:spotId')
      .get(Renter.getSpot);

export default router;
