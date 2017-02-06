const body = document.querySelector('body');

interface IElems {
  panorama: Element;
  panoramaView: Element;
  btnPrev?: Element;
  btnNext?: Element;
  image?: Element;
}

class Panorama {
  public elems: IElems;
  public frames: number;
  public curFrame: number;

  constructor(opt: {
    panorama: string,
    panoramaView: string,
    btnPrev: string,
    btnNext: string
  }) {
    this.elems = {
      panorama:     body.querySelector(opt.panorama),
      panoramaView: body.querySelector(opt.panoramaView),
      btnPrev:      body.querySelector(opt.btnPrev),
      btnNext:      body.querySelector(opt.btnNext)
    };

    if (!this.elems.panorama || !this.elems.panoramaView) {
      return;
    }

    this.frames = parseInt(this.elems.panorama.getAttribute('data-panorama-frames'), 10);
    this.curFrame = 0;

    this.addElements(this.elems);
    this.addEventListeners(this.elems);
  }

  public addElements(elems: IElems) {
    // add image
    elems.image = document.createElement('img');
    elems.image.setAttribute('src', elems.panorama.getAttribute('data-panorama'));
    elems.panoramaView.appendChild(elems.image);
  }

  public addEventListeners(elems: IElems) {
    const that = this;

    if (elems.btnPrev) {
      let intervalPrev: any;

      elems.btnPrev.addEventListener('click', function (e) {
        e.preventDefault();

        that.prevFrame();
      });

      elems.btnPrev.addEventListener('mousedown', function (e) {
        e.preventDefault();

        intervalPrev = setInterval(function () {
          that.prevFrame();
        }, 50);
      });

      elems.btnPrev.addEventListener('mouseup', function () {
        clearInterval(intervalPrev);
      });
    }

    if (elems.btnNext) {
      let intervalNext: any;

      elems.btnNext.addEventListener('click', function (e) {
        e.preventDefault();

        that.nextFrame();
      });

      elems.btnNext.addEventListener('mousedown', function (e) {
        e.preventDefault();

        intervalNext = setInterval(function () {
          that.nextFrame();
        }, 50);
      });

      elems.btnNext.addEventListener('mouseup', function () {
        clearInterval(intervalNext);
      });
    }
  }

  // methods
  public prevFrame() {
    let frame = this.curFrame - 1;

    if (frame <= 0) {
      frame = this.frames - 1;
    }

    this.elems.image.setAttribute('src', `images/img-${frame}.png`);
    this.curFrame = frame;
  }

  public nextFrame() {
    let frame = this.curFrame + 1;

    if (frame >= this.frames) {
      frame = 0;
    }

    this.elems.image.setAttribute('src', `images/img-${frame}.png`);
    this.curFrame = frame;
  }

  public goToFrame(frame: number) {
    if (frame < this.frames && frame >= 0) {
      this.elems.image.setAttribute('src', `images/img-${frame}.png`);
      this.curFrame = frame;
    }
  }
}

////////////////////////////
window.onload = function () {
  const panorama = new Panorama({
    panorama:     '[data-panorama]',
    panoramaView: '[data-panorama-view]',
    btnPrev:      '[data-panorama-prev]',
    btnNext:      '[data-panorama-next]'
  });
  console.log(panorama, body);
  // window.pan = panorama;
};
