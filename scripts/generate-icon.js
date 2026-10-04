const fs = require('fs');
const path = require('path');

console.log('[INFO] Script started...');

let sharp;
try {
  sharp = require('sharp');
  console.log('[INFO] sharp library loaded successfully.');
} catch (err) {
  console.error('[ERROR] Failed to load sharp. Please run "npm install -D sharp".');
  console.error(err.message);
  process.exit(1);
}

// Updated SVG Template: "v2" badge removed and text centered
const svgTemplate = `
<svg width="1024" height="1024" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1E1B4B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0B0F19" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#A855F7" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <rect width="280" height="280" fill="#0B0F19" />
  <rect x="10" y="10" width="260" height="260" rx="56" fill="url(#bgGlow)" />
  <circle cx="140" cy="130" r="85" stroke="url(#ringGrad)" stroke-width="3" fill="none" />

  <g opacity="0.6">
    <circle cx="80" cy="80" r="4" fill="#38BDF8" />
    <circle cx="200" cy="80" r="4" fill="#A855F7" />
    <circle cx="60" cy="140" r="3" fill="#6366F1" />
    <circle cx="220" cy="140" r="3" fill="#6366F1" />
  </g>

  <g>
    <rect x="85" y="110" width="8" height="40" rx="4" fill="url(#waveGrad)" />
    <rect x="103" y="95" width="8" height="70" rx="4" fill="url(#waveGrad)" />
    <rect x="121" y="80" width="8" height="100" rx="4" fill="url(#waveGrad)" />
    <rect x="139" y="70" width="8" height="120" rx="4" fill="url(#waveGrad)" />
    <rect x="157" y="80" width="8" height="100" rx="4" fill="url(#waveGrad)" />
    <rect x="175" y="95" width="8" height="70" rx="4" fill="url(#waveGrad)" />
    <rect x="193" y="110" width="8" height="40" rx="4" fill="url(#waveGrad)" />
  </g>

  <!-- Centered MoCoSS Typography (v2 removed) -->
  <text x="140" y="220" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#F8FAFC" text-anchor="middle" letter-spacing="3">
    MoCoSS
  </text>
</svg>
`;

async function generateAppIcons() {
  const assetsDir = path.resolve(__dirname, '../assets');
  console.log(`[INFO] Target Assets Directory: ${assetsDir}`);

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgTemplate);

  const iconPath = path.join(assetsDir, 'icon.png');
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');

  console.log('[INFO] Generating icon.png (1024x1024)...');
  await sharp(svgBuffer).resize(1024, 1024).png().toFile(iconPath);
  console.log(`[SUCCESS] Wrote file: ${iconPath}`);

  console.log('[INFO] Generating adaptive-icon.png (1024x1024)...');
  await sharp(svgBuffer).resize(1024, 1024).png().toFile(adaptiveIconPath);
  console.log(`[SUCCESS] Wrote file: ${adaptiveIconPath}`);
}

generateAppIcons()
  .then(() => {
    console.log('[SUCCESS] All app icons successfully updated without v2!');
  })
  .catch((err) => {
    console.error('[ERROR] An unexpected error occurred:');
    console.error(err);
  });