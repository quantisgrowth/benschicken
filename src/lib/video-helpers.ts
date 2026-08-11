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

  // YouTube matchers: youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/shorts/
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
  );
  if (ytMatch?.[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo matchers: vimeo.com/123456789
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
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
