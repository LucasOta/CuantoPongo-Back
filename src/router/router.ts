import { Router, Request, Response } from 'express';
import path = require('path');
const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('hello world');
});

export default router;
