window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    panoramaView: '[data-panorama-view]',
    btnLeft: '[data-panorama-left]',
    btnRight: '[data-panorama-right]',
    numberOfFrames: 13,
    preload: true,
    autoplay: {
      enabled: true,
      direction: 'next',
      speed: 200
    },
    parameters: {
      color: colorSelect.value
    }
  });
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

  // stop/start autoplay start
  const autoplayBtn = document.querySelector('[data-panorama-autoplay]');
  autoplayBtn.addEventListener('click', function () {
    panorama.autoplay.update({
      enabled: !panorama.autoplay.enabled
    });
  })
  // stop/start autoplay end
};

