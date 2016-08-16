import Conversation from '../models/conversation_model';
import Renter from '../models/renter_model';
import Vendor from '../models/vendor_model';
import Message from '../models/message_model';

const errorHead = 'Error splicing into conversations head.';

const spliceOutConversationBothEndsHelper = (resolve, revoke, convIds, i) => {
  try {
    if (convIds[i] !== null) {
      const prevId = convIds[i][0];
      const nextId = convIds[i][1];

      const updateNext = {};
      const updatePrev = {};

      if (i === 0) {
        updateNext.next = {
          renter: nextId,
        };

        updatePrev.prev = {
          renter: prevId,
        };
      } else {
        updateNext.next = {
          vendor: nextId,
        };

        updatePrev.prev = {
          vendor: prevId,
        };
      }

      Conversation.findById(prevId)
      .then(prevConv => {
        try {
          if (!prevConv.head) {
            if (i === 0 && prevConv.next.vendor) {
              updateNext.next.vendor = prevConv.next.vendor;
            } else if (i === 1 && prevConv.next.renter) {
              updateNext.next.renter = prevConv.next.renter;
            }
          }

          // console.log(updateNext);
          Conversation.update({ _id: prevId }, updateNext)
          .then(success1 => {
            try {
              Conversation.findById(nextId)
              .then(nextConv => {
                try {
                  if (!nextConv.head) {
                    if (i === 0 && nextConv.prev.vendor) {
                      updatePrev.prev.vendor = nextConv.prev.vendor;
                    } else if (i === 1 && nextConv.prev.renter) {
                      updatePrev.prev.renter = nextConv.prev.renter;
                    }
                  }
                  // console.log(updatePrev);

                  Conversation.update({ _id: nextId }, updatePrev)
                  .then(success2 => {
                    try {
                      if (i === convIds.length - 1) {
                        resolve();
                      } else {
                        spliceOutConversationBothEndsHelper(resolve, revoke, convIds, i + 1);
                      }
                    } catch (err) {
                      revoke(err);
                    }
                  })
                  .catch(error => {
                    revoke(error);
                  });
                } catch (err) {
                  revoke(err);
                }
              })
              .catch(error => {
                revoke(error);
              });
            } catch (err) {
              revoke(err);
            }
          })
          .catch(error => {
            revoke(error);
          });
        } catch (err) {
          revoke(err);
        }
      })
      .catch(error => {
        revoke(error);
      });
    } else {
      if (i === convIds.length - 1) {
        resolve();
      } else {
        spliceOutConversationBothEndsHelper(resolve, revoke, convIds, i + 1);
      }
    }
  } catch (err) {
    revoke(err);
  }
};

const spliceOutConversationBothEnds = convIds => {
  return new Promise((resolve, revoke) => {
    try {
      spliceOutConversationBothEndsHelper(resolve, revoke, convIds, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const spliceIntoBeginningHelper = (resolve, revoke, result, newItem, lists, i) => {
  try {
    const update = {};
    const updateObj = {};
    const updateObj2 = {};
    const list = lists[i];

    if (list !== null) {
      if (i === 0) {
        result.push(list._id);
        result.push(list.next.renter);
        update.renter = newItem._id;
      } else {
        result.push(list._id);
        result.push(list.next.vendor);
        update.vendor = newItem._id;
      }

      if (!list.head) {
        revoke(errorHead);
      } else {
        const next = i === 0 ? list.next.renter : list.next.vendor;

        // console.log({ _id: next }, {
        //   prev: update,
        //   renter: newItem.renter,
        //   vendor: newItem.vendor,
        // });

        Conversation.findById(next)
        .then(conv1 => {
          try {
            updateObj.prev = update;

            if (!conv1.head) {
              updateObj.renter = newItem.renter;
              updateObj.vendor = newItem.vendor;

              if (i === 0 && conv1.prev.vendor) {
                updateObj.prev.vendor = conv1.prev.vendor;
              } else if (i === 1 && conv1.prev.renter) {
                updateObj.prev.renter = conv1.prev.renter;
              }
            }

            console.log(updateObj);

            Conversation.update({ _id: next }, updateObj)
            .then(success1 => {
              try {
                // console.log({ _id: list._id }, {
                //   next: update,
                //   renter: newItem.renter,
                //   vendor: newItem.vendor,
                // });

                Conversation.findById(list._id)
                .then(conv2 => {
                  try {
                    updateObj2.next = update;

                    if (!conv2.head) {
                      updateObj2.renter = newItem.renter;
                      updateObj2.vendor = newItem.vendor;

                      if (i === 0 && conv2.next.vendor) {
                        updateObj2.next.vendor = conv2.next.vendor;
                      } else if (i === 1 && conv2.next.renter) {
                        updateObj2.next.renter = conv2.next.renter;
                      }
                    }

                    console.log(updateObj2);

                    Conversation.update({ _id: list._id }, updateObj2)
                    .then(success2 => {
                      try {
                        if (i === lists.length - 1) {
                          resolve(result);
                        } else {
                          spliceIntoBeginningHelper(resolve, revoke, result, newItem, lists, i + 1);
                        }
                      } catch (err) {
                        revoke(err);
                      }
                    })
                    .catch(error => {
                      revoke(error);
                    });
                  } catch (err) {
                    revoke(err);
                  }
                })
                .catch(error => {
                  revoke(error);
                });
              } catch (err) {
                revoke(err);
              }
            })
            .catch(error => {
              revoke(error);
            });
          } catch (err) {
            revoke(err);
          }
        })
        .catch(error => {
          revoke(error);
        });
      }
    } else {
      result.push(null);
      result.push(null);

      if (i === lists.length - 1) {
        resolve(result);
      } else {
        spliceIntoBeginningHelper(resolve, revoke, result, newItem, lists, i + 1);
      }
    }
  } catch (err) {
    revoke(err);
  }
};

const spliceIntoBeginning = (newItem, lists) => {
  return new Promise((resolve, revoke) => {
    try {
      spliceIntoBeginningHelper(resolve, revoke, [], newItem, lists, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const getMessagesHelper = (resolve, revoke, currConversation, conversationsArray, i) => {
  try {
    Message.findById(currConversation.messages[i])
    .then(message => {
      try {
        conversationsArray.push(message);
        if (i === currConversation.messages.length - 1) {
          resolve();
        } else {
          getMessagesHelper(resolve, revoke, currConversation, conversationsArray, i + 1);
        }
      } catch (err) {
        revoke(err);
      }
    })
    .catch(error => {
      revoke(error);
    });
  } catch (err) {
    revoke(err);
  }
};

const getMessages = (currConversation, conversationsArray) => {
  return new Promise((resolve, revoke) => {
    try {
      getMessagesHelper(resolve, revoke, currConversation, conversationsArray, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const getConversationsArrayHelper = (resolve, revoke, currConversation, requester, conversationsArray) => {
  try {
    // console.log(requester);
    Conversation.findById(currConversation.next[requester])
    .then(conv => {
      try {
        if (conv.head) {
          resolve(conversationsArray);
        } else {
          console.log('haha');
          getMessages(conv, conversationsArray)
          .then(() => {
            try {
              getConversationsArrayHelper(resolve, revoke, conv, requester, conversationsArray);
            } catch (err) {
              revoke(err);
            }
          })
          .catch(error => {
            revoke(error);
          });
        }
      } catch (err) {
        revoke(err);
      }
    })
    .catch(error => {
      revoke(error);
    });
  } catch (err) {
    revoke(err);
  }
};

const getConversationsArray = (currConversation, requester) => {
  return new Promise((resolve, revoke) => {
    try {
      getConversationsArrayHelper(resolve, revoke, currConversation, requester, []);
    } catch (err) {
      revoke(err);
    }
  });
};

export const createConversation = (req, res) => {
  try {
    if (typeof req.body.renterId === 'undefined' || typeof req.body.vendorId === 'undefined') {
      res.json({
        error: 'ERR: Users need \'email\', \'password\', and  \'name\' fields',
      });
    } else {
      const conversation = new Conversation();
      const message = new Message();

      const renterId = req.body.renterId;
      const vendorId = req.body.vendorId;

      conversation.renter = renterId;
      conversation.vendor = vendorId;
      conversation.messages = [];

      message.sender = req.body.sender;
      message.text = req.body.message;

      message.save()
      .then(savedMessage => {
        try {
          conversation.messages.push(savedMessage._id);

          Renter.findById(renterId)
          .then(renter => {
            try {
              Vendor.findById(vendorId)
              .then(vendor => {
                try {
                  Conversation.findById(renter.conversations)
                  .then(renterHead => {
                    try {
                      // console.log("jaja");
                      // console.log(conversationHeads);
                      // console.log("hahaha");
                      Conversation.findById(vendor.conversations)
                      .then(vendorHead => {
                        try {
                          spliceIntoBeginning(conversation, [renterHead, vendorHead])
                          .then(result => {
                            try {
                              conversation.prev = {
                                renter: result[0],
                                vendor: result[2],
                              };

                              conversation.next = {
                                renter: result[1],
                                vendor: result[3],
                              };

                              // console.log(conversation);

                              conversation.save()
                              .then(success => {
                                try {
                                  res.json({ message: 'finally!' });
                                } catch (err) {
                                  res.json({ error: `${err}` });
                                }
                              })
                              .catch(error => {
                                res.json({ error: `${error}` });
                              });
                            } catch (err) {
                              res.json({ error: `${err}` });
                            }
                          })
                          .catch(error => {
                            res.json({ error: `${error}` });
                          });
                        } catch (err) {
                          res.json({ error: `${err}` });
                        }
                      })
                      .catch(error => {
                        res.json({ error: `${error}` });
                      });
                    } catch (err) {
                      res.json({ error: `${err}` });
                    }
                  })
                  .catch(error => {
                    res.json({ error: `${error}` });
                  });
                } catch (err) {
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                res.json({ error: `${error}` });
              });
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const popConversationToTop = (req, res) => {
  try {
    if (typeof req.params.conversationId === 'undefined' || typeof req.body.id === 'undefined' ||
         typeof req.body.requester === 'undefined') {
      res.json({
        error: 'ERR: \'email\', \'password\', and  \'name\' fields',
      });
    } else {
      const User = req.body.requester === 'renter' ? Renter : Vendor;

      User.findById(req.body.id)
      .then(userData => {
        try {
          Conversation.findById(userData.conversations)
          .then(userConvHead => {
            try {
              const conversationHeads = req.body.requester === 'renter' ? [userConvHead, null] : [null, userConvHead];

              Conversation.findById(req.params.conversationId)
              .then(conv => {
                try {
                  console.log(conv);
                  console.log(conversationHeads);
                  console.log('12');
                  const connectedConvs = req.body.requester === 'renter' ? [[conv.prev.renter, conv.next.renter], null] : [null, [conv.prev.vendor, conv.next.vendor]];

                  spliceOutConversationBothEnds(connectedConvs)
                  .then((renter, vendor) => {
                    try {
                      spliceIntoBeginning(conv, conversationHeads)
                      .then(result => {
                        try {
                          console.log(result);
                          const updateConv = {
                            next: {},
                            prev: {},
                          };

                          if (req.body.requester === 'renter') {
                            updateConv.prev.renter = result[0];
                            updateConv.prev.vendor = conv.prev.vendor;
                            updateConv.next.renter = result[1];
                            updateConv.next.vendor = conv.next.vendor;
                          } else {
                            updateConv.prev.renter = conv.prev.renter;
                            updateConv.prev.vendor = result[2];
                            updateConv.next.renter = conv.next.renter;
                            updateConv.next.vendor = result[3];
                          }

                          console.log('34');

                          console.log(updateConv);

                          Conversation.update({ _id: req.params.conversationId }, updateConv)
                          .then(success => {
                            try {
                              res.json({ message: 'finally!' });
                            } catch (err) {
                              res.json({ error: `${err}` });
                            }
                          })
                          .catch(error => {
                            res.json({ error: `${error}` });
                          });
                        } catch (err) {
                          res.json({ error: `${err}` });
                        }
                      })
                      .catch(error => {
                        res.json({ error: `${error}` });
                      });
                    } catch (err) {
                      res.json({ error: `${err}` });
                    }
                  })
                  .catch(error => {
                    res.json({ error: `${error}` });
                  });
                } catch (err) {
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                res.json({ error: `${error}` });
              });
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getConversations = (req, res) => {
  try {
    if (typeof req.params.requester === 'undefined' || typeof req.params.id === 'undefined') {
      res.json({
        error: 'ERR: Conversations need \'id\' and  \'requester\' fields',
      });
    } else {
      let User;

      if (req.params.requester === 'renter') {
        User = Renter;
      } else {
        User = Vendor;
      }

      User.findById(req.params.id)
      .then(userData => {
        try {
          Conversation.findById(userData.conversations)
          .then(currConversation => {
            try {
              if (!currConversation.head) {
                res.json({ error: `${errorHead}` });
              } else {
                getConversationsArray(currConversation, req.params.requester)
                .then(conversations => {
                  try {
                    conversations.forEach(currConv => {
                      // console.log(currConv);
                    });

                    res.json({ conversations });
                  } catch (err) {
                    res.json({ error: `${err}` });
                  }
                })
                .catch(error => {
                  res.json({ error: `${error}` });
                });
              }
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const deleteConversation = (req, res) => {
  try {
    if (typeof req.params.conversationId === 'undefined') {
      res.json({
        error: 'ERR: Conversation deletion needs \'conversation id\' fields',
      });
    } else {
      Conversation.findById(req.params.conversationId)
      .then(conv => {
        try {
          const renterId = conv.renter;
          const vendorId = conv.vendor;
          spliceOutConversationBothEnds([[conv.prev.renter, conv.next.renter], [conv.prev.vendor, conv.next.vendor]])
          .then((renter, vendor) => {
            try {
              Conversation.remove({ _id: conv._id })
              .then(success => {
                try {
                  res.json({ message: `Successfully spliced out conversation ${conv._id} from renter ${renterId} and vendor ${vendorId}!` });
                } catch (err) {
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                res.json({ error: `${error}` });
              });
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};
