window.onload = function () {
  const panorama = new Panorama({
    panorama:      '[data-panorama]',
    panoramaView:  '[data-panorama-view]',
    btnPrev:       '[data-panorama-prev]',
    btnNext:       '[data-panorama-next]',
    preload: true,
    parameters:    {
      color: 'red'
    }
    // startFrame:    40
  });
  
  const colorSelect = document.querySelector('#color');
  colorSelect.addEventListener('change', function () {
    panorama.updateParameters({
      color: this.value
    });
  })
};