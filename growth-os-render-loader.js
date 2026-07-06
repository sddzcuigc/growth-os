(() => {
  const parts = Array.isArray(window.GROWTH_OS_RENDER_PARTS) ? window.GROWTH_OS_RENDER_PARTS : [];
  if (parts.length) {
    window.GROWTH_OS_RENDER = `data:image/webp;base64,${parts.join("")}`;
  }
  delete window.GROWTH_OS_RENDER_PARTS;
})();
