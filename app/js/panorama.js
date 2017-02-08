const isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) ||
    ('ontouchstart' in window) || !!window.DocumentTouch && document instanceof DocumentTouch;
let events = {
    press: (isTouchDevice) ? 'touchstart' : 'click',
    move: (isTouchDevice) ? 'touchmove' : 'mousemove'
};
const body = document.querySelector('body');
let preloadedImages = [];
class Panorama {
    constructor(opt) {
        this.elems = {
            panorama: body.querySelector(opt.panorama),
            panoramaView: body.querySelector(opt.panoramaView),
            btnLeft: body.querySelector(opt.btnLeft),
            btnRight: body.querySelector(opt.btnRight)
        };
        this.numberOfFrames = opt.numberOfFrames;
        if (!this.elems.panorama || !this.elems.panoramaView || !this.numberOfFrames) {
            console.error('Panorama plugin: Enter all required parameters!');
            return;
        }
        this.move = false;
        this.sourceMask = this.elems.panorama.getAttribute('data-panorama');
        this.curFrame = 1;
        if (opt.startFrame <= this.numberOfFrames && opt.startFrame >= 1) {
            this.curFrame = opt.startFrame;
        }
        this.parameters = opt.parameters;
        this.preload = opt.preload;
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
    goToFrame(frame) {
        if (frame <= this.numberOfFrames && frame >= 1) {
            this.elems.image.setAttribute('src', this.getSource(frame));
            this.curFrame = frame;
            if (!this.preload) {
                this.cacheImg(frame);
            }
        }
    }
    updateParameters(parameters) {
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
    getSource(frame) {
        let source = this.sourceMask.replace('(number)', frame.toString());
        for (const key in this.parameters) {
            if (this.parameters.hasOwnProperty(key)) {
                source = source.replace(`(${key})`, this.parameters[key].toString());
            }
        }
        return source;
    }
    addElements(elems) {
        // add image
        elems.image = document.createElement('img');
        elems.image.setAttribute('src', this.getSource(this.curFrame));
        elems.panoramaView.appendChild(elems.image);
        if (this.preload) {
            this.preloadImages();
        }
    }
    addEventListeners(elems) {
        const that = this;
        if (elems.panoramaView) {
            let oldLeftPos = 0;
            if (!isTouchDevice) {
                elems.panoramaView.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    that.move = true;
                    oldLeftPos = e.clientX;
                });
                elems.panoramaView.addEventListener('mouseup', function (e) {
                    e.preventDefault();
                    that.move = false;
                });
                elems.panoramaView.addEventListener('mouseleave', function (e) {
                    e.preventDefault();
                    that.move = false;
                });
            }
            elems.panoramaView.addEventListener(events.move, function (e) {
                e.preventDefault();
                let curLeft = 0;
                if (e instanceof MouseEvent) {
                    if (!that.move) {
                        return;
                    }
                    curLeft = e.clientX;
                }
                else if (e instanceof TouchEvent) {
                    curLeft = e.targetTouches[0].clientX;
                }
                if (oldLeftPos < curLeft) {
                    that.prevFrame();
                }
                else {
                    that.nextFrame();
                }
                oldLeftPos = curLeft;
            });
        }
        if (elems.btnLeft) {
            elems.btnLeft.addEventListener(events.press, function (e) {
                e.preventDefault();
                that.nextFrame();
            });
            if (!isTouchDevice) {
                let intervalPrev;
                // elems.btnLeft.addEventListener('mousedown', function (e: MouseEvent) {
                //   e.preventDefault();
                //
                //   intervalPrev = setInterval(() => that.nextFrame(), 50);
                // });
                elems.btnLeft.addEventListener('mouseup', () => clearInterval(intervalPrev));
                elems.btnLeft.addEventListener('mouseleave', () => clearInterval(intervalPrev));
            }
        }
        if (elems.btnRight) {
            elems.btnRight.addEventListener(events.press, function (e) {
                e.preventDefault();
                that.prevFrame();
            });
            if (!isTouchDevice) {
                let intervalNext;
                // elems.btnRight.addEventListener('mousedown', function (e: MouseEvent) {
                //   e.preventDefault();
                //
                //   intervalNext = setInterval(() => that.prevFrame(), 50);
                // });
                elems.btnRight.addEventListener('mouseup', () => clearInterval(intervalNext));
                elems.btnRight.addEventListener('mouseleave', () => clearInterval(intervalNext));
            }
        }
    }
    preloadImages(frame = 1) {
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
    cacheImg(frame) {
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

//# sourceMappingURL=panorama.js.map
