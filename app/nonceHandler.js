

var braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'useYourMerchantId',
  publicKey: 'useYourPublicKey',
  privateKey: 'useYourPrivateKey',
});
