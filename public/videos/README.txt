VIDEO SETUP INSTRUCTIONS
========================
Place your hero video file here:

  /public/videos/hero.mp4        ← required

Optional (for better compression in modern browsers):
  /public/videos/hero.webm       ← optional

The video will:
  • Autoplay on page load
  • Loop continuously
  • Be muted (required for autoplay in all browsers)
  • Show /images/background/1.webp as a poster until the video loads

If you add a WebM version, open src/pages/Home.jsx and
uncomment the <source src="/videos/hero.webm"> line.
