import axios from 'axios';

export const buildClient = function ({ req }) {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://ingress-nginx-srv',
      headers: req.headers,
    });
  } else {
    return axios.create();
  }
};
