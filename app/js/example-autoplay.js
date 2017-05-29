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
      enable: true,
      direction: 'next',
      speed: 110
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

  //////////////////////// Autoplay ////////////////////////
  const autoplayBtn = document.querySelector('[data-panorama-autoplay]');
  autoplayBtn.addEventListener('click', function () {
    if (panorama.autoplay.enable) {
      panorama.autoplay.stopRotation();
    } else {
      panorama.autoplay.startRotation();
    }
  })

  const autoRotateNext = document.querySelector('[data-panorama-autoplay-next]');
  autoRotateNext.addEventListener('click', function () {
    panorama.autoplay.update({
      direction: 'next'
    });
    //panorama.autoplay.reload(); // start rotate even if rotating is stopped now
  });

  const autoRotatePrev = document.querySelector('[data-panorama-autoplay-prev]');
  autoRotatePrev.addEventListener('click', function () {
    panorama.autoplay.update({
      direction: 'prev'
    });
    //panorama.autoplay.reload(); // start rotate even if rotating is stopped now
  })

  window.panorama = panorama;
};

