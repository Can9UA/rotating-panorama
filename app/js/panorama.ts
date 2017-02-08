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
  public frames: number;
  public sourceMask: string;
  public curFrame: number;
  public move: boolean;
  public parameters: IParameters;

  private preload: boolean;

  constructor(opt: {
    panorama: string,
    panoramaView: string,
    btnLeft: string,
    btnRight: string,
    frames: number,
    startFrame?: number,
    preload?: boolean,
    parameters?: IParameters
  }) {
    this.elems = {
      panorama:     body.querySelector(opt.panorama),
      panoramaView: body.querySelector(opt.panoramaView),
      btnLeft:      body.querySelector(opt.btnLeft),
      btnRight:      body.querySelector(opt.btnRight)
    };

    this.frames = opt.frames;

    if (!this.elems.panorama || !this.elems.panoramaView || !this.frames) {
      console.error('Panorama plugin: Enter all required parameters!');
      return;
    }

    this.move = false;

    this.sourceMask = this.elems.panorama.getAttribute('data-panorama');

    this.curFrame = 0;
    if (opt.startFrame <= this.frames && opt.startFrame >= 0) {
      this.curFrame = opt.startFrame;
    }

    this.parameters = opt.parameters;
    this.preload = opt.preload;

    this.addElements(this.elems);
    this.addEventListeners(this.elems);
  }

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

        if (oldLeftPos < curLeft) {
          that.prevFrame();
        } else {
          that.nextFrame();
        }

        oldLeftPos = curLeft;
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

          intervalPrev = setInterval(() => that.nextFrame(), 50);
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

          intervalNext = setInterval(() => that.prevFrame(), 50);
        });

        elems.btnRight.addEventListener('mouseup', () => clearInterval(intervalNext));
        elems.btnRight.addEventListener('mouseleave', () => clearInterval(intervalNext));
      }
    }
  }

  private preloadImages(frame: number = 0) {
    const that = this;

    if (frame === 0) {
      preloadedImages = [];
    }

    if (frame < this.frames) {
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
