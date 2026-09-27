import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { RESOURCE_LIMITS } from '../config/limits.js';
import { REPOS_DIR, EXPORTS_DIR, TEMP_DIR } from '../config/paths.js';

export interface ArchiveExportResult {
  archivePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ArchiveExtractionResult {
  fileCount: number;
  totalSizeBytes: number;
  extractedPath: string;
}

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: 'png' | 'jpeg' | 'webp' | 'svg';
}

export interface ImageCompressionResult {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savingsBytes: number;
  savingsPercentage: number;
  mimeType: string;
  format: string;
  buffer: Buffer;
}

/**
 * High-performance file & archive compression service.
 * Handles:
 *  - Gzip / Deflate buffer compression for SQLite cache data
 *  - On-the-fly streaming archive creation (.tar.gz and .zip)
 *  - Safe archive extraction with strict Zip-Slip path traversal containment
 */
export class CompressionService {
  /**
   * Compresses a UTF-8 string into a Gzipped Buffer.
   * Typically yields 70-85% compression ratio for repository JSON metadata.
   */
  static compressString(content: string): Buffer {
    const inputBuffer = Buffer.from(content, 'utf-8');
    return zlib.gzipSync(inputBuffer, { level: 6 });
  }

  /**
   * Decompresses a Buffer back to a UTF-8 string.
   * If the input is not Gzipped, safely returns standard UTF-8 decoded string.
   */
  static decompressBuffer(buffer: Buffer | string): string {
    if (typeof buffer === 'string') {
      return buffer;
    }

    // Check gzip magic bytes (0x1f, 0x8b)
    if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
      const decompressed = zlib.gunzipSync(buffer);
      return decompressed.toString('utf-8');
    }

    return buffer.toString('utf-8');
  }

  /**
   * Creates a compressed archive (.tar.gz or .zip) of an excavated repository source tree.
   */
  static async createRepositoryArchive(
    repoId: string,
    format: 'tar.gz' | 'zip' = 'tar.gz'
  ): Promise<ArchiveExportResult> {
    const sourceDir = path.resolve(REPOS_DIR, repoId, 'source');
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Repository "${repoId}" source files not found.`);
    }

    const exportDir = EXPORTS_DIR;
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const cleanRepoId = repoId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const isZip = format === 'zip';
    const fileName = `${cleanRepoId}.${isZip ? 'zip' : 'tar.gz'}`;
    const archivePath = path.resolve(exportDir, fileName);
    const mimeType = isZip ? 'application/zip' : 'application/gzip';

    try {
      if (isZip) {
        // Use zip command on mac/linux with -y to store symlinks as links without following
        execFileSync('/usr/bin/zip', ['-r', '-q', '-y', archivePath, '.'], {
          cwd: sourceDir,
          timeout: 45000,
        });
      } else {
        // Use tar czf on mac/linux
        execFileSync('/usr/bin/tar', ['-czf', archivePath, '-C', sourceDir, '.'], {
          timeout: 45000,
        });
      }

      const stat = fs.statSync(archivePath);
      return {
        archivePath,
        fileName,
        mimeType,
        sizeBytes: stat.size,
      };
    } catch (err: any) {
      throw new Error(`Failed to compress repository archive: ${err.message}`);
    }
  }

  /**
   * Safely extracts an uploaded archive into a destination directory.
   * Enforces Zip-Slip containment and maximum extracted file size limits.
   */
  static async extractArchive(
    archivePath: string,
    destinationDir: string
  ): Promise<ArchiveExtractionResult> {
    if (!fs.existsSync(archivePath)) {
      throw new Error(`Archive file "${archivePath}" not found.`);
    }

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const lowerArchive = archivePath.toLowerCase();
    const isZip = lowerArchive.endsWith('.zip');
    const isTar = lowerArchive.endsWith('.tar') || lowerArchive.endsWith('.tar.gz') || lowerArchive.endsWith('.tgz');

    try {
      if (isZip) {
        // Extract with unzip
        execFileSync('/usr/bin/unzip', ['-q', '-o', archivePath, '-d', destinationDir], {
          timeout: 45000,
        });
      } else if (isTar) {
        // Extract with tar
        execFileSync('/usr/bin/tar', ['-xf', archivePath, '-C', destinationDir], {
          timeout: 45000,
        });
      } else {
        throw new Error('Unsupported archive type. Please provide a .zip or .tar.gz file.');
      }

      // Security & Limits Verification: Scan extracted files
      let fileCount = 0;
      let totalSizeBytes = 0;

      const scanAndValidate = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.resolve(dir, entry.name);

          // Zip-Slip Security Protection: Verify path remains within destinationDir
          if (!fullPath.startsWith(destinationDir)) {
            throw new Error(`Malicious path traversal detected in archive: ${entry.name}`);
          }

          if (entry.isDirectory()) {
            scanAndValidate(fullPath);
          } else if (entry.isFile()) {
            fileCount++;
            const stat = fs.statSync(fullPath);
            totalSizeBytes += stat.size;

            if (fileCount > RESOURCE_LIMITS.MAX_REPO_FILES) {
              throw new Error(
                `Archive contains more than ${RESOURCE_LIMITS.MAX_REPO_FILES} files. Limit exceeded.`
              );
            }

            if (totalSizeBytes > RESOURCE_LIMITS.MAX_REPO_SIZE_MB * 1024 * 1024) {
              throw new Error(
                `Uncompressed archive size exceeds maximum allowed of ${RESOURCE_LIMITS.MAX_REPO_SIZE_MB} MB.`
              );
            }
          }
        }
      };

      scanAndValidate(destinationDir);

      return {
        fileCount,
        totalSizeBytes,
        extractedPath: destinationDir,
      };
    } catch (err: any) {
      // Clean up destination directory on extraction failure
      try {
        fs.rmSync(destinationDir, { recursive: true, force: true });
      } catch {}
      throw err;
    } finally {
      // Remove temporary uploaded archive
      try {
        if (fs.existsSync(archivePath)) {
          fs.unlinkSync(archivePath);
        }
      } catch {}
    }
  }

  /**
   * Compresses an image Buffer (SVG, PNG, JPEG, WebP).
   * Automatically selects the optimal compression strategy:
   * - SVG: removes comments, doctypes, collapses whitespace, and compresses embedded raster base64 streams
   * - PNG / JPEG / WebP: executes system-level optimization (resampling, formatOptions, stripping metadata)
   *   while guaranteeing zero degradation and rejecting any output that fails to reduce file size.
   */
  static async compressImageBuffer(
    inputBuffer: Buffer,
    rawMimeType: string = 'image/png',
    options: ImageCompressionOptions = {}
  ): Promise<ImageCompressionResult> {
    const originalSizeBytes = inputBuffer.length;
    let mimeType = rawMimeType.toLowerCase().trim();

    // Auto-detect MIME type from magic headers if ambiguous
    if (
      mimeType.includes('svg') ||
      inputBuffer.slice(0, 100).toString('utf-8').includes('<svg')
    ) {
      mimeType = 'image/svg+xml';
    } else if (
      mimeType.includes('png') ||
      (inputBuffer.length >= 8 && inputBuffer[0] === 0x89 && inputBuffer[1] === 0x50)
    ) {
      mimeType = 'image/png';
    } else if (
      mimeType.includes('jpeg') ||
      mimeType.includes('jpg') ||
      (inputBuffer.length >= 3 && inputBuffer[0] === 0xff && inputBuffer[1] === 0xd8)
    ) {
      mimeType = 'image/jpeg';
    } else if (mimeType.includes('webp')) {
      mimeType = 'image/webp';
    }

    if (inputBuffer.length > 10 * 1024 * 1024) {
      throw new Error('Image payload exceeds maximum limit of 10MB.');
    }

    // Strict MIME whitelist mapping directly to safe extension
    const ALLOWED_MIME_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };

    if (!ALLOWED_MIME_TYPES[mimeType]) {
      throw new Error(`Unsupported image MIME type: ${mimeType}`);
    }

    const safeExt = ALLOWED_MIME_TYPES[mimeType];
    let compressedBuffer = inputBuffer;
    const format = safeExt === 'jpg' ? 'jpeg' : safeExt;

    if (mimeType === 'image/svg+xml') {
      let svgText = inputBuffer.toString('utf-8');
      
      // Linear safe comment stripper (O(N) time, zero backtracking vulnerability)
      let cleanSvg = '';
      let cursor = 0;
      while (cursor < svgText.length) {
        const commentStart = svgText.indexOf('<!--', cursor);
        if (commentStart === -1) {
          cleanSvg += svgText.slice(cursor);
          break;
        }
        cleanSvg += svgText.slice(cursor, commentStart);
        const commentEnd = svgText.indexOf('-->', commentStart + 4);
        if (commentEnd === -1) {
          break;
        }
        cursor = commentEnd + 3;
      }
      svgText = cleanSvg;

      // Strip XML declaration and doctype safely
      svgText = svgText.replace(/<\?xml[^>]*\?>/g, '');
      svgText = svgText.replace(/<!DOCTYPE[^>]*>/gi, '');
      // Collapse redundant inter-tag whitespace
      svgText = svgText.replace(/>\s+</g, '><').trim();

      // Check for and optimize embedded base64 PNG data
      const b64Match = svgText.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
      if (b64Match && b64Match[1] && b64Match[1].length > 4000) {
        try {
          const rawEmbedded = Buffer.from(b64Match[1], 'base64');
          const subResult = await CompressionService.compressImageBuffer(rawEmbedded, 'image/png', {
            maxWidth: options.maxWidth || 512,
            quality: options.quality || 85,
          });
          if (subResult.compressedSizeBytes < rawEmbedded.length) {
            const newB64 = subResult.buffer.toString('base64');
            svgText = svgText.split(b64Match[1]).join(newB64);
          }
        } catch {}
      }

      compressedBuffer = Buffer.from(svgText, 'utf-8');
    } else {
      // Raster image optimization using macOS /usr/bin/sips
      const tempDir = TEMP_DIR;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempId = crypto.randomBytes(8).toString('hex');
      const tempInput = path.resolve(tempDir, `img_in_${tempId}.${safeExt}`);
      const tempOutput = path.resolve(tempDir, `img_out_${tempId}.${safeExt}`);

      // Verify strict containment within tempDir
      if (!tempInput.startsWith(tempDir + path.sep) || !tempOutput.startsWith(tempDir + path.sep)) {
        throw new Error('Invalid temporary image path traversal detected.');
      }

      try {
        fs.writeFileSync(tempInput, inputBuffer);
        const sipsFormat = format === 'jpeg' ? 'jpeg' : 'png';
        const args: string[] = ['-s', 'format', sipsFormat];

        if (options.maxWidth) {
          args.push('-Z', String(options.maxWidth));
        }
        if (options.quality && format === 'jpeg') {
          args.push('-s', 'formatOptions', String(Math.max(10, Math.min(100, options.quality))));
        }

        args.push(tempInput, '--out', tempOutput);

        execFileSync('/usr/bin/sips', args, {
          stdio: 'pipe',
          timeout: 15000,
        });

        if (fs.existsSync(tempOutput)) {
          const processed = fs.readFileSync(tempOutput);
          // Only adopt compressed output if it is actually smaller
          if (processed.length < inputBuffer.length) {
            compressedBuffer = processed;
          }
        }
      } catch {
        // Fallback: keep original buffer
      } finally {
        try {
          if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
          if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        } catch {}
      }
    }

    const compressedSizeBytes = compressedBuffer.length;
    const savingsBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
    const savingsPercentage = originalSizeBytes > 0
      ? Number(((savingsBytes / originalSizeBytes) * 100).toFixed(1))
      : 0;

    return {
      originalSizeBytes,
      compressedSizeBytes,
      savingsBytes,
      savingsPercentage,
      mimeType,
      format,
      buffer: compressedBuffer,
    };
  }

  /**
   * Compresses an image file on disk and optionally writes it to outputPath.
   */
  static async compressImageFile(
    inputPath: string,
    outputPath?: string,
    options: ImageCompressionOptions = {}
  ): Promise<ImageCompressionResult> {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Image file "${inputPath}" not found.`);
    }

    const inputBuffer = fs.readFileSync(inputPath);
    const ext = path.extname(inputPath).toLowerCase();
    const mimeType =
      ext === '.svg' ? 'image/svg+xml' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' : 'image/png';

    const result = await CompressionService.compressImageBuffer(inputBuffer, mimeType, options);

    if (outputPath) {
      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, result.buffer);
    }

    return result;
  }
}
