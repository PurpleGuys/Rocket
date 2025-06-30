// Fix pour import.meta.dirname undefined dans Node.js production
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Créer un polyfill global pour import.meta.dirname
const createDirnameFix = () => {
  // Si import.meta.dirname n'existe pas, le créer
  if (typeof globalThis.importMetaDirname === 'undefined') {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      globalThis.importMetaDirname = __dirname;
    } catch (error) {
      // Fallback vers le cwd/server
      globalThis.importMetaDirname = resolve(process.cwd(), 'server');
    }
  }
  
  return globalThis.importMetaDirname;
};

// Exporter une fonction utilitaire pour obtenir le dirname
export const getImportMetaDirname = () => {
  return createDirnameFix();
};

// Appliquer le fix immédiatement
createDirnameFix();

// Monkey patch pour path.resolve si nécessaire
const originalResolve = resolve;
export const safeResolve = (...paths) => {
  try {
    // Remplacer undefined par le dirname fixé
    const fixedPaths = paths.map(p => 
      p === undefined ? getImportMetaDirname() : p
    );
    return originalResolve(...fixedPaths);
  } catch (error) {
    console.warn('Path resolution error:', error.message);
    // Fallback vers un chemin par défaut
    return resolve(process.cwd(), 'server');
  }
};