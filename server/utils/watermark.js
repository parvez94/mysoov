import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addWatermark = async (imagePath, outputPath) => {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    const mainFontSize = Math.min(metadata.width, metadata.height) * 0.08;
    const subFontSize = mainFontSize * 0.3;
    const lineSpacing = mainFontSize * 0.5;

    const svgText = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="black" flood-opacity="0.8"/>
          </filter>
        </defs>
        <style>
          .watermark-main { 
            fill: rgba(255, 255, 255, 0.3); 
            font-size: ${mainFontSize}px; 
            font-family: Arial, sans-serif; 
            font-weight: 900;
            letter-spacing: 6px;
            filter: url(#shadow);
          }
          .watermark-sub { 
            fill: rgba(255, 255, 255, 0.3); 
            font-size: ${subFontSize}px; 
            font-family: Arial, sans-serif; 
            font-weight: 600;
            letter-spacing: 2px;
            filter: url(#shadow);
          }
        </style>
        <g transform="rotate(-30 ${metadata.width / 2} ${metadata.height / 2})">
          <text x="50%" y="${metadata.height / 2 - lineSpacing / 2}px" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                class="watermark-main">
            MYSOOV TV
          </text>
          <text x="50%" y="${metadata.height / 2 + lineSpacing}px" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                class="watermark-sub">
            ALL RIGHTS RESERVED
          </text>
        </g>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);

    await image
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
};

export const createWatermarkedCopy = async (originalPath, originalName) => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 18);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);

    const watermarkedFileName = `${nameWithoutExt}_${timestamp}_${randomString}_watermarked${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const watermarkedPath = path.join(uploadsDir, watermarkedFileName);

    await addWatermark(originalPath, watermarkedPath);

    // Return relative URL - frontend will construct full URL with API base
    const watermarkedUrl = `/uploads/images/${watermarkedFileName}`;

    return {
      path: watermarkedPath,
      url: watermarkedUrl,
      fileName: watermarkedFileName,
    };
  } catch (error) {
    console.error('Error creating watermarked copy:', error);
    throw error;
  }
};
