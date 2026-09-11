import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'notedrop-api',
    timestamp: new Date().toISOString(),
  });
});

export default router;
