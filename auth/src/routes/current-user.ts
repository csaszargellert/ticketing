import express, { Request, Response } from 'express';
import { currentUser } from '@gellert-ticketing/common';

const router = express.Router();

router.get(
  '/api/users/current-user',
  currentUser,
  (req: Request, res: Response) => {
    res.status(200).send({ currentUser: req.currentUser || null });
  }
);

export { router as CurrentUserRouter };
