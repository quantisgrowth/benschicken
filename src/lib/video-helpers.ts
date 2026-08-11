// Utility for identifying and formatting YouTube, Vimeo, and direct video sources

export type VideoSource =
  | { type: "youtube"; embedUrl: string; videoId: string }
  | { type: "vimeo"; embedUrl: string; videoId: string }
  | { type: "direct"; videoUrl: string }
  | { type: "empty" };

export function parseVideoSource(url: string | null | undefined): VideoSource {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { type: "empty" };
  }

  const trimmed = url.trim();

  // YouTube matchers: handles youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, query params etc.
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch?.[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo matchers: vimeo.com/123456789
  const vimeoRegex = /(?:vimeo\.com\/)(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch?.[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // Direct video file (mp4, webm, mov or signed storage URL)
  return {
    type: "direct",
    videoUrl: trimmed,
  };
}
