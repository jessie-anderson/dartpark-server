import { Router } from 'express';
// import { requireAuth, requireSignin } from './services/passport';
// import * as Posts from './controllers/post_controller';
// import * as Renter from './controllers/renter_controller';
import * as Renter from '../controllers/renter_controller';
import * as Vendor from '../controllers/vendor_controller';
import * as Conversation from '../controllers/conversation_controller';


const router = Router();

router.route('/renter/signup')
      .post(Renter.createRenter);

router.route('/vendor/signup')
      .post(Vendor.createVendor);

router.route('/conversations')
      .put(Conversation.createConversation);

router.route('/conversations/:id/requester/:requester')
      .get(Conversation.getConversations);

router.route('/conversations/:conversationId')
      .put(Conversation.popConversationToTop)
      .delete(Conversation.deleteConversation);

export default router;
