import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validate } from '@gellert-ticketing/common';

import { User } from '../model/user-model';
import { Password } from '../utils/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').trim().notEmpty().withMessage('Password must be provided'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.comparePassword(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as SigninRouter };
