
window.onload = function () {
  const panorama = new Panorama({
    panorama:      '[data-panorama]',
    panoramaView:  '[data-panorama-view]',
    btnPrev:       '[data-panorama-prev]',
    btnNext:       '[data-panorama-next]',
    preloadImages: true,
    // startFrame:    40
  });
  console.log(panorama, body);
  // window.pan = panorama;
};