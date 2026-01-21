import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Process video with trimming and audio mixing
 * @param {string} videoPath - Path to original video file
 * @param {object} metadata - Video editing metadata
 * @param {string} outputPath - Path to save processed video
 * @returns {Promise<string>} - Path to processed video
 */
export const processVideo = async (videoPath, metadata, outputPath) => {
  const { trimStart, trimEnd, backgroundMusic, musicVolume = 0.5, originalVolume = 1 } = metadata || {};

  console.log('🎥 processVideo called with:');
  console.log('  - videoPath:', videoPath);
  console.log('  - metadata:', metadata);
  console.log('  - trimStart:', trimStart, 'trimEnd:', trimEnd);
  console.log('  - outputPath:', outputPath);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath);

    // Apply trimming if specified
    if (trimStart !== undefined && trimEnd !== undefined) {
      const duration = trimEnd - trimStart;
      console.log('✂️ Applying trim: start =', trimStart, 'duration =', duration);
      command = command
        .setStartTime(trimStart)
        .setDuration(duration);
    } else {
      console.log('⚠️ No trimming applied - trimStart or trimEnd is undefined');
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
          `[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[aout]`
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
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart'
      ])
      .on('end', () => {
        console.log('✅ Video processing completed:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('❌ Video processing error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`Video processing failed: ${err.message}`));
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.round(progress.percent)}% done`);
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

export default {
  processVideo,
  getVideoDuration,
  extractAudio
};
