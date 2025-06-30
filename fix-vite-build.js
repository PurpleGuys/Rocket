// Script pour corriger le problème import.meta.dirname dans vite.ts avant le build
import fs from 'fs';
import path from 'path';

console.log('🔧 Correction du fichier vite.ts pour Docker...');

const viteFilePath = path.join(process.cwd(), 'server', 'vite.ts');
const backupPath = viteFilePath + '.backup';

try {
  // Faire une sauvegarde du fichier original
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(viteFilePath, backupPath);
    console.log('✅ Sauvegarde créée: vite.ts.backup');
  }

  // Lire le contenu du fichier
  let content = fs.readFileSync(viteFilePath, 'utf-8');

  // Ajouter l'import pour fileURLToPath et dirname
  if (!content.includes('import { fileURLToPath }')) {
    content = content.replace(
      'import { createServer as createViteServer, createLogger } from "vite";',
      `import { createServer as createViteServer, createLogger } from "vite";
import { fileURLToPath } from "url";`
    );
  }

  // Ajouter la définition de __dirname
  if (!content.includes('const __dirname =')) {
    content = content.replace(
      'const viteLogger = createLogger();',
      `const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();`
    );
  }

  // Remplacer import.meta.dirname par __dirname
  content = content.replace(/import\.meta\.dirname/g, '__dirname');

  // Écrire le fichier corrigé
  fs.writeFileSync(viteFilePath, content);
  console.log('✅ Fichier vite.ts corrigé avec succès');

  // Vérifier que les changements ont été appliqués
  const correctedContent = fs.readFileSync(viteFilePath, 'utf-8');
  if (correctedContent.includes('__dirname') && !correctedContent.includes('import.meta.dirname')) {
    console.log('✅ Correction confirmée - import.meta.dirname remplacé par __dirname');
  } else {
    console.log('⚠️  Attention: La correction pourrait ne pas être complète');
  }

} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
  process.exit(1);
}