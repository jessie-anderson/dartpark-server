import dotenv from 'dotenv';

dotenv.config();

export default {
  secret: process.env.API_SECRET,
  google_key: process.env.GOOGLE_KEY,
  bt_private_key: process.env.PRIVATE_KEY_BT,
  bt_merchant_key: process.env.MERCHANT_ID_BT,
  bt_public_key: process.env.PUBLIC_KEY_BT,
};
