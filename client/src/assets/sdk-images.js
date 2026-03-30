// vite-imagetools query-param imports.
// TypeScript resolves the companion sdk-images.d.ts for types.
// Vite processes this file and runs the actual imagetools transforms at build time.

// SDK preview images: displayed at width 400px (fixed CSS)
export { default as PreviewUnitySrcSet } from "./preview-unity.png?w=400;800&format=webp&as=srcset";
export { default as PreviewJSSrcSet } from "./preview-js.jpg?w=400;800&format=webp&as=srcset";
