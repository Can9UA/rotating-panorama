window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    btnPrev: '[data-panorama-left]',
    btnNext: '[data-panorama-right]',
    numberOfFrames: 26,
    preload: true,
    mode: {
      type: 'sprite',
      reverse: true
    },
    frameParams: {
      color: colorSelect.value // set color according to current select value
    },
    onLoad: function (ui) {
      ui.elems.panorama.classList.add('loaded');
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

