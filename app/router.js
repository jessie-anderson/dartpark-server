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
      .post(Spot.createSpot)
      .get(Vendor.getSpots);


router.route('/spots/:spotId')
      .put(Spot.updateSpot)
      .delete(Spot.deleteSpot)
      .get(Spot.getSpot);

// spot routes: renter
router.route('/buySpot/:spotId/renter/:renterId')
      .put(Renter.buySpot);

router.route('/spots/renter/:renterId')
      .get(Renter.getSpots);

router.route('/spots/:renterId/spot/:spotId')
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

// change password: renter
router.route('/changePassword/renter/:renterId')
      .put(Renter.changePassword);

// change password: vendor
router.route('/changePassword/vendor/:vendorId')
      .put(Vendor.changePassword);

// change bio: renter
router.route('/changeBio/renter/:renterId')
      .put(Renter.updateBio);

// change bio: vendor
router.route('/changeBio/vendor/:vendorId')
      .put(Vendor.updateBio);

export default router;
