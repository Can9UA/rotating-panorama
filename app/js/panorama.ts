const body: HTMLBodyElement = document.querySelector('body');
const preloadedImages: Element[] = [];

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
  public sourceMask: string;
  public curFrame: number;
  public move: boolean;
  public parameters: any;

  constructor(opt: {
    panorama: string,
    panoramaView: string,
    btnPrev: string,
    btnNext: string,
    preloadImages?: boolean,
    startFrame?: number,
    parameters?: any // TODO: change to normal object
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

    this.move = false;
    this.frames = parseInt(this.elems.panorama.getAttribute('data-panorama-frames'), 10);
    this.sourceMask = this.elems.panorama.getAttribute('data-panorama');

    this.curFrame = 0;
    if (opt.startFrame <= this.frames && opt.startFrame >= 0) {
      this.curFrame = opt.startFrame;
    }

    this.parameters = opt.parameters;

    this.addElements(this.elems, opt.preloadImages);
    this.addEventListeners(this.elems);
  }

  // methods
  public prevFrame() {
    let frame = this.curFrame - 1;

    if (frame <= 0) {
      frame = this.frames - 1;
    }

    this.goToFrame(frame);
  }

  public nextFrame() {
    let frame = this.curFrame + 1;

    if (frame >= this.frames) {
      frame = 0;
    }

    this.goToFrame(frame);
  }

  public goToFrame(frame: number) {
    if (frame <= this.frames && frame >= 0) {
      this.elems.image.setAttribute('src', this.getSource(frame));
      this.curFrame = frame;
    }
  }

  public updateParameters(parameters: any) { // TODO: change to normal object
    for (const key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        this.parameters[key] = parameters[key].toString();
      }
    }
    
    this.goToFrame(this.curFrame);
  }

  private addElements(elems: IElems, preloadImages: boolean = false) {
    const that = this;

    // add image
    elems.image = document.createElement('img');
    elems.image.setAttribute('src', this.getSource(this.curFrame));
    elems.panoramaView.appendChild(elems.image);

    if (preloadImages) {
      function preload(frame: number) {
        if (frame < that.frames) {
          const img = new Image();
          img.onload = function () {
            preload(frame + 1);
          };
          img.src = that.getSource(frame);
          preloadedImages.push(img);
        }
      }

      preload(0);
    }
  }

  private addEventListeners(elems: IElems) {
    const that = this;

    if (elems.panoramaView) {
      let oldLeftPos: number = 0;

      elems.panoramaView.addEventListener('mousedown', function (e: MouseEvent) {
        e.preventDefault();

        that.move = true;
        oldLeftPos = e.clientX;
      });
      elems.panoramaView.addEventListener('mouseup', function (e: MouseEvent) {
        e.preventDefault();

        that.move = false;
      });
      elems.panoramaView.addEventListener('mouseleave', function (e: MouseEvent) {
        e.preventDefault();

        that.move = false;
      });

      elems.panoramaView.addEventListener('mousemove', function (e: MouseEvent) {
        e.preventDefault();

        if (!that.move) {
          return;
        }

        if (oldLeftPos < e.clientX) {
          that.prevFrame();
        } else {
          that.nextFrame();
        }
        oldLeftPos = e.clientX;
      });
    }

    if (elems.btnPrev) {
      let intervalPrev: any;

      elems.btnPrev.addEventListener('click', function (e: MouseEvent) {
        e.preventDefault();

        that.prevFrame();
      });
      elems.btnPrev.addEventListener('mousedown', function (e: MouseEvent) {
        e.preventDefault();

        intervalPrev = setInterval(function () {
          that.prevFrame();
        }, 50);
      });

      elems.btnPrev.addEventListener('mouseup', function () {
        clearInterval(intervalPrev);
      });
      elems.btnPrev.addEventListener('mouseleave', function () {
        clearInterval(intervalPrev);
      });
    }

    if (elems.btnNext) {
      let intervalNext: any;

      elems.btnNext.addEventListener('click', function (e: MouseEvent) {
        e.preventDefault();

        that.nextFrame();
      });
      elems.btnNext.addEventListener('mousedown', function (e: MouseEvent) {
        e.preventDefault();

        intervalNext = setInterval(function () {
          that.nextFrame();
        }, 50);
      });

      elems.btnNext.addEventListener('mouseup', function () {
        clearInterval(intervalNext);
      });
      elems.btnNext.addEventListener('mouseleave', function () {
        clearInterval(intervalNext);
      });
    }
  }

  private getSource(frame: number): string {
    let source: string = this.sourceMask.replace('(number)', frame.toString());

    for (const key in this.parameters) {
      if (this.parameters.hasOwnProperty(key)) {
        source = source.replace(`(${key})`, this.parameters[key].toString());
      }
    }

    return source;
  }
}
