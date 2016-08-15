import Card from '../models/card_model';

export const createCard = (req, res) => {
  const card = new Card();
  card.number = req.body.number;
  card.securityCode = req.body.securityCode;
  card.expirationDate = req.body.expirationDate;
  card.nameOnCard = req.body.nameOnCard;
  card.billingAddress = req.body.billingAddress;
  card.owner = req.user; // make sure user is the right thing to use here
  card.save()
  .then(response => {
    res.json({ message: 'Card successfully added!' });
  })
  .catch(error => {
    res.json(error);
  });
};

export const updateCard = (req, res) => {
  const updatedCard = {
    number: req.body.number,
    securityCode: req.body.securityCode,
    expirationDate: req.body.expirationDate,
    nameOnCard: req.body.nameOnCard,
    billingAddress: req.body.billingAddress,
    owner: req.user,
  };

  // make sure cardId is the right thing to use here
  Card.update({ _id: req.params.cardId }, updatedCard)
  .then(response => {
    res.json({ message: 'Card information successfully updated!' });
  })
  .catch(error => {
    res.json(error);
  });
};

export const deleteCard = (req, res) => {
  Card.findById(req.params.cardId).remove(error => { res.json(error); });
};
