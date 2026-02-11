const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, 'public', 'icons', 'icon.svg');
const outputDir = path.join(__dirname, 'public', 'icons');

// Create simple PNG icons with canvas if sharp is not available
async function generateIcons() {
  try {
    // Try using sharp
    const sharpModule = require('sharp');
    
    for (const size of sizes) {
      await sharpModule(inputSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Generated icon-${size}x${size}.png`);
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.log('Sharp not available, creating placeholder script...');
    console.log('You can generate icons manually or use an online tool like:');
    console.log('- https://realfavicongenerator.net/');
    console.log('- https://www.favicon-generator.org/');
    console.log('\nOr install sharp: npm install sharp --save-dev');
  }
}

generateIcons();
