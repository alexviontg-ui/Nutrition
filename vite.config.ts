/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : l'app fonctionne quelle que soit l'adresse
  // (ex. https://pseudo.github.io/nom-du-depot/) grâce à la navigation par #.
  base: './',
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
