import jwt from 'jwt-simple';
import config from '../config';

export const tokenForUser = user => {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub, iat: timestamp }, config.secret);
};

export const userFromToken = token => {
  try {
    return jwt.decode(token, config.secret);
  } catch (err) {
    return null;
  }
};
