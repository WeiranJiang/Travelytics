import { Router } from 'express';
import type { ReviewSubmission } from '../types/api';
import { submitReview } from '../services/reviewSubmissionService';

const router = Router();

router.post('/', (req, res) => {
  const payload = req.body as ReviewSubmission;
  const result = submitReview(payload);
  res.json(result);
});

export default router;
