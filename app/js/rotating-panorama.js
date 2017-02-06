const body = document.querySelector('body');
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
        this.frames = parseInt(this.elems.panorama.getAttribute('data-panorama-frames'), 10);
        this.sourceMask = this.elems.panorama.getAttribute('data-panorama');
        if (opt.startFrame <= this.frames && opt.startFrame >= 0) {
            this.curFrame = opt.startFrame;
        }
        else {
            this.curFrame = 0;
        }
        this.addElements(this.elems, opt.preloadImages);
        this.addEventListeners(this.elems);
    }
    addElements(elems, preloadImages = false) {
        // add image
        elems.image = document.createElement('img');
        elems.image.setAttribute('src', this.getSource(this.curFrame));
        elems.panoramaView.appendChild(elems.image);
        if (preloadImages) {
            for (let i = 0; i < this.frames; i++) {
                const img = new Image();
                img.src = this.getSource(i);
            }
        }
    }
    addEventListeners(elems) {
        const that = this;
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
////////////////////////////
window.onload = function () {
    const panorama = new Panorama({
        panorama: '[data-panorama]',
        panoramaView: '[data-panorama-view]',
        btnPrev: '[data-panorama-prev]',
        btnNext: '[data-panorama-next]',
        preloadImages: true,
    });
    console.log(panorama, body);
    // window.pan = panorama;
};

//# sourceMappingURL=rotating-panorama.js.map
