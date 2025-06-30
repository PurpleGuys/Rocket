// Polyfill pour import.meta.dirname dans Node.js
// Ce fichier résout l'problème de chemin undefined dans Docker

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Polyfill global pour import.meta.dirname si undefined
if (typeof import.meta.dirname === 'undefined') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Ajouter la propriété manquante
  Object.defineProperty(import.meta, 'dirname', {
    value: __dirname,
    writable: false,
    enumerable: true,
    configurable: false
  });
}

export const getServerDir = () => {
  try {
    return import.meta.dirname || dirname(fileURLToPath(import.meta.url));
  } catch (error) {
    // Fallback vers le répertoire courant
    return process.cwd() + '/server';
  }
};

export const getProjectRoot = () => {
  try {
    const serverDir = getServerDir();
    return dirname(serverDir);
  } catch (error) {
    return process.cwd();
  }
};