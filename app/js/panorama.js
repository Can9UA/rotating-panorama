'use strict';
const isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) ||
    ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
const events = {
    press: (isTouchDevice) ? 'touchstart' : 'click',
    move: (isTouchDevice) ? 'touchmove' : 'mousemove'
};
const body = document.querySelector('body');
let preloadedImages = [];
class Panorama {
    constructor(opt) {
        this.eventsListeners = [];
        this.elems = this.getElems(opt);
        this.numberOfFrames = opt.numberOfFrames;
        this.sourceMask = opt.sourceMask || this.elems.panorama.getAttribute('data-panorama');
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
        // autoplay
        this.autoplay = this.initAutoplay(opt.autoplay);
        if (this.autoplay.enable) {
            this.autoplay.startRotation();
        }
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
        let source = this.sourceMask.replace('${index}', frame.toString());
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
    }
    getElems(opt) {
        const elems = {
            panorama: null,
            panoramaView: null,
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
            }
            else {
                elems[elemName] = opt[elemName];
            }
        }
        return elems;
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
        const panorama = this;
        if (elems.panoramaView) {
            let oldLeftPos = 0;
            if (!isTouchDevice) {
                this.eventsListeners['panoramaView mousedown'] = function (e) {
                    e.preventDefault();
                    panorama.autoplay.stopRotation();
                    panorama.move = true;
                    oldLeftPos = e.clientX;
                };
                elems.panoramaView.addEventListener('mousedown', this.eventsListeners['panoramaView mousedown']);
                this.eventsListeners['panoramaView mouseup'] = function (e) {
                    e.preventDefault();
                    setTimeout(() => panorama.autoplay.startRotation(), 600);
                    panorama.move = false;
                };
                elems.panoramaView.addEventListener('mouseup', this.eventsListeners['panoramaView mouseup']);
                elems.panoramaView.addEventListener('mouseleave', this.eventsListeners['panoramaView mouseup']);
            }
            this.eventsListeners['panoramaView move'] = function (e) {
                e.preventDefault();
                if (panorama.autoplay.stopOnHover || e instanceof TouchEvent) {
                    panorama.autoplay.stopRotation();
                }
                let curLeft = 0;
                if (e instanceof MouseEvent) {
                    if (!panorama.move) {
                        return;
                    }
                    curLeft = e.clientX;
                }
                else if (e instanceof TouchEvent) {
                    curLeft = e.targetTouches[0].clientX;
                }
                const diff = Math.abs(oldLeftPos - curLeft);
                if (diff > 5) {
                    (oldLeftPos < curLeft) ? panorama.prevFrame() : panorama.nextFrame();
                    oldLeftPos = curLeft;
                }
            };
            elems.panoramaView.addEventListener(events.move, this.eventsListeners['panoramaView move']);
        }
        if (elems.btnNext) {
            let intervalPrev;
            this.eventsListeners['btnNext press'] = function (e) {
                e.preventDefault();
                panorama.nextFrame();
            };
            elems.btnNext.addEventListener(events.press, this.eventsListeners['btnNext press']);
            if (!isTouchDevice) {
                this.eventsListeners['btnNext mousedown'] = function (e) {
                    e.preventDefault();
                    intervalPrev = setInterval(() => panorama.nextFrame(), 130);
                };
                elems.btnNext.addEventListener('mousedown', this.eventsListeners['btnNext mousedown']);
                this.eventsListeners['btnNext mouseup'] = () => clearInterval(intervalPrev);
                elems.btnNext.addEventListener('mouseup', this.eventsListeners['btnNext mouseup']);
                elems.btnNext.addEventListener('mouseleave', this.eventsListeners['btnNext mouseup']);
            }
        }
        if (elems.btnPrev) {
            let intervalNext;
            this.eventsListeners['btnPrev press'] = function (e) {
                e.preventDefault();
                panorama.prevFrame();
            };
            elems.btnPrev.addEventListener(events.press, this.eventsListeners['btnPrev press']);
            if (!isTouchDevice) {
                this.eventsListeners['btnPrev mousedown'] = function (e) {
                    e.preventDefault();
                    intervalNext = setInterval(() => panorama.prevFrame(), 130);
                };
                elems.btnPrev.addEventListener('mousedown', this.eventsListeners['btnPrev mousedown']);
                this.eventsListeners['btnPrev mouseup'] = () => clearInterval(intervalNext);
                elems.btnPrev.addEventListener('mouseup', this.eventsListeners['btnPrev mouseup']);
                elems.btnPrev.addEventListener('mouseleave', this.eventsListeners['btnPrev mouseup']);
            }
        }
    }
    preloadImages(frame = 1) {
        const panorama = this;
        if (frame === 1) {
            preloadedImages = [];
        }
        if (frame < this.numberOfFrames) {
            const image = this.cacheImg(frame);
            image.addEventListener('load', function () {
                panorama.preloadImages(frame + 1);
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
    initAutoplay(options) {
        if (!options) {
            return {
                enable: false,
                startRotation() { return; },
                stopRotation() { return; },
            };
        }
        const panorama = this;
        const Autoplay = {
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
            reload() {
                this.stopRotation();
                this.startRotation();
            },
            update(params) {
                if (!params) {
                    return;
                }
                if (params.direction) {
                    this.direction = params.direction;
                    if (this.enable) {
                        this.reload();
                    }
                }
            }
        };
        return Autoplay;
    }
}

//# sourceMappingURL=panorama.js.map
