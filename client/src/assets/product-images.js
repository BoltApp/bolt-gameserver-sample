// vite-imagetools query-param imports.
// TypeScript resolves the companion product-images.d.ts for types.
// Vite processes this file and runs the actual imagetools transforms at build time.

// Icons: WebP at 2× display size (displayed at 80–88px), single URL
export { default as IconSwipeableAds } from "./icon-swipeable-ads.png?w=160&format=webp";
export { default as IconCarouselAds } from "./icon-carousel-ads.png?w=160&format=webp";
export { default as IconVideoAds } from "./icon-video-ads.png?w=160&format=webp";
export { default as IconGameController } from "./icon-game-controller.png?w=176&format=webp";
export { default as IconCheckoutProduct } from "./icon-checkout-product.png?w=160&format=webp";

// Ad preview images: displayed at height 400px (fixed CSS), width ~300px
// Generates two sizes and returns a "url 300w, url 600w" srcset string
export { default as PreviewSwipeableAdSrcSet } from "./preview-swipeable-ad.png?w=300;600&format=webp&as=srcset";
export { default as PreviewCarouselAdSrcSet } from "./preview-carousel-ad.png?w=300;600&format=webp&as=srcset";
export { default as PreviewVideoAdSrcSet } from "./preview-video-ad.png?w=300;600&format=webp&as=srcset";
export { default as PreviewCheckoutProductSrcSet } from "./preview-checkout-product.png?w=300;600&format=webp&as=srcset";

// Game preview images: displayed at exactly 200×250px with object-fit: cover
// Generates two sizes and returns a "url 200w, url 400w" srcset string
export { default as PreviewSwipeableGameSrcSet } from "./preview-swipeable-game.png?w=200;400&format=webp&as=srcset";
export { default as PreviewCarouselGameSrcSet } from "./preview-carousel-game.jpg?w=200;400&format=webp&as=srcset";
export { default as PreviewVideoGameSrcSet } from "./preview-video-game.jpg?w=200;400&format=webp&as=srcset";
export { default as PreviewCheckoutGameSrcSet } from "./preview-checkout-game.png?w=200;400&format=webp&as=srcset";
