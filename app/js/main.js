window.onload = function () {
  const colorSelect = document.querySelector('#color-select');
  
  // init Panorama plugin start
  const panorama = new Panorama({
    panorama:       '[data-panorama]',
    panoramaView:   '[data-panorama-view]',
    btnLeft:        '[data-panorama-left]',
    btnRight:       '[data-panorama-right]',
    numberOfFrames: 13,
    preload:        true,
    parameters:     {
      color: colorSelect.value // set color according to current select color
    }
  });
  
  /***
  * Custom options
  * startFrame: number - from what frame should panorama start
  * getSourceCallback: function (ui: panorama - all plugin options, frame: number - next frame index): string {
  *   return source; // path to frame image
  * }
  * 
  ***/
  // init Panorama plugin end
  
  // change item color using select start
  colorSelect.addEventListener('change', function () {
    panorama.updateParameters({
      color: this.value
    });
  })
  // change item color using select end
  
  // change item color using buttons start
  const colorBtns = document.querySelectorAll('.color-btn');
  for (var i = 0, len = colorBtns.length; i < len; i++) {
    colorBtns[i].addEventListener('click', function () {
      panorama.updateParameters({
        color: this.getAttribute('data-color')
      });
    })
  }
  // change item color using buttons end
};