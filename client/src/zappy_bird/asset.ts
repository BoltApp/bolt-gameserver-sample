// Ensure Vite bundles every asset under this folder and gives us stable URLs.
// We then look up by a normalized relative path like `images/bird.png`.
const assetUrls = import.meta.glob('./assets/**/*', {
    eager: true,
    import: 'default',
    query: '?url',
  }) as Record<string, string>;
  
  export function zappyAssetUrl(relativePathFromAssets: string): string {
    const key = `./assets/${relativePathFromAssets}`.replaceAll('\\', '/');
    const url = assetUrls[key];
    if (!url) {
      console.error(`desired asset isn't under src/zappy_bird/assets/`);
      return new URL(key, import.meta.url).toString();
    }
    return url;
  }
  