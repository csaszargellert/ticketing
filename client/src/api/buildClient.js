import axios from 'axios';

export const buildClient = function ({ req }) {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://www.gellert-ticketing.online',
      headers: req.headers,
      withCredentials: true
    });
  } else {
    return axios.create({ withCredentials: true });
  }
};
