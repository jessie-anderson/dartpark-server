import { Router } from 'express';

// import all controllers
import * as Car from './controllers/car_controller';
import * as Card from './controllers/card_controller';
import * as Conversation from './controllers/conversation_controller';
import * as Renter from './controllers/renter_controller';
import * as Spot from './controllers/spot_controller';
import * as Vendor from './controllers/vendor_controller';

// set up router
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome the dartpark api!' });
});

// car routes
router.route('/cars/renter/:renterId')
      .post(Car.createCar);

router.route('/cars/renter/:carId')
      .put(Car.updateCar)
      .delete(Car.deleteCar);

// card routes
router.route('/cards/renter/:renterId')
      .post(Card.createCard);

router.route('/cards/renter/:cardId')
      .put(Card.updateCard)
      .delete(Card.deleteCard);

// spot routes: vendor
router.route('/spots/vendor/:vendorId')
      .post(Spot.createSpot);


router.route('/spots/:spotId')
      .put(Spot.updateSpot)
      .delete(Spot.deleteSpot);

// spot routes: renter
router.route('/buySpot/:spotId/renter/:renterId')
      .put(Renter.buySpot);

router.route('/spots/:renterId')
      .get(Renter.getSpots);

router.route('/spots/:renterId/spot/:spotId')
      .get(Renter.getSpot)
      .delete(Renter.deleteSpot);

// signup routes
router.route('/renter/signup')
      .post(Renter.createRenter);

router.route('/vendor/signup')
      .post(Vendor.createVendor);

// conversation routes
router.route('/conversations')
      .put(Conversation.createConversation);

router.route('/conversations/:id/requester/:requester')
      .get(Conversation.getConversations);

router.route('/conversations/:conversationId')
      .get(Conversation.getConversation)
      .put(Conversation.popConversationToTop)
      .post(Conversation.sendMessage)
      .delete(Conversation.deleteConversation);

export default router;
