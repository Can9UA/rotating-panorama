const body = document.querySelector('body');
const preloadedImages = [];
class Panorama {
    constructor(opt) {
        this.elems = {
            panorama: body.querySelector(opt.panorama),
            panoramaView: body.querySelector(opt.panoramaView),
            btnPrev: body.querySelector(opt.btnPrev),
            btnNext: body.querySelector(opt.btnNext)
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
    addElements(elems, preloadImages = false) {
        const that = this;
        // add image
        elems.image = document.createElement('img');
        elems.image.setAttribute('src', this.getSource(this.curFrame));
        elems.panoramaView.appendChild(elems.image);
        if (preloadImages) {
            function preload(frame) {
                if (frame < that.frames) {
                    const img = new Image();
                    img.onload = function () { preload(frame + 1); };
                    img.src = that.getSource(frame);
                    preloadedImages.push(img);
                }
            }
            preload(0);
        }
    }
    addEventListeners(elems) {
        const that = this;
        if (elems.panoramaView) {
            elems.panoramaView.addEventListener('mousedown', function (e) {
                e.preventDefault();
                that.move = true;
            });
            elems.panoramaView.addEventListener('mouseup', function (e) {
                e.preventDefault();
                that.move = false;
            });
            elems.panoramaView.addEventListener('mouseleave', function (e) {
                e.preventDefault();
                that.move = false;
            });
            let oldPosLeft = 0;
            elems.panoramaView.addEventListener('mousemove', function (e) {
                e.preventDefault();
                if (!that.move) {
                    return;
                }
                if (oldPosLeft < e.clientX) {
                    that.prevFrame();
                }
                else if (oldPosLeft > e.clientX) {
                    that.nextFrame();
                }
                oldPosLeft = e.clientX;
            });
        }
        if (elems.btnPrev) {
            let intervalPrev;
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
            elems.btnPrev.addEventListener('mouseleave', function () {
                clearInterval(intervalPrev);
            });
        }
        if (elems.btnNext) {
            let intervalNext;
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
            elems.btnNext.addEventListener('mouseleave', function () {
                clearInterval(intervalNext);
            });
        }
    }
    // methods
    prevFrame() {
        let frame = this.curFrame - 1;
        if (frame <= 0) {
            frame = this.frames - 1;
        }
        this.elems.image.setAttribute('src', this.getSource(frame));
        this.curFrame = frame;
    }
    nextFrame() {
        let frame = this.curFrame + 1;
        if (frame >= this.frames) {
            frame = 0;
        }
        this.elems.image.setAttribute('src', this.getSource(frame));
        this.curFrame = frame;
    }
    goToFrame(frame) {
        if (frame < this.frames && frame >= 0) {
            this.elems.image.setAttribute('src', this.getSource(frame));
            this.curFrame = frame;
        }
    }
    getSource(frame) {
        return this.sourceMask.replace('\$', frame);
    }
}

//# sourceMappingURL=panorama.js.map
