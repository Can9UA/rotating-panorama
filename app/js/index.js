window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    btnPrev: '[data-panorama-left]',
    btnNext: '[data-panorama-right]',
    numberOfFrames: 24,
    preload: true,
    frameParams: {
      color: colorSelect.value // set color according to current select value
    },
    onLoad: function (ui) {
      ui.elems.panorama.classList.add('loaded');
    }
  });

  /***
   * Custom options:
   * 1) startFrame: number - from what frame should panorama start
   * 2) getSourceCallback: function (ui: panorama - all plugin options, frame: number - next frame index): string {
   *      return source; // path to frame image
   *    }
   * 3) onBeforeChange: function (ui: panorama - all plugin options, frame: number - next frame index) - before frame changed
   * 4) onAfterChange: function (ui: panorama - all plugin options, frame: number - next frame index) - after frame changed
   * 5) destroy() - remove all event Listeners and cached images
   * 6) onLoad() - after all images loaded
   ***/
  // init Panorama plugin end

  // change item color using select start
  colorSelect.addEventListener('change', function () {
    panorama.frameParams.update({
      color: this.value
    });
  })
  // change item color using select end

  // change item color using buttons start
  const colorBtns = document.querySelectorAll('.color-btn');
  for (var i = 0, len = colorBtns.length; i < len; i++) {
    colorBtns[i].addEventListener('click', function () {
      panorama.frameParams.update({
        color: this.getAttribute('data-color')
      });
    })
  }
  // change item color using buttons end
};

