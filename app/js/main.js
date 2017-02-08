window.onload = function () {
  const panorama = new Panorama({
    panorama:     '[data-panorama]',
    panoramaView: '[data-panorama-view]',
    btnLeft:      '[data-panorama-left]',
    btnRight:     '[data-panorama-right]',
    frames:       50,
    preload:      true,
    parameters:   {
      color: 'red'
    }
    // startFrame: 40
  });
  
  const colorSelect = document.querySelector('#color');
  colorSelect.addEventListener('change', function () {
    panorama.updateParameters({
      color: this.value.toString()
    });
  })
};