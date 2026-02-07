import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Process video with trimming and audio mixing
 * @param {string} videoPath - Path to original video file
 * @param {object} metadata - Video editing metadata
 * @param {string} outputPath - Path to save processed video
 * @returns {Promise<string>} - Path to processed video
 */
export const processVideo = async (videoPath, metadata, outputPath) => {
  const {
    trimStart,
    trimEnd,
    backgroundMusic,
    musicVolume = 0.5,
    originalVolume = 1,
  } = metadata || {};

  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath);

    // Apply trimming if specified
    if (trimStart !== undefined && trimEnd !== undefined) {
      const duration = trimEnd - trimStart;
      command = command.setStartTime(trimStart).setDuration(duration);
    } else {
    }

    // If background music is provided, mix it with the video
    if (backgroundMusic && fs.existsSync(backgroundMusic)) {
      command = command
        .input(backgroundMusic)
        .complexFilter([
          // Adjust original video audio volume
          `[0:a]volume=${originalVolume}[a1]`,
          // Adjust background music volume and loop it
          `[1:a]volume=${musicVolume},aloop=loop=-1:size=2e+09[a2]`,
          // Mix both audio streams
          `[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
        ])
        .outputOptions(['-map', '0:v', '-map', '[aout]']);
    } else if (originalVolume !== 1) {
      // Only adjust original video volume
      command = command.audioFilters(`volume=${originalVolume}`);
    }

    // Set output options
    command
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('192k')
      .outputOptions([
        '-preset',
        'fast',
        '-crf',
        '23',
        '-movflags',
        '+faststart',
      ])
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('❌ Video processing error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`Video processing failed: ${err.message}`));
      })
      .on('progress', (progress) => {
        if (progress.percent) {
        }
      })
      .run();
  });
};

/**
 * Get video duration
 * @param {string} videoPath - Path to video file
 * @returns {Promise<number>} - Duration in seconds
 */
export const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration);
      }
    });
  });
};

/**
 * Extract audio from video
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path to save audio
 * @returns {Promise<string>} - Path to extracted audio
 */
export const extractAudio = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};

/**
 * Add permanent watermark to video (matches image watermark styling exactly)
 * @param {string} videoPath - Path to original video file
 * @param {string} outputPath - Path to save watermarked video
 * @returns {Promise<string>} - Path to watermarked video
 */
export const addVideoWatermark = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    // First, get video dimensions to calculate font sizes
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to probe video: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === 'video',
      );
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      const width = videoStream.width;
      const height = videoStream.height;

      // Calculate font sizes to match image watermark (10% of min dimension)
      const mainFontSize = Math.floor(Math.min(width, height) * 0.1);
      const subFontSize = Math.floor(mainFontSize * 0.4);
      const lineSpacing = Math.floor(mainFontSize * 0.5);

      // Font file path (try Arial Bold, fallback to default)
      let fontfile = '';
      if (fs.existsSync('/System/Library/Fonts/Supplemental/Arial Bold.ttf')) {
        fontfile = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
      } else if (
        fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
      ) {
        fontfile = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
      }

      const filterComplex = [
        `drawtext=text='MYSOOV TV':` +
          `fontsize=${mainFontSize}:` +
          (fontfile ? `fontfile=${fontfile}:` : '') +
          `fontcolor=white@0.6:` +
          `x=(w-text_w)/2:` +
          `y=(h-text_h)/2-${lineSpacing / 2}:` +
          `shadowcolor=black@0.3:` +
          `shadowx=0:` +
          `shadowy=0:` +
          `borderw=2:` +
          `bordercolor=black@0.6`,

        `drawtext=text='ALL RIGHTS RESERVED':` +
          `fontsize=${subFontSize}:` +
          (fontfile ? `fontfile=${fontfile}:` : '') +
          `fontcolor=white@0.6:` +
          `x=(w-text_w)/2:` +
          `y=(h-text_h)/2+${lineSpacing}:` +
          `shadowcolor=black@0.3:` +
          `shadowx=0:` +
          `shadowy=0:` +
          `borderw=1:` +
          `bordercolor=black@0.6`,
      ].join(',');

      ffmpeg(videoPath)
        .videoFilters(filterComplex)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('192k')
        .outputOptions([
          '-preset',
          'fast',
          '-crf',
          '23',
          '-movflags',
          '+faststart',
        ])
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err, stdout, stderr) => {
          console.error('❌ Video watermarking error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`Video watermarking failed: ${err.message}`));
        })
        .on('progress', (progress) => {
          if (progress.percent) {
          }
        })
        .run();
    });
  });
};

/**
 * Create watermarked copy of video for film directory
 * @param {string} originalPath - Path to original video file
 * @param {string} originalName - Original filename
 * @returns {Promise<object>} - Object with path, url, and fileName
 */
export const createWatermarkedVideoCopy = async (
  originalPath,
  originalName,
) => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 18);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);

    const watermarkedFileName = `${nameWithoutExt}_${timestamp}_${randomString}_watermarked${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const watermarkedPath = path.join(uploadsDir, watermarkedFileName);

    await addVideoWatermark(originalPath, watermarkedPath);

    const watermarkedUrl = `/uploads/videos/${watermarkedFileName}`;

    return {
      path: watermarkedPath,
      url: watermarkedUrl,
      fileName: watermarkedFileName,
    };
  } catch (error) {
    console.error('Error creating watermarked video copy:', error);
    throw error;
  }
};

export default {
  processVideo,
  getVideoDuration,
  extractAudio,
  addVideoWatermark,
  createWatermarkedVideoCopy,
};
