// Turns YouTube / Google Drive share links into embeddable URLs.
window.HVMedia = (() => {
  function youTubeId(url) {
    const patterns = [
      /youtu\.be\/([\w-]{11})/,
      /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
      /youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function driveId(url) {
    if (!/drive\.google\.com|docs\.google\.com/.test(url)) return null;
    const m = url.match(/\/d\/([\w-]{10,})/) || url.match(/[?&]id=([\w-]{10,})/);
    return m ? m[1] : null;
  }

  // Returns { type: "youtube" | "drive" | "link", url, embedUrl? }
  function parse(url) {
    const yt = youTubeId(url);
    if (yt) return { type: "youtube", url, embedUrl: `https://www.youtube-nocookie.com/embed/${yt}` };
    const drive = driveId(url);
    if (drive) return { type: "drive", url, embedUrl: `https://drive.google.com/file/d/${drive}/preview` };
    return { type: "link", url };
  }

  // Google Drive share links don't work directly in <img>; use the thumbnail endpoint.
  function imageUrl(src) {
    if (!src) return "images/placeholder.svg";
    const drive = driveId(src);
    return drive ? `https://drive.google.com/thumbnail?id=${drive}&sz=w1200` : src;
  }

  return { parse, imageUrl };
})();
