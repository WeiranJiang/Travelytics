import { Router } from 'express';
import { getPropertyById, listProperties } from '../services/propertyService';
import { getRecentReviews } from '../services/reviewsService';
import { getSmartQuestions } from '../services/smartQuestionsService';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listProperties());
});

router.get('/:id', (req, res) => {
  const property = getPropertyById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  return res.json(property);
});

router.get('/:id/reviews', (req, res) => {
  res.json(getRecentReviews(req.params.id));
});

router.get('/:id/smart-questions', (req, res) => {
  res.json(getSmartQuestions(req.params.id));
});

export default router;
