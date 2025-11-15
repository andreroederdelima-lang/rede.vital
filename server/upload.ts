import { Router } from 'express';
import multer from 'multer';
import { storagePut } from './storage';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `parceiros/${timestamp}-${randomSuffix}-${req.file.originalname}`;

    const { url } = await storagePut(
      fileKey,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url, key: fileKey });
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
