// The photo and video gallery of a year (İçerik → Galeri). Photos are uploaded (stored in the
// database, /media/<id>); videos are YouTube or Vimeo links, since video files are too large
// for the database and the upload limit.
export type GalleryItem = { image: string; video: string; caption: { tr: string; en: string } };

export const emptyGalleryItem = (): GalleryItem => ({ image: "", video: "", caption: { tr: "", en: "" } });

// The player address and, for YouTube, a preview image of a video link; null if not supported.
export function videoEmbed(url: string): { embed: string; thumbnail: string | null } | null {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) {
    return {
      embed: `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&rel=0`,
      thumbnail: `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { embed: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`, thumbnail: null };
  return null;
}
