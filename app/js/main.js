window.onload = function () {
  const colorSelect = document.querySelector('#color-select');
  
  const panorama = new Panorama({
    panorama:       '[data-panorama]',
    panoramaView:   '[data-panorama-view]',
    btnLeft:        '[data-panorama-left]',
    btnRight:       '[data-panorama-right]',
    numberOfFrames: 13,
    preload:        true,
    parameters:     {
      color: colorSelect.value
    }
  });
  
  colorSelect.addEventListener('change', function () {
    panorama.updateParameters({
      color: this.value
    });
  })
  
  const colorBtns = document.querySelectorAll('.color-btn');
  for (var i = 0, len = colorBtns.length; i < len; i++) {
    colorBtns[i].addEventListener('click', function () {
      panorama.updateParameters({
        color: this.getAttribute('data-color')
      });
    })
  }
};