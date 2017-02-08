const isTouchDevice: boolean = /MSIE 10.*Touch/.test(navigator.userAgent) ||
  ('ontouchstart' in window) || !!window.DocumentTouch && document instanceof DocumentTouch;

let events = {
  press: (isTouchDevice) ? 'touchstart' : 'click'     as string,
  move:  (isTouchDevice) ? 'touchmove' : 'mousemove' as string
};

const body: HTMLBodyElement = document.querySelector('body');
let preloadedImages: Element[] = [];

interface IElems {
  panorama: Element;
  panoramaView: Element;
  btnLeft?: Element;
  btnRight?: Element;
  image?: Element;
}

interface IParameters {
  [propName: string]: string;
}

class Panorama {
  public elems: IElems;
  public numberOfFrames: number;
  public sourceMask: string;
  public curFrame: number;
  public move: boolean;
  public parameters: IParameters;
  public getSourceCallback?: Function;

  private preload: boolean;

  constructor(opt: {
    panorama: string,
    panoramaView: string,
    btnLeft: string,
    btnRight: string,
    numberOfFrames: number,
    startFrame?: number,
    preload?: boolean,
    parameters?: IParameters,
    getSourceCallback?: Function
  }) {
    this.elems = {
      panorama:     body.querySelector(opt.panorama),
      panoramaView: body.querySelector(opt.panoramaView),
      btnLeft:      body.querySelector(opt.btnLeft),
      btnRight:     body.querySelector(opt.btnRight)
    };

    this.numberOfFrames = opt.numberOfFrames;
    this.sourceMask = this.elems.panorama.getAttribute('data-panorama');

    if (!this.elems.panorama || !this.elems.panoramaView || !this.numberOfFrames || !this.sourceMask) {
      console.error('Panorama plugin: Enter all required parameters!');
      return;
    }

    this.move = false;

    this.curFrame = 1;
    if (opt.startFrame <= this.numberOfFrames && opt.startFrame >= 1) {
      this.curFrame = opt.startFrame;
    }

    this.parameters = opt.parameters;
    this.preload = opt.preload;

    this.getSourceCallback = opt.getSourceCallback;

    this.addElements(this.elems);
    this.addEventListeners(this.elems);
  }

  public prevFrame() {
    let frame = this.curFrame - 1;

    if (frame < 1) {
      frame = this.numberOfFrames;
    }

    this.goToFrame(frame);
  }

  public nextFrame() {
    let frame = this.curFrame + 1;

    if (frame > this.numberOfFrames) {
      frame = 1;
    }

    this.goToFrame(frame);
  }

  public goToFrame(frame: number) {
    if (frame <= this.numberOfFrames && frame >= 1) {
      this.elems.image.setAttribute('src', this.getSource(frame));
      this.curFrame = frame;

      if (!this.preload) {
        this.cacheImg(frame);
      }
    }
  }

  public updateParameters(parameters: IParameters) {
    for (const key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        this.parameters[key] = parameters[key].toString();
      }
    }
    preloadedImages = []; // remove old cached values
    this.goToFrame(this.curFrame);

    if (this.preload) {
      this.preloadImages();
    }
  }

  public getSource(frame: number): string {
    if (typeof this.getSourceCallback === 'function') {
      return this.getSourceCallback(this, frame);
    }

    let source: string = this.sourceMask.replace('(number)', frame.toString());

    for (const key in this.parameters) {
      if (this.parameters.hasOwnProperty(key)) {
        source = source.replace(`(${key})`, this.parameters[key].toString());
      }
    }

    return source;
  }

  private addElements(elems: IElems) {
    // add image
    elems.image = document.createElement('img');
    elems.image.setAttribute('src', this.getSource(this.curFrame));
    elems.panoramaView.appendChild(elems.image);

    if (this.preload) {
      this.preloadImages();
    }
  }

  private addEventListeners(elems: IElems) {
    const that = this;

    if (elems.panoramaView) {
      let oldLeftPos: number = 0;

      if (!isTouchDevice) {
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
      }

      elems.panoramaView.addEventListener(events.move, function (e: MouseEvent | TouchEvent) {
        e.preventDefault();
        let curLeft: number = 0;

        if (e instanceof MouseEvent) {
          if (!that.move) {
            return;
          }
          curLeft = e.clientX;
        } else if (e instanceof TouchEvent) {
          curLeft = e.targetTouches[0].clientX;
        }

        const diff: number = Math.abs(oldLeftPos - curLeft);

        if (diff > 5) {
          (oldLeftPos < curLeft) ? that.prevFrame() : that.nextFrame();

          oldLeftPos = curLeft;
        }
      });
    }

    if (elems.btnLeft) {
      elems.btnLeft.addEventListener(events.press, function (e: MouseEvent | TouchEvent) {
        e.preventDefault();

        that.nextFrame();
      });

      if (!isTouchDevice) {
        let intervalPrev: any;

        elems.btnLeft.addEventListener('mousedown', function (e: MouseEvent) {
          e.preventDefault();

          intervalPrev = setInterval(() => that.nextFrame(), 130);
        });

        elems.btnLeft.addEventListener('mouseup', () => clearInterval(intervalPrev));
        elems.btnLeft.addEventListener('mouseleave', () => clearInterval(intervalPrev));
      }
    }

    if (elems.btnRight) {
      elems.btnRight.addEventListener(events.press, function (e: MouseEvent | TouchEvent) {
        e.preventDefault();

        that.prevFrame();
      });

      if (!isTouchDevice) {
        let intervalNext: any;

        elems.btnRight.addEventListener('mousedown', function (e: MouseEvent) {
          e.preventDefault();

          intervalNext = setInterval(() => that.prevFrame(), 130);
        });

        elems.btnRight.addEventListener('mouseup', () => clearInterval(intervalNext));
        elems.btnRight.addEventListener('mouseleave', () => clearInterval(intervalNext));
      }
    }
  }

  private preloadImages(frame: number = 1) {
    const that = this;

    if (frame === 1) {
      preloadedImages = [];
    }

    if (frame < this.numberOfFrames) {
      const image = this.cacheImg(frame);

      image.addEventListener('load', function () {
        that.preloadImages(frame + 1);
      });
    }
  }

  private cacheImg(frame: number): Element {
    const img = document.createElement('img');
    img.setAttribute('src', this.getSource(frame));

    function filter(element) {
      return element.getAttribute('src') === img.getAttribute('src');
    }

    if (preloadedImages.findIndex(filter) === -1) {
      preloadedImages.push(img);
    }

    return img;
  }
}