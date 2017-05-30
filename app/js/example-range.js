window.onload = function () {
  const colorSelect = document.querySelector('#color-select');

  const slider = document.querySelector('[data-range]');
  let sliderActive = false;

  // init Panorama plugin start
  const panorama = new Panorama({
    panorama: '[data-panorama]',
    numberOfFrames: 13,
    preload: true,
    parameters: {
      color: colorSelect.value // set color according to current select value
    },
    onAfterChange: function (ui, frame) {
      if (!sliderActive) {
        slider.noUiSlider.set(frame);
      }
    }
  });

  // init Panorama plugin end

  // change on range changes start
  noUiSlider.create(slider, {
    start: [1],
    step: 1,
    range: {
      'min': [1],
      'max': [13] // numberOfFrames
    }
  });

  slider.noUiSlider.on('slide', function () {
    sliderActive = true;
    panorama.goToFrame(parseInt(this.get(), 10));
  });

  slider.noUiSlider.on('end', function () {
    sliderActive = false;
  });
  // change on range changes end




  // change item color using select start
  colorSelect.addEventListener('change', function () {
    panorama.parameters.update({
      color: this.value
    });
  })
  // change item color using select end

  // change item color using buttons start
  const colorBtns = document.querySelectorAll('.color-btn');
  for (var i = 0, len = colorBtns.length; i < len; i++) {
    colorBtns[i].addEventListener('click', function () {
      panorama.parameters.update({
        color: this.getAttribute('data-color')
      });
    })
  }
  // change item color using buttons end
};

