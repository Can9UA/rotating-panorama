'use strict';
// polyfills for findIndex in ES5
if (!Array.prototype.findIndex as any) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    const list = Object(this);
    const length = list.length >>> 0;
    const thisArg = arguments[1];
    let value;

    for (let i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) { return i; }
    }
    return -1;
  };
}

const isTouchDevice: boolean = /MSIE 10.*Touch/.test(navigator.userAgent) ||
  ('ontouchstart' in window) || (window as IWindow).DocumentTouch && document instanceof DocumentTouch;

const events = {
  press: (isTouchDevice) ? 'touchstart' : 'click' as string,
  move: (isTouchDevice) ? 'touchmove' : 'mousemove' as string
};

const body: HTMLBodyElement = document.querySelector('body');
let preloadedImages: Element[] = [];

interface IElems {
  panorama: Element;
  btnNext?: Element;
  btnPrev?: Element;
  image?: Element;
}

interface IframeParams {
  update: any;
  [propName: string]: string;
}

interface IAutoplay {
  enable?: boolean;
  speed?: number;
  interval?: any;
  timeout?: any;
  direction?: 'next' | 'prev';
  stopOnHover?: boolean;
  startRotation?: Function;
  stopRotation?: Function;
  update?: Function;
  startRotationAfter?: Function;
}

interface IOptions {
  panorama: string | HTMLElement;
  btnNext: string | HTMLElement;
  btnPrev: string | HTMLElement;
  numberOfFrames: number;
  startFrame?: number;
  preload?: boolean;
  scrollOnMove?: boolean;
  sourceMask?: string;
  autoplay?: IAutoplay;
  frameParams?: IframeParams;
  getSourceCallback?: Function;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  onLoad?: Function;
}

class Panorama {
  elems: IElems;
  numberOfFrames: number;
  sourceMask: string;
  curFrame: number;
  move: boolean;
  scrollOnMove: boolean;
  frameParams: IframeParams;
  autoplay: IAutoplay;
  interval?: any;
  loadedImages?: number;
  onLoad?: Function;

  getSourceCallback?: Function;
  onBeforeChange?: Function;
  onAfterChange?: Function;

  private preload: boolean;
  private eventsListeners: Function[] = [];

  constructor(opt: IOptions) {
    const panorama = this;

    this.elems = this.getElems(opt);

    this.numberOfFrames = opt.numberOfFrames;
    this.sourceMask = opt.sourceMask || this.elems.panorama.getAttribute('data-panorama');

    if (!this.elems.panorama || !this.numberOfFrames || !this.sourceMask) {
      console.error('Panorama plugin: Enter all required frameParams!');
      return;
    }

    this.move = false;

    this.scrollOnMove = (typeof opt.scrollOnMove === 'undefined') ? true : opt.scrollOnMove;

    this.curFrame = 1;
    if (opt.startFrame <= this.numberOfFrames && opt.startFrame >= 1) {
      this.curFrame = opt.startFrame;
    }

    this.preload = opt.preload;
    this.onLoad = opt.onLoad;
    this.frameParams = opt.frameParams;
    this.frameParams.update = function (frameParams: IframeParams) {
      for (const key in frameParams) {
        if (frameParams.hasOwnProperty(key)) {
          panorama.frameParams[key] = frameParams[key].toString();
        }
      }
      preloadedImages = []; // remove old cached values
      panorama.goToFrame(panorama.curFrame);

      if (panorama.preload) {
        panorama.preloadImages();
      }
    };

    this.getSourceCallback = opt.getSourceCallback;
    this.onBeforeChange = opt.onBeforeChange;
    this.onAfterChange = opt.onAfterChange;

    // autoplay
    this.autoplay = this.initAutoplay(opt.autoplay);

    this.addElements(this.elems);
    this.addEventListeners(this.elems);
  }

  prevFrame() {
    let frame = this.curFrame - 1;

    if (frame < 1) {
      frame = this.numberOfFrames;
    }

    this.goToFrame(frame);
  }

  nextFrame() {
    let frame = this.curFrame + 1;

    if (frame > this.numberOfFrames) {
      frame = 1;
    }

    this.goToFrame(frame);
  }

  goToFrame(frame: number) {
    if (typeof this.onBeforeChange === 'function') {
      this.onBeforeChange(this, frame);
    }

    if (frame <= this.numberOfFrames && frame >= 1) {
      this.elems.image.setAttribute('src', this.getSource(frame));
      this.curFrame = frame;

      if (!this.preload) {
        this.cacheImg(frame);
      }
    }

    if (typeof this.onAfterChange === 'function') {
      this.onAfterChange(this, frame);
    }
  }

  getSource(frame: number = 0): string {
    if (typeof this.getSourceCallback === 'function') {
      return this.getSourceCallback(this, frame);
    }

    let source: string = this.sourceMask.replace('${index}', frame.toString());

    for (const key in this.frameParams) {
      if (this.frameParams.hasOwnProperty(key)) {
        source = source.replace('${' + key + '}', this.frameParams[key].toString());
      }
    }

    return source;
  }

  destroy() {
    const elems = this.elems;
    elems.image = null;
    preloadedImages = [];

    if (elems.panorama) {
      if (!isTouchDevice) {
        elems.panorama.removeEventListener('mousedown', this.eventsListeners['panorama mousedown']);
        elems.panorama.removeEventListener('mouseup', this.eventsListeners['panorama mouseup']);
        elems.panorama.removeEventListener('mouseleave', this.eventsListeners['panorama mouseup']);
      }

      elems.panorama.removeEventListener(events.move, this.eventsListeners['panorama move']);
    }

    if (elems.btnNext) {
      elems.btnNext.removeEventListener(events.press, this.eventsListeners['btnNext press']);

      if (!isTouchDevice) {
        elems.btnNext.removeEventListener('mousedown', this.eventsListeners['btnNext mousedown']);

        elems.btnNext.removeEventListener('mouseup', this.eventsListeners['btnNext mouseup']);
        elems.btnNext.removeEventListener('mouseleave', this.eventsListeners['btnNext mouseup']);
      }
    }

    if (elems.btnPrev) {
      elems.btnPrev.removeEventListener(events.press, this.eventsListeners['btnPrev press']);

      if (!isTouchDevice) {
        elems.btnPrev.removeEventListener('mousedown', this.eventsListeners['btnPrev mousedown']);

        elems.btnPrev.removeEventListener('mouseup', this.eventsListeners['btnPrev mouseup']);
        elems.btnPrev.removeEventListener('mouseleave', this.eventsListeners['btnPrev mouseup']);
      }
    }

    if (this.autoplay && this.autoplay.enable) {
      this.autoplay.stopRotation();
    }

    clearInterval(this.interval);
    clearInterval(this.autoplay.interval);
    clearTimeout(this.autoplay.timeout);
  }

  private getElems(opt: IOptions): IElems {
    const elems: IElems = {
      panorama: null,
      btnNext: null,
      btnPrev: null,
      image: null
    };

    for (const elemName in elems) {
      if (!opt[elemName]) {
        continue;
      }

      if (typeof opt[elemName] === 'string') {
        elems[elemName] = body.querySelector(opt[elemName]);
      } else {
        elems[elemName] = opt[elemName];
      }
    }

    return elems;
  }

  private addElements(elems: IElems) {
    // add image
    elems.image = document.createElement('img');
    elems.image.setAttribute('src', this.getSource(this.curFrame));
    elems.panorama.appendChild(elems.image);

    if (this.preload) {
      this.loadedImages = 0;
      this.preloadImages();
    }
  }

  private addEventListeners(elems: IElems) {
    const panorama = this;

    if (elems.panorama) {
      let oldLeftPos: number = 0;

      if (!isTouchDevice) {
        this.eventsListeners['panorama mousedown'] = function (e: MouseEvent) {
          e.preventDefault();

          panorama.move = true;

          oldLeftPos = e.clientX;
          panorama.autoplay.startRotationAfter(1500);
        };
        elems.panorama.addEventListener('mousedown', this.eventsListeners['panorama mousedown']);

        this.eventsListeners['panorama mouseup'] = function (e: MouseEvent) {
          e.preventDefault();

          panorama.move = false;

          if (e.type !== 'mouseleave') {
            panorama.autoplay.startRotationAfter(1000);
          }
        };
        elems.panorama.addEventListener('mouseup', this.eventsListeners['panorama mouseup']);
        elems.panorama.addEventListener('mouseleave', this.eventsListeners['panorama mouseup']);
      } else {
        elems.panorama.addEventListener('touchstart', (e) => {
          e.preventDefault();

          panorama.autoplay.stopRotation();
        });

        elems.panorama.addEventListener('touchend', (e) => {
          e.preventDefault();

          panorama.autoplay.startRotationAfter(1500);
        });
      }

      this.eventsListeners['panorama move'] = function (e: MouseEvent | TouchEvent) {
        e.preventDefault();

        if (panorama.autoplay.stopOnHover) {
          panorama.autoplay.stopRotation();
        }

        let curLeft: number = 0;

        if (e instanceof MouseEvent) {
          if (!panorama.move) {
            return;
          }
          curLeft = e.clientX;
        } else if (e instanceof TouchEvent) {
          curLeft = e.targetTouches[0].clientX;
        }

        const diff: number = Math.abs(oldLeftPos - curLeft);

        if (diff > 5) {
          (oldLeftPos < curLeft) ? panorama.prevFrame() : panorama.nextFrame();

          oldLeftPos = curLeft;
        }
      };

      if (panorama.scrollOnMove) {
        elems.panorama.addEventListener(events.move, this.eventsListeners['panorama move']);
      }
    }

    if (elems.btnNext) {
      this.eventsListeners['btnNext press'] = function (e: MouseEvent | TouchEvent) {
        e.preventDefault();

        panorama.nextFrame();

        panorama.autoplay.startRotationAfter(1500);
      };
      elems.btnNext.addEventListener(events.press, this.eventsListeners['btnNext press']);

      if (!isTouchDevice) {
        this.eventsListeners['btnNext mousedown'] = function (e: MouseEvent) {
          e.preventDefault();

          panorama.autoplay.stopRotation();

          panorama.move = true;
          panorama.interval = setInterval(() => {
            panorama.nextFrame();
          }, 130);
        };
        elems.btnNext.addEventListener('mousedown', this.eventsListeners['btnNext mousedown']);

        this.eventsListeners['btnNext mouseup'] = () => {
          panorama.move = false;
          clearInterval(panorama.interval);
        };
        elems.btnNext.addEventListener('mouseup', this.eventsListeners['btnNext mouseup']);
        elems.btnNext.addEventListener('mouseleave', this.eventsListeners['btnNext mouseup']);
      }
    }

    if (elems.btnPrev) {
      this.eventsListeners['btnPrev press'] = function (e: MouseEvent | TouchEvent) {
        e.preventDefault();

        panorama.autoplay.startRotationAfter(1500);

        panorama.prevFrame();
      };
      elems.btnPrev.addEventListener(events.press, this.eventsListeners['btnPrev press']);

      if (!isTouchDevice) {
        this.eventsListeners['btnPrev mousedown'] = function (e: MouseEvent) {
          e.preventDefault();

          panorama.autoplay.stopRotation();

          panorama.move = true;
          panorama.interval = setInterval(() => {
            panorama.prevFrame();
          }, 130);
        };
        elems.btnPrev.addEventListener('mousedown', this.eventsListeners['btnPrev mousedown']);

        this.eventsListeners['btnPrev mouseup'] = () => {
          panorama.move = false;
          clearInterval(panorama.interval);
        };
        elems.btnPrev.addEventListener('mouseup', this.eventsListeners['btnPrev mouseup']);
        elems.btnPrev.addEventListener('mouseleave', this.eventsListeners['btnPrev mouseup']);
      }
    }
  }

  private preloadImages(frame: number = 1) {
    const panorama = this;

    if (frame === 1) {
      preloadedImages = [];
    }

    if (frame <= this.numberOfFrames) {
      const image = this.cacheImg(frame);

      image.addEventListener('load', function () {
        panorama.loadedImages++;
        panorama.preloadImages(frame + 1);

        if (panorama.loadedImages === panorama.numberOfFrames) {
          if (panorama.autoplay.enable) {
            panorama.autoplay.startRotation();
          }

          if (typeof panorama.onLoad === 'function') {
            panorama.onLoad(panorama);
          }
        }
      });
    }
  }

  private cacheImg(frame: number): Element {
    const img = document.createElement('img');
    img.setAttribute('src', this.getSource(frame));

    if (preloadedImages.findIndex(this.imagesFilter) === -1) {
      preloadedImages.push(img);
    }

    return img;
  }

  private imagesFilter(element) {
    return element.getAttribute('src') === img.getAttribute('src');
  }

  private initAutoplay(options: IAutoplay) {
    if (!options) {
      return {
        enable: false,
        startRotation() { return; },
        stopRotation() { return; },
        startRotationAfter() { return; },
      };
    }

    const panorama = this;
    const Autoplay: IAutoplay = {
      enable: options.enable,
      speed: options.speed || 200,
      direction: options.direction || 'next',
      stopOnHover: options.stopOnHover,

      startRotation() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
          (this.direction === 'prev') ? panorama.prevFrame() : panorama.nextFrame();
        }, this.speed);

        this.enable = true;
      },

      stopRotation() {
        clearInterval(this.interval);

        this.enable = false;
      },

      update(params: IAutoplay) {
        if (!params) {
          return;
        }

        if (params.direction) {
          this.direction = params.direction;

          if (this.enable) {
            this.startRotation();
          }
        }
      },

      startRotationAfter(time) {
        clearInterval(panorama.interval);
        clearTimeout(this.timeout);
        this.stopRotation();
        if (!panorama.move) {
          this.timeout = setTimeout(() => this.startRotation(), time);
        }
      }
    };

    return Autoplay;
  }
}
