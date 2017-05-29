const isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) ||
    ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
let events = {
    press: (isTouchDevice) ? 'touchstart' : 'click',
    move: (isTouchDevice) ? 'touchmove' : 'mousemove'
};
const body = document.querySelector('body');
let preloadedImages = [];
class Panorama {
    constructor(opt) {
        this.eventsListeners = [];
        this.elems = {
            panorama: body.querySelector(opt.panorama),
            panoramaView: body.querySelector(opt.panoramaView),
            btnLeft: body.querySelector(opt.btnLeft),
            btnRight: body.querySelector(opt.btnRight)
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
        this.onBeforeChange = opt.onBeforeChange;
        this.onAfterChange = opt.onAfterChange;
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
    getSource(frame = 0) {
        if (typeof this.getSourceCallback === 'function') {
            return this.getSourceCallback(this, frame);
        }
        let source = this.sourceMask.replace('${number}', frame.toString());
        for (const key in this.parameters) {
            if (this.parameters.hasOwnProperty(key)) {
                source = source.replace('${' + key + '}', this.parameters[key].toString());
            }
        }
        return source;
    }
    destroy() {
        const elems = this.elems;
        elems.image = null;
        preloadedImages = [];
        if (elems.panoramaView) {
            if (!isTouchDevice) {
                elems.panoramaView.removeEventListener('mousedown', this.eventsListeners['panoramaView mousedown']);
                elems.panoramaView.removeEventListener('mouseup', this.eventsListeners['panoramaView mouseup']);
                elems.panoramaView.removeEventListener('mouseleave', this.eventsListeners['panoramaView mouseup']);
            }
            elems.panoramaView.removeEventListener(events.move, this.eventsListeners['panoramaView move']);
        }
        if (elems.btnLeft) {
            elems.btnLeft.removeEventListener(events.press, this.eventsListeners['btnLeft press']);
            if (!isTouchDevice) {
                elems.btnLeft.removeEventListener('mousedown', this.eventsListeners['btnLeft mousedown']);
                elems.btnLeft.removeEventListener('mouseup', this.eventsListeners['btnLeft mouseup']);
                elems.btnLeft.removeEventListener('mouseleave', this.eventsListeners['btnLeft mouseup']);
            }
        }
        if (elems.btnRight) {
            elems.btnRight.removeEventListener(events.press, this.eventsListeners['btnRight press']);
            if (!isTouchDevice) {
                elems.btnRight.removeEventListener('mousedown', this.eventsListeners['btnRight mousedown']);
                elems.btnRight.removeEventListener('mouseup', this.eventsListeners['btnRight mouseup']);
                elems.btnRight.removeEventListener('mouseleave', this.eventsListeners['btnRight mouseup']);
            }
        }
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
                this.eventsListeners['panoramaView mousedown'] = function (e) {
                    e.preventDefault();
                    that.move = true;
                    oldLeftPos = e.clientX;
                };
                elems.panoramaView.addEventListener('mousedown', this.eventsListeners['panoramaView mousedown']);
                this.eventsListeners['panoramaView mouseup'] = function (e) {
                    e.preventDefault();
                    that.move = false;
                };
                elems.panoramaView.addEventListener('mouseup', this.eventsListeners['panoramaView mouseup']);
                elems.panoramaView.addEventListener('mouseleave', this.eventsListeners['panoramaView mouseup']);
            }
            this.eventsListeners['panoramaView move'] = function (e) {
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
                const diff = Math.abs(oldLeftPos - curLeft);
                if (diff > 5) {
                    (oldLeftPos < curLeft) ? that.prevFrame() : that.nextFrame();
                    oldLeftPos = curLeft;
                }
            };
            elems.panoramaView.addEventListener(events.move, this.eventsListeners['panoramaView move']);
        }
        if (elems.btnLeft) {
            let intervalPrev;
            this.eventsListeners['btnLeft press'] = function (e) {
                e.preventDefault();
                that.nextFrame();
            };
            elems.btnLeft.addEventListener(events.press, this.eventsListeners['btnLeft press']);
            if (!isTouchDevice) {
                this.eventsListeners['btnLeft mousedown'] = function (e) {
                    e.preventDefault();
                    intervalPrev = setInterval(() => that.nextFrame(), 130);
                };
                elems.btnLeft.addEventListener('mousedown', this.eventsListeners['btnLeft mousedown']);
                this.eventsListeners['btnLeft mouseup'] = () => clearInterval(intervalPrev);
                elems.btnLeft.addEventListener('mouseup', this.eventsListeners['btnLeft mouseup']);
                elems.btnLeft.addEventListener('mouseleave', this.eventsListeners['btnLeft mouseup']);
            }
        }
        if (elems.btnRight) {
            let intervalNext;
            this.eventsListeners['btnRight press'] = function (e) {
                e.preventDefault();
                that.prevFrame();
            };
            elems.btnRight.addEventListener(events.press, this.eventsListeners['btnRight press']);
            if (!isTouchDevice) {
                this.eventsListeners['btnRight mousedown'] = function (e) {
                    e.preventDefault();
                    intervalNext = setInterval(() => that.prevFrame(), 130);
                };
                elems.btnRight.addEventListener('mousedown', this.eventsListeners['btnRight mousedown']);
                this.eventsListeners['btnRight mouseup'] = () => clearInterval(intervalNext);
                elems.btnRight.addEventListener('mouseup', this.eventsListeners['btnRight mouseup']);
                elems.btnRight.addEventListener('mouseleave', this.eventsListeners['btnRight mouseup']);
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
