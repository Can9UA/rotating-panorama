window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    btnPrev: '[data-panorama-left]',
    btnNext: '[data-panorama-right]',
    numberOfFrames: 13,
    startFrame: 10,
    sourceMask: 'images/baby_carriage/frame-${index}-${color}.png',
    preload: false,
    frameParams: {
      color: colorSelect.value // set color according to current select value
    },
    getSourceCallback: function (ui, frame) {
      let source = ui.sourceMask.replace('${index}', frame.toString());

      for (const key in ui.frameParams) {
        if (ui.frameParams.hasOwnProperty(key)) {
          source = source.replace('${' + key + '}', this.frameParams[key].toString());
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

