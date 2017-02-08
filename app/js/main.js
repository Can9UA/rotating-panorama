window.onload = function () {
  const panorama = new Panorama({
    panorama:       '[data-panorama]',
    panoramaView:   '[data-panorama-view]',
    btnLeft:        '[data-panorama-left]',
    btnRight:       '[data-panorama-right]',
    numberOfFrames: 13,
    preload:        true,
    parameters:     {
      color: 'red'
    }
  });
  
  const colorSelect = document.querySelector('#color-select');
  colorSelect.addEventListener('change', function () {
    panorama.updateParameters({
      color: this.value.toString()
    });
  })
};