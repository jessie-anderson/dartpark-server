import config from './config';
const braintree = require('braintree');
const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: config.bt_merchant_key,
  publicKey: config.bt_public_key,
  privateKey: config.bt_private_key,
});
const express = require('express');
const app = express();

app.get('/client_token', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    res.send(response.clientToken);
  });
});

app.post('/checkout', (req, res) => {
  const nonceFromTheClient = req.body.payment_method_nonce;
  gateway.transaction.sale({
    amount: '10.00',
    paymentMethodNonce: nonceFromTheClient,
    options: {
      submitForSettlement: true,
    },
  }, (err, result) => {
  });
});
