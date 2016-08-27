import braintree from 'braintree';
import config from '../config';
const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: config.bt_merchant_key,
  publicKey: config.bt_public_key,
  privateKey: config.bt_private_key,
});


export const getClientToken = (req, res) => {
  try {
    gateway.clientToken.generate({}, (err, response) => {
      try {
        res.json({ token: response.clientToken });
      } catch (err) {
        res.json({ gatewayError: err });
      }
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const sendPayment = (req, res) => {
  try {
    if (typeof req.body.payment_method_nonce === 'undefined' || typeof req.body.amount === 'undefined') {
      res.json({ error: 'request body must include fields \'payment_method_nonce\' and \'amount\'' });
      return;
    }
    const nonceFromTheClient = req.body.payment_method_nonce;
    gateway.transaction.sale({
      amount: req.body.amount,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    }, (err, result) => {
      if (err) res.json({ gatewayError: err });
      else res.json(result);
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};
