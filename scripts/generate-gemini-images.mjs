import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

function saveBufferAtomically(targetPath, buffer, expectedType = 'png') {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${targetPath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, buffer);

  // Validate magic bytes
  if (expectedType === 'png') {
    const isPng = buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    if (!isPng) {
      fs.unlinkSync(tmpPath);
      throw new Error(`Corrupted PNG generated for ${targetPath}`);
    }
  } else if (expectedType === 'jpeg' || expectedType === 'jpg') {
    const isJpg = buffer.length >= 3 &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (!isJpg) {
      fs.unlinkSync(tmpPath);
      throw new Error(`Corrupted JPEG generated for ${targetPath}`);
    }
  }

  fs.renameSync(tmpPath, targetPath);
}

async function generateAndSave(ai, prompt, targetPath, aspectRatio) {
  console.log(`\nAppel du modèle imagen-3.0-generate-002 pour générer : ${path.basename(targetPath)}...`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`Aspect Ratio requis : ${aspectRatio}`);

  const isJpeg = targetPath.endsWith('.jpg') || targetPath.endsWith('.jpeg');
  const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: mimeType,
        aspectRatio: aspectRatio,
      }
    });

    let imageBase64 = null;
    
    // Extraction des données de l'image
    if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image && response.generatedImages[0].image.imageBytes) {
      imageBase64 = response.generatedImages[0].image.imageBytes;
    }

    if (!imageBase64) {
      throw new Error('Données binaires de l\'image introuvables dans la réponse de l\'API (generateImages).');
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    
    // Sauvegarder atomiquement
    saveBufferAtomically(targetPath, buffer, isJpeg ? 'jpeg' : 'png');
    console.log(`✅ Image enregistrée atomiquement : ${targetPath} (${Math.round(buffer.length / 1024)} KB)`);
    return true;
  } catch (error) {
    console.error(`❌ Échec de la génération de ${path.basename(targetPath)} :`, error.message);
    return false;
  }
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ La variable GEMINI_API_KEY n\'est pas définie dans l\'environnement.');
    process.exit(1);
  }

  console.log('🚀 Initialisation du client GoogleGenAI avec imagen-3.0-generate-002...');
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const tasks = [
    {
      prompt: 'Subtle traditional North African Arabesque geometric tile pattern, seamless gold and off-white ornamental lines on a soft cream elegant background texture for e-commerce website',
      path: 'public/images/textures/arabesque.png',
      aspectRatio: '1:1'
    },
    {
      prompt: 'Subtle organic linen textile fabric weave texture, seamless light off-white soft neutral background pattern for modern minimalist web design',
      path: 'public/images/textures/clean-textile.png',
      aspectRatio: '1:1'
    },
    {
      prompt: 'Subtle traditional Algerian floral Zellige tile mosaic background texture, soft warm cream and emerald green tiles with delicate gold geometric details, seamless repeating pattern',
      path: 'public/images/textures/moroccan-flower.png',
      aspectRatio: '1:1'
    },
    {
      prompt: 'Luxury modern e-commerce hero banner showcase for Olmart Algerian Marketplace, displaying elegant traditional handcrafted ceramics, leather bags, organic dates, and sleek high-tech smartphones on a premium emerald green and gold background, high resolution 16:9 banner',
      path: 'src/assets/images/premium_algerian_marketplace_banner_1780280262615.png',
      aspectRatio: '16:9'
    },
    {
      prompt: 'High resolution promotional cover image for Olmart online Algerian marketplace, displaying traditional clay pottery, golden dates fruit, elegant leather sandals, and electronics against a modern emerald and sand-color backdrop with Arabic geometric design, clean professional photography',
      path: 'public/marketplace.jpg',
      aspectRatio: '16:9'
    },
    {
      prompt: 'Elegant clean e-commerce desktop application dashboard screenshot mockup for Olmart premium marketplace, showcasing a grid of Algerian products, ceramics, organic olive oil, dates, emerald headers, clean search UI and analytics graphics, modern light theme flat design',
      path: 'screenshot.png',
      aspectRatio: '16:9'
    }
  ];

  let successCount = 0;
  for (const task of tasks) {
    const success = await generateAndSave(ai, task.prompt, task.path, task.aspectRatio);
    if (success) {
      successCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 Génération d'images terminée ! Réussies : ${successCount}/${tasks.length}`);
}

run();
