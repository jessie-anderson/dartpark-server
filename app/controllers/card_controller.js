import Card from '../models/card_model';
import Renter from '../models/renter_model';

export const createCard = (req, res) => {
  try {
    if (typeof req.body.number === 'undefined' || typeof req.body.securityCode === 'undefined'
    || typeof req.body.expirationDate === 'undefined' || req.body.nameOnCard === 'undefined'
    || typeof req.body.billingAddress === 'undefined') {
      res.json({ error: 'request body must include \'number\', \'securityCode\', \'expirationDate\', \'nameOnCard\', and \'billingAddress\' fields' });
      return;
    }
    const card = new Card();
    card.number = req.body.number;
    card.securityCode = req.body.securityCode;
    card.expirationDate = req.body.expirationDate;
    card.nameOnCard = req.body.nameOnCard;
    card.billingAddress = req.body.billingAddress;
    card.owner = req.user._id; // make sure user is the right thing to use here
    card.save()
    .then(savedCard => {
      Renter.findById(req.user._id)
      .then(renter => {
        renter.cards.push(savedCard._id);
        const updatedRenter = Object.assign({}, renter._doc, { cards: renter.cards });
        Renter.update({ _id: renter._id }, updatedRenter)
        .then(success => {
          res.json(success);
        })
        .catch(err => {
          res.json({ renterUpdateError: err });
        });
      })
      .catch(err => {
        res.json({ renterFindError: err });
      });
    })
    .catch(err => {
      res.json({ cardSaveError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const updateCard = (req, res) => {
  try {
    if (typeof req.body.number === 'undefined' || typeof req.body.securityCode === 'undefined'
    || typeof req.body.expirationDate === 'undefined' || req.body.nameOnCard === 'undefined'
    || typeof req.body.billingAddress === 'undefined') {
      res.json({ error: 'request body must include \'number\', \'securityCode\', \'expirationDate\', \'nameOnCard\', and \'billingAddress\' fields' });
      return;
    }
    Card.findById(req.params.cardId)
    .then(card => {
      const updates = {
        number: req.body.number,
        securityCode: req.body.securityCode,
        expirationDate: req.body.expirationDate,
        nameOnCard: req.body.nameOnCard,
        billingAddress: req.body.billingAddress,
      };
      const updatedCard = Object.assign({}, card._doc, updates);
      Card.update({ _id: req.params.cardId }, updatedCard)
      .then(newCard => {
        res.json({ message: 'Card information successfully updated!' });
      })
      .catch(err => {
        res.json({ cardUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ cardFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

export const deleteCard = (req, res) => {
  try {
    Card.findOne({ _id: req.params.cardId })
    .populate('owner')
    .then(populatedCard => {
      const cardIdIndex = findIndexOfItem(req.params.cardId, populatedCard.owner.cards);
      if (cardIdIndex < 0) {
        res.json({ error: 'card ID not found' });
        return;
      }
      populatedCard.owner.cards.splice(cardIdIndex, 1);
      const updatedRenter = Object.assign({}, populatedCard.owner._doc, { cars: populatedCard.owner.cards });
      Renter.update({ _id: populatedCard.owner._id }, updatedRenter)
      .then(renterUpdateSuccess => {
        Card.findById(req.params.cardId).remove()
        .then(success => {
          res.json(success);
        })
        .catch(err => {
          res.json({ carDeleteError: err });
        });
      })
      .catch(err => {
        res.json({ renterUpdateError: err });
      });
    })
    .catch(err => {
      res.json({ carFindError: err });
    });
  } catch (err) {
    res.json({ generalError: err });
  }
};

function findIndexOfItem(item, list) {
  let itemIndex = -1;
  list.find((curItem, curIndex) => {
    if (String(curItem).valueOf() === String(item).valueOf()) {
      itemIndex = curIndex;
      return true;
    }
    return false;
  });
  return itemIndex;
}
