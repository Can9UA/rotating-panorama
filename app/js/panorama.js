const isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) ||
    ('ontouchstart' in window) || !!window.DocumentTouch && document instanceof DocumentTouch;
let events = {
    press: (isTouchDevice) ? 'touchstart' : 'click',
    move: (isTouchDevice) ? 'touchmove' : 'mousemove'
};
console.log(isTouchDevice);
const body = document.querySelector('body');
let preloadedImages = [];
class Panorama {
    constructor(opt) {
        this.elems = {
            panorama: body.querySelector(opt.panorama),
            panoramaView: body.querySelector(opt.panoramaView),
            btnPrev: body.querySelector(opt.btnPrev),
            btnNext: body.querySelector(opt.btnNext)
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
    prevFrame() {
        let frame = this.curFrame - 1;
        if (frame <= 0) {
            frame = this.frames - 1;
        }
        this.goToFrame(frame);
    }
    nextFrame() {
        let frame = this.curFrame + 1;
        if (frame >= this.frames) {
            frame = 0;
        }
        this.goToFrame(frame);
    }
    goToFrame(frame) {
        if (frame <= this.frames && frame >= 0) {
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
                const curLeft = (e.targetTouches) ? e.targetTouches[0].clientX : e.clientX;
                if (!that.move && !isTouchDevice) {
                    return;
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
        if (elems.btnPrev) {
            let intervalPrev;
            elems.btnPrev.addEventListener(events.press, function (e) {
                e.preventDefault();
                that.prevFrame();
            });
            if (!isTouchDevice) {
                elems.btnPrev.addEventListener('mousedown', function (e) {
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
        }
        if (elems.btnNext) {
            let intervalNext;
            elems.btnNext.addEventListener(events.press, function (e) {
                e.preventDefault();
                that.nextFrame();
            });
            if (!isTouchDevice) {
                elems.btnNext.addEventListener('mousedown', function (e) {
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
    }
    preloadImages(frame = 0) {
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
