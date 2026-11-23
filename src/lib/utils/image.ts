/**
 * Genera la URL WebP a partir de una URL de imagen.
 * Reemplaza la extensión por .webp manteniendo el resto de la URL.
 */
export function toWebpUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\.(png|jpe?g|gif|bmp|tiff?|svg)(\?.*)?$/i, '.webp$2');
}

/**
 * Genera la URL de fallback (formato original) a partir de una URL WebP.
 * Útil si se tiene la URL WebP y se necesita el fallback.
 */
export function fromWebpUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\.webp(\?.*)?$/i, '.png$1');
}