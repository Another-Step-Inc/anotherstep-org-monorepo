export const getVariantClass = (rawVariant: any) => {
    let value = "";
    if (typeof rawVariant === "string") {
        value = rawVariant;
    } else if (Array.isArray(rawVariant) && rawVariant.length > 0) {
        value = typeof rawVariant[0] === "string" ? rawVariant[0] : rawVariant[0]?.value || "";
    } else if (typeof rawVariant === "object" && rawVariant !== null) {
        value = rawVariant.value || rawVariant.label || "";
    }

    const normalized = value.toLowerCase().trim();

    if (normalized === "tall") return "masonry-item-tall";
    if (normalized === "wide") return "masonry-item-wide";
    return "";
};

export const resolveImageUrl = (imgField: any) => {
    if (!imgField) return "";
    // Check direct URL string, node properties, or root properties
    if (typeof imgField === "string") return imgField;
    const rawUrl = imgField.node?.sourceUrl || imgField.node?.mediaItemUrl || imgField.sourceUrl || imgField.mediaItemUrl || "";
    
    // If WP returns a relative URL, prepend your WP backend base domain
    if (rawUrl.startsWith("/")) {
        const wpBase = import.meta.env.PUBLIC_WORDPRESS_API_URL || "http://localhost:8000";
        return `${wpBase.replace(/\/$/, "")}${rawUrl}`;
    }
    return rawUrl;
};

export const getEmbedUrl = (input: string) => {
  if (!input) return "";

  let url = input;
  const iframeSrcMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1];
  }

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};