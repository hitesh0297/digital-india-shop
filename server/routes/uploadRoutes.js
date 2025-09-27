// routes/uploadRoutes.js (ESM)
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import express, { Router } from 'express'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Ensure uploads dir exists: <project-root>/uploads
const uploadDir = path.join(__dirname, '..', process.env.FILE_UPLOAD_DIR || 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadDir) },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
  }
})

const fileFilter = (req, file, cb) => {
  const isImage = /image\/(png|jpe?g|webp|gif)/i.test(file.mimetype)
  cb(isImage ? null : new Error('Images only'), isImage)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/', upload.single('image'), (req, res) => {
  // Served by: app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
  res.status(201).json({ file: `/uploads/${req.file.filename}` })
})

export default router
