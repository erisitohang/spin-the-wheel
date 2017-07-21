const SPIN_BUTTON = '#spin';
import $ from 'jquery';

import '../imgs/coin.png';
import '../imgs/chomp.png';
import '../imgs/flower.png';
import '../imgs/mshroom.png';
import '../imgs/star.png';


const defaultGift = require('./../data/gift.js');

export default class SpinTheWheel {
    constructor(selector) {
        this.canvas = document.getElementById(selector);
        this.$canvas = $('#' + selector);
        this.elems = {
            selector: '#' + selector,
            canvas: this.canvas,
            $canvas: this.$canvas
        };
        this.data = {
            canvas: this.canvas,
            gifts: defaultGift,
            width: 600,
            height: 600,
            startAngle: 0,
            spinTimeout: null,
            isSpinning: false,
            spinArcStart: 10,
            spinTime: 0,
            spinTimeTotal: 0,
            spinVelocity: 2000,
            ctx: null,
            rouletteWheel: {},
            outsideRadius: 250,
            textRadius: 194,
            insideRadius: 150,
            angle: null,
            text: null,
            drag: {
                clickedX: null,
                clickedY: null,
                currentDragX: null,
                currentDragY: null,
                previousDragX: null,
                previousDragY: null,
                isDragging: null,
                changedAngle: null,
                arcAngle: null
            }
        };
    }

    run() {
        if(!this.canvas.getContext) {
            return;
        }
        this.data.ctx = this.data.canvas.getContext("2d");
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.data.ctx.strokeStyle = "black";
        this.data.ctx.font = "12px Helvetica, Arial";
        this.data.arc = Math.PI / (this.data.gifts.length / 2);
        this.draw();
        this.addEvents();
    }

    draw() {
        const self = this;
        let numberOfItems = this.data.gifts.length;
        let patterns = [];
        this.data.gifts.forEach(function(gift, i) {
            let img = new Image();
            img.src = gift.src;
            img.onload = function() {
                patterns[i] = gift.background;//self.data.ctx.createPattern(img, 'repeat');
                if ((i+1) === numberOfItems) {
                    self.drawTheWheel(patterns);
                }

            };
        });
    }

    drawTheWheel(patterns) {
        const self = this;
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.data.gifts.forEach(function(gift, i) {
            self.data.angle = self.data.startAngle + i * self.data.arc;

            self.data.ctx.fillStyle = patterns[i];//gift.background;
            self.data.ctx.beginPath();
            self.data.ctx.arc(self.data.width / 2, self.data.height / 2, self.data.outsideRadius, self.data.angle, self.data.angle + self.data.arc, false);
            self.data.ctx.arc(self.data.width / 2, self.data.height / 2, self.data.insideRadius, self.data.angle + self.data.arc, self.data.angle, true);
            self.data.ctx.fill();

            self.data.ctx.save();

            /* Render Text */
            self.data.ctx.fillStyle = gift.color;
            self.data.ctx.translate(self.data.width / 2 + Math.cos(self.data.angle + self.data.arc /2) * self.data.textRadius,
                self.data.height / 2 + Math.sin(self.data.angle + self.data.arc / 2) * self.data.textRadius);
            self.data.ctx.rotate(self.data.angle + self.data.arc / 2 + Math.PI / 2);
            self.printName(gift.name, -self.data.ctx.measureText(gift.name).width / 2, 0, 14, ((2 * Math.PI * self.data.textRadius) / self.data.gifts.length) - 10);
            self.data.ctx.restore();

        });
        this.drawArrow();
    }

    addEvents() {
        const self = this;

        $(SPIN_BUTTON).on('click', function() {
            if(!self.retIsSpinning()) {
                self.spin(true);
            }
        });

        $(this.elems.selector).mousedown(function(e) {
            self.data.drag.clickedX = e.pageX;
            self.data.drag.clickedY = e.pageY;
            //set up the first instance of previous drag
            self.data.drag.previousDragX = e.pageX;
            self.data.drag.previousDragY = e.pageY;
            self.data.drag.isDragging = true;
        });

        $(this.elems.selector).mousemove(function(e) {
            if(self.data.drag.isDragging && !self.retIsSpinning()) {
                self.data.drag.currentDragX = e.pageX;
                self.data.drag.currentDragY = e.pageY;

                //finding the movement from the last drag
                self.data.drag.changedAngle = Math.atan2(self.data.drag.currentDragY - $(SPIN_BUTTON).position().top, self.data.drag.currentDragX - $(SPIN_BUTTON).position().left);
                self.data.drag.changedAngle -= Math.atan2(self.data.drag.previousDragY - $(SPIN_BUTTON).position().top, self.data.drag.previousDragX - $(SPIN_BUTTON).position().left);

                //recalculating the arc from when the mouse was firsted click -- used to indicate a 'spin'
                self.data.drag.arcAngle = Math.atan2(self.data.drag.currentDragY - $(SPIN_BUTTON).position().top, self.data.drag.currentDragX - $(SPIN_BUTTON).position().left);
                self.data.drag.arcAngle -= Math.atan2(self.data.drag.clickedY - $(SPIN_BUTTON).position().top, self.data.drag.clickedX - $(SPIN_BUTTON).position().left);


                //add whatever the angle has changed by from the last movement of the mouse
                self.addToStartAngle(self.data.drag.changedAngle);
                self.draw(true);

                //update the previous with the current coordinate of the mouse
                self.data.drag.previousDragY = self.data.drag.currentDragY;
                self.data.drag.previousDragX = self.data.drag.currentDragX;
            }
        });

        $(this.elems.selector).mouseup(function(e) {
            if((self.data.drag.arcAngle >= 0.5) && !self.retIsSpinning() && self.data.drag.changedAngle > 0) { // a minimum delta of rad = 0.5 required to drag around the wheel to count as a 'spin'
                self.spin(true);
            } else if((self.data.drag.arcAngle < -4) && !self.retIsSpinning() && self.data.drag.changedAngle > 0) {
                self.spin(true);
            } else if((self.data.drag.arcAngle <= -0.5) && !self.retIsSpinning() && self.data.drag.changedAngle < 0) {
                self.spin(false);
            } else if((self.data.drag.arcAngle > 4) && !self.retIsSpinning() && self.data.drag.changedAngle < 0) {
                self.spin(false);
            }
            self.data.drag.isDragging = false;
        });

        $(this.elems.selector).mouseout(function(e) {
            self.data.drag.isDragging = false;
        });
    }
    printName(text, x, y, lineHeight, fitWidth) {
        let str, splitDash, headText, tailText, idx;
        fitWidth = fitWidth || 0;

        if(fitWidth <= 0) {
            this.data.ctx.fillText(text, x, y);
            return;
        }

        for(idx = 1; idx <= text.length; idx++) {
            str = text.substr(0, idx);

            if(this.data.ctx.measureText(str).width > fitWidth) {
                splitDash = (text.charAt(idx - 2) !== " ") ? "-" : "";
                headText = text.substr(0, idx - 1) + splitDash;
                tailText = text.substr(idx - 1);
                this.data.ctx.fillText(headText, -this.data.ctx.measureText(headText).width / 2, y - lineHeight);
                this.printName(tailText, -this.data.ctx.measureText(tailText).width / 2, y + lineHeight, lineHeight, fitWidth - 10);
                return;
            }
        }

        this.data.ctx.fillText(text, x, (y ? y - lineHeight : y));
    }
    drawArrow(){
        this.data.ctx.fillStyle = "#333";
        this.data.ctx.beginPath();
        this.data.ctx.moveTo(this.data.width / 2  - 4, this.data.height / 2  - (this.data.outsideRadius + 25));
        this.data.ctx.lineTo(this.data.width / 2 + 4, this.data.height / 2  - (this.data.outsideRadius + 25));
        this.data.ctx.lineTo(this.data.width / 2 + 4, this.data.height / 2  - (this.data.outsideRadius + 15));
        this.data.ctx.lineTo(this.data.width / 2 + 9, this.data.height / 2  - (this.data.outsideRadius + 15));
        this.data.ctx.lineTo(this.data.width / 2, this.data.height / 2  - this.data.outsideRadius);
        this.data.ctx.lineTo(this.data.width / 2 - 9, this.data.height / 2  - (this.data.outsideRadius + 15));
        this.data.ctx.lineTo(this.data.width / 2 - 4, this.data.height / 2  - (this.data.outsideRadius + 15));
        this.data.ctx.lineTo(this.data.width / 2 - 4, this.data.height / 2 - (this.data.outsideRadius + 25));
        this.data.ctx.fill();
    }


    /**
     * Start Spin
     * @returns {boolean}
     */
    retIsSpinning() {
        return this.data.isSpinning;
    }
    spin(isForward) {
        this.data.spinAngleStart = Math.random() * 10 + 10;
        this.data.spinTime = 0;
        this.data.spinTimeTotal = Math.random() * 3 + 4 * this.data.spinVelocity;

        if(!this.data.isSpinning && isForward) {
            this.data.isSpinning = true;
            this.rotate(true);
        } else if (!this.data.isSpinning && !isForward) {
            this.data.isSpinning = true;
            this.rotate(false);
        }
    }
    rotate(isForward) {
        const self = this;
        this.data.spinTime += 30;
        if(this.data.spinTime >= this.data.spinTimeTotal) {
            this.stopRotate();
            this.data.isSpinning = false;
            return;
        }
        const spinAngle = this.data.spinAngleStart - SpinTheWheel.easeOut(this.data.spinTime, 0, this.data.spinAngleStart, this.data.spinTimeTotal);
        if(isForward) {
            this.data.startAngle += (spinAngle * Math.PI / 180);
        } else {
            this.data.startAngle -= (spinAngle * Math.PI / 180);
        }
        this.draw();
        this.data.spinTimeout = setTimeout(function() {
            self.rotate(isForward);
        }, 30);
    }
    static easeOut (t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;

        return b + c * (tc + -3 * ts + 3 * t);
    }
    stopRotate() {
        clearTimeout(this.data.spinTimeout);
        let degrees = this.data.startAngle * 180 / Math.PI + 90;
        let arcd = this.data.arc * 180 / Math.PI;
        let index = Math.floor((360 - degrees % 360) / arcd);
        this.data.ctx.save();
        console.log(arcd);
        if(degrees < 0) {
            degrees = Math.abs(degrees);
            index = Math.floor((degrees % 360) / arcd);
        }

        //WOL.app.lightbox.Result = new ResultLightbox(this.data.gifts[index]);
        console.log(this.data.gifts[index]);
        this.data.ctx.restore();
    }
    addToStartAngle(angle) {
    }

}