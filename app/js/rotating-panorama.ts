const body = document.querySelector('body');
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

  constructor(opt: {
    panorama: string,
    panoramaView: string,
    btnPrev: string,
    btnNext: string,
    preloadImages?: boolean,
    startFrame?: number
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
    
    this.addElements(this.elems, opt.preloadImages);
    this.addEventListeners(this.elems);
  }

  public addElements(elems: IElems, preloadImages: boolean = false) {
    const that = this;
    
    // add image
    elems.image = document.createElement('img');
    elems.image.setAttribute('src', this.getSource(this.curFrame));
    elems.panoramaView.appendChild(elems.image);

    if (preloadImages) {
      function preload(frame: number) {
        if (frame < that.frames) {
          const img = new Image();
          img.onload = function() { preload(frame + 1); };
          img.src = that.getSource(frame);
          preloadedImages.push(img);
        }
      }
      
      preload(0);
    }
  }

  public addEventListeners(elems: IElems) {
    const that = this;

    if (elems.panoramaView) {
      elems.panoramaView.addEventListener('mousedown', function (e: MouseEvent) {
        e.preventDefault();
        
        that.move = true;
      });
      elems.panoramaView.addEventListener('mouseup', function (e: MouseEvent) {
        e.preventDefault();
        
        that.move = false;
      });
      elems.panoramaView.addEventListener('mouseleave', function (e: MouseEvent) {
        e.preventDefault();
        
        that.move = false;
      });
      
      let oldPosLeft: number = 0;
      elems.panoramaView.addEventListener('mousemove', function (e: MouseEvent) {
        e.preventDefault();
        
        if (!that.move) { return; }

        if (oldPosLeft < e.clientX) {
          that.prevFrame();
        } else if (oldPosLeft > e.clientX) {
          that.nextFrame();
        }
        oldPosLeft = e.clientX;
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

  // methods
  public prevFrame() {
    let frame = this.curFrame - 1;

    if (frame <= 0) {
      frame = this.frames - 1;
    }

    this.elems.image.setAttribute('src', this.getSource(frame));
    this.curFrame = frame;
  }

  public nextFrame() {
    let frame = this.curFrame + 1;

    if (frame >= this.frames) {
      frame = 0;
    }

    this.elems.image.setAttribute('src', this.getSource(frame));
    this.curFrame = frame;
  }

  public goToFrame(frame: number) {
    if (frame < this.frames && frame >= 0) {
      this.elems.image.setAttribute('src', this.getSource(frame));
      this.curFrame = frame;
    }
  }

  private getSource(frame: number): string {
    return this.sourceMask.replace('\$', frame);
  }
}

////////////////////////////
window.onload = function () {
  const panorama = new Panorama({
    panorama:      '[data-panorama]',
    panoramaView:  '[data-panorama-view]',
    btnPrev:       '[data-panorama-prev]',
    btnNext:       '[data-panorama-next]',
    preloadImages: true,
    // startFrame:    40
  });
  console.log(panorama, body);
  // window.pan = panorama;
};
