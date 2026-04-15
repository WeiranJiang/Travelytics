import { Router } from 'express';

const router = Router();

router.post('/transcribe', (_req, res) => {
  res.json({
    text: 'It was great — no construction noise, and the staff pointed me to the nearest elevator in the building across the courtyard.',
  });
});

export default router;
