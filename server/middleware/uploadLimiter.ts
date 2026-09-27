import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { RESOURCE_LIMITS } from '../config/limits.js';
import { UPLOAD_TEMP_DIR } from '../config/paths.js';

if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
  fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
}

// Disk storage with unique temporary file naming
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, unique);
  },
});

// File filter: strictly allow repository archives (.zip, .tar, .tar.gz, .tgz)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.zip', '.tar', '.gz', '.tgz'];
  const ext = path.extname(file.originalname).toLowerCase();
  const isTarGz = file.originalname.toLowerCase().endsWith('.tar.gz');

  if (allowedExtensions.includes(ext) || isTarGz) {
    cb(null, true);
  } else {
    const error: any = new Error(
      `Unsupported archive format "${ext}". Supported formats are: .zip, .tar.gz, .tgz, .tar`
    );
    error.code = 'INVALID_ARCHIVE_FORMAT';
    error.status = 400;
    cb(error);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES,
    files: 1,
    fields: 10,
  },
  fileFilter,
});

/**
 * Upload Limiter Middleware.
 * Enforces strict upload payload size bounds upfront via Content-Length and during multipart streaming.
 */
export function repositoryArchiveUpload(fieldName: string = 'archive') {
  const multerHandler = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Upfront Content-Length check to fail-fast before buffering network bytes
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES) {
      const sizeMb = (contentLength / (1024 * 1024)).toFixed(2);
      return res.status(413).json({
        error: 'Payload Too Large',
        detail: `Upload size of ${sizeMb} MB exceeds maximum allowed limit of ${RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB} MB.`,
        code: 'UPLOAD_SIZE_EXCEEDED',
        status: 413,
        max_bytes: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES,
        max_mb: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB,
      });
    }

    // 2. Stream-based multipart processing with Multer
    multerHandler(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Payload Too Large',
            detail: `Uploaded archive exceeds maximum permitted limit of ${RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB} MB.`,
            code: 'UPLOAD_SIZE_EXCEEDED',
            status: 413,
            max_bytes: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES,
            max_mb: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB,
          });
        }

        if (err.code === 'INVALID_ARCHIVE_FORMAT') {
          return res.status(400).json({
            error: 'Bad Request',
            detail: err.message,
            code: 'INVALID_ARCHIVE_FORMAT',
            status: 400,
          });
        }

        return res.status(err.status || 400).json({
          error: 'Upload Error',
          detail: err.message || 'Error uploading file archive.',
          code: err.code || 'UPLOAD_FAILED',
          status: err.status || 400,
        });
      }

      next();
    });
  };
}
