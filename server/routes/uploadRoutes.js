import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'server/uploads/'); },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  res.status(201).json({ file: `/uploads/${path.basename(req.file.path)}` });
});

export default router;
