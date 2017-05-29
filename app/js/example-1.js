window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    panoramaView: '[data-panorama-view]',
    btnLeft: '[data-panorama-left]',
    btnRight: '[data-panorama-right]',
    numberOfFrames: 13,
    startFrame: 10,
    sourceMask: 'images/frame-${index}-${color}.png',
    preload: false,
    parameters: {
      color: colorSelect.value // set color according to current select value
    },
    getSourceCallback: function (ui, frame) {
      let source = ui.sourceMask.replace('${index}', frame.toString());

      for (const key in ui.parameters) {
        if (ui.parameters.hasOwnProperty(key)) {
          source = source.replace('${' + key + '}', this.parameters[key].toString());
        }
      }

      console.log(`source path: ${source}`);
      return source;
    },
    onBeforeChange: function (ui, frame) {
      console.clear();
      console.log(`change frame from ${ui.curFrame}`);
    },
    onAfterChange: function (ui, frame) {
      console.log(`change frame to ${ui.curFrame} `);
    }
  });

  /***
   * Custom options:
   * 0) preload: boolean - true(load all images on init) false (load new only when switch frame)
   * 1) startFrame: number - from what frame should panorama start
   * 2) getSourceCallback: function (ui: panorama - all plugin options, frame: number - next frame index): string {
   *      return source; // path to frame image
   *    }
   * 3) onBeforeChange: function (ui: panorama - all plugin options, frame: number - next frame index) - before frame changed
   * 4) onAfterChange: function (ui: panorama - all plugin options, frame: number - next frame index) - after frame changed
   * 5) destroy() - remove all event Listeners and cached images
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

