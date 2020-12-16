(function () {

    function Point(x, y, time, force) {
        this.x = x
        this.y = y
        this.t = time || new Date().getTime()
        this.f = force || 1
    }

    Point.prototype.distanceTo = function (start) {
        return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2))
    }

    Point.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y && this.t === other.t && this.f === other.f
    }

    Point.prototype.velocityFrom = function (start) {
        return this.t !== start.t ? this.distanceTo(start) / (this.t - start.t) : 1
    }


    function Bezier(startPoint, controlPoint, endPoint) {
        this.startPoint = startPoint
        this.controlPoint = controlPoint
        this.endPoint = endPoint
    }

    Bezier.prototype.length = function () {
        var step = 10
        var length = 0
        var px = void 0
        var py = void 0
        for (var i = 0; i <= step; i += 1) {
            var t = i / step
            var cx = this._point(t, this.startPoint.x, this.controlPoint.x, this.endPoint.x)
            var cy = this._point(t, this.startPoint.y, this.controlPoint.y, this.endPoint.y)
            if (i > 0) {
                var xdiff = cx - px
                var ydiff = cy - py
                length += Math.sqrt(xdiff * xdiff + ydiff * ydiff)
            }
            px = cx
            py = cy
        }

        return length
    }

    Bezier.prototype._point = function (t, start, con, end) {
        return start * (1 - t) * (1 - t) + 2 * con * (1 - t) * t + end * t * t
    }


    var signaturePad = function (canvas, options) {
        var sich = this
        var opts = options || {}

        this.velocityFilterWeight = opts.velocityFilterWeight || 0.7
        this.minWidth = opts.minWidth || 0.5
        this.maxWidth = opts.maxWidth || 2.5
        this.penColor = opts.penColor || 'black'
        this.onBegin = opts.onBegin
        this.onEnd = opts.onEnd
        this.page = opts.page
        this.scrolly = opts.scrolly || 0
        this.level = opts.level || 0
        this.drawType = opts.type || 0
        this.sharpType = opts.sharpType || 0

        this.canvas = canvas
        this._ctx = canvas.getContext('2d')
        this._canvasSize = {
            width: 0,
            height: 0
        }
        this._canvasOffset = {
            x: 0,
            y: 0
        }
        this._lines = []
        this._drawStatus = []
        this._pro = {}
        this._origin = {}
        this._end = {}
        this._lastVelocity = 0;
        this._drawable = false
        this._scrolly = this.scrolly
        this._isEmpty = true
        this._reset()
        this.on()

        this._handleMouseDown = function (event) {
            if (event.which === 1) {
                sich._initialCanvasParameter(event)
                sich._strokeBegin(event, event.timeStamp)
            }
        }

        this._handleMouseMove = function (event) {
            event.preventDefault()
            sich._strokeUpdate(event, event.timeStamp)
        }

        this._handleMouseUp = function (event) {
            if (event.which === 1) {
                sich._strokeEnd(event)
            }
        }

        this._handleTouchStart = function (event) {
            event.preventDefault()

            if (event.targetTouches.length === 1) {
                sich._initialCanvasParameter(event)
                var touch = event.changedTouches[0];
                sich._strokeBegin(touch, event.timeStamp, true);
            }
        }

        this._handleTouchMove = function (event) {
            event.preventDefault()
            var touch = event.targetTouches[0]
            sich._strokeUpdate(touch, event.timeStamp, true)
        }

        this._handleTouchEnd = function (event) {
            var wasCanvasTouched = event.target === sich.canvas
            if (wasCanvasTouched) {
                event.preventDefault()
                var touch = event.changedTouches[0]
                sich._strokeEnd(touch)
            }
        }

    }

    signaturePad.prototype.on = function () {
        this.canvas.style.touchAction = 'none';
        this.canvas.style.msTouchAction = 'none';

        this._handleMouseEvents();
        this._handleTouchEvents();
    }

    signaturePad.prototype._reset = function () {
        this._lastVelocity = 0;
        this._lastWidth = (this.maxWidth + this.minWidth) / 2
        this._ctx.fillStyle = this.penColor
    }
    // signaturePad.prototype._handlePointerEvents = function () {
    //     this.canvas.addEventListener('pointerdown', this._handleMouseDown);
    //     this.canvas.addEventListener('pointermove', this._handleMouseMove);
    //     document.addEventListener('pointerup', this._handleMouseUp);
    // }

    signaturePad.prototype._handleMouseEvents = function () {
        let sich = this;
        this.canvas.addEventListener('mousedown', function (event) {
            sich._handleMouseDown(event)
        });
        this.canvas.addEventListener('mousemove', function (event) {
            sich._handleMouseMove(event)
        });
        document.addEventListener('mouseup', function (event) {
            sich._handleMouseUp(event)
        });
    }

    signaturePad.prototype._handleTouchEvents = function () {
        let sich = this
        this.canvas.addEventListener('touchstart', function (event) {
            sich._handleTouchStart(event)
        });
        this.canvas.addEventListener('touchmove', function (event) {
            sich._handleTouchMove(event)
        });
        this.canvas.addEventListener('touchend', function (event) {
            sich._handleTouchEnd(event)
        });
    }

    signaturePad.prototype._strokeBegin = function (event, t, touch) {
        if (typeof this.onBegin === 'function') {
            this.onBegin(event)
        }
        var sc = this._scrolly - this.scrolly
        var temp

        this._drawable = true
        if (touch) {
            window.Pressure.set($(event.target), {
                change: (force) => {
                    temp = this._createPoint(event.clientX, event.clientY + sc, t, force || 0)
                }
            })
        } else {
            temp = this._createPoint(event.clientX, event.clientY + sc, t, 1)
        }

        this._origin = temp

        switch (this.drawType) {
            case 0:
                this._lines.push(temp)
                break
            case 1:
                if ($(".op-frame.active").length == 0) {
                    origin.x = event.clientX - this._canvasOffset.x;
                    origin.y = event.clientY - this._canvasOffset.y;
                    $(event.target).parent().append(uploadHtml)
                    listenDrag(this)
                    $(".op-frame.active").css({
                        "left": origin.x + "px",
                        "top": origin.y + "px",
                        "width": textAreaData.width + "px",
                        "height": textAreaData.height + "px"
                    });
                } else {
                    if ($(".op-frame.active").find("input[type=file]").val() != "") {
                        this.saveImage()
                    } else {
                        $(".op-frame.active").remove();
                    }
                }
                break
            case 2:
                this._lines.push(temp)
                break
            case 3:
                this._lines.push(temp)
                break
            case 4:
                this._lines.push(temp)
                break
        }
    }

    signaturePad.prototype._strokeUpdate = function (event, t, touch) {
        if (!this._drawable) return
        var sc = this._scrolly - this.scrolly
        var temp
        if (this.drawType === 0) {
            this._end = {
                x: event.clientX - this._canvasOffset.x,
                y: event.clientY - this._canvasOffset.y + sc,
                t: t
            }
            if (touch) {
                window.Pressure.set($(event.target), {
                    change: (force) => {
                        temp = this._createPoint(event.clientX, event.clientY + sc, t, force || 0)
                    }
                })
            } else {
                temp = this._createPoint(event.clientX, event.clientY + sc, t, 1)
            }
            this._end = temp
            this._draw(this._ctx)
            this._lines.push(temp)
            this._isEmpty = false
            this._pro = this._origin
            this._origin = this._end
        } else if (this.drawType >= 2) {
            this._end = {
                x: event.clientX - this._canvasOffset.x,
                y: event.clientY - this._canvasOffset.y + sc,
                t: 0,
                f: 1
            }
            this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this._reDraw()
            this._draw(this._ctx)
        }

    }

    signaturePad.prototype._strokeEnd = function (event) {
        if (!this._end.x) {
            this._drawPoint(this._ctx)
        }
        if (this.drawType == 2 || this.drawType == 3 || this.drawType == 4) {
            this._lines.push(this._end)
            this._isEmpty = false
        }
        this._drawable = false
        if (!this._drawStatus[this.level]) {
            this._drawStatus[this.level] = []
        }
        if (this._lines.length > 0) {
            this._drawStatus[this.level].push({
                "line": this._lines,
                "line_width": this.maxWidth,
                "line_color": this.penColor,
                "sharp": this.sharpType,
                "place": this.page,
                "type": this.drawType
            })
        }
        this._origin = {}
        this._end = {}
        this._pro = {}
        this._lines = []
        if (typeof this.onEnd === 'function') {
            this.onEnd(event)
        }
    }

    signaturePad.prototype._initialCanvasParameter = function (e) {
        this._canvasSize = {
            width: $(e.target).width(),
            height: $(e.target).height()
        };
        this._canvasOffset = {
            x: $(e.target).offset().left,
            y: $(e.target).offset().top
        };
    }

    signaturePad.prototype._draw = function (context, mW, ori, end, pro) {
        var sc = this._scrolly - this.scrolly

        var ori = ori ? ori : this._origin
        var oX = ori.x
        var oY = ori.y - sc
        var oT = ori.t

        var end = end ? end : this._end
        var eX = end.x
        var eY = end.y - sc
        var eT = end.t
        var eF = end.f

        var pro = pro ? pro : this._pro

        context.fillStyle = this.penColor
        context.strokeStyle = this.penColor

        if (this.drawType === 0) {
            if (!pro.x || this.sharpType == 1 || this.sharpType == 2 || this.sharpType == 3) {
                var leng = Math.sqrt(Math.pow(eX - oX, 2) + Math.pow(eY - oY, 2))
                var step = eT - oT
                var maxW = mW ? mW * eF : this.maxWidth * eF
                var minW = this.minWidth
                var curve = {
                    d: 2 * step,
                    w: maxW
                }
                if (step < 0) return
                if (step < leng) {
                    if (this.sharpType === 0) {
                        curve.w = minW + (maxW - minW) * (step / leng)
                        curve.d = 2 * leng / curve.w
                    } else if (this.sharpType === 1 || this.sharpType === 2) {
                        curve.d = leng / minW
                    }
                }
                context.beginPath();
                for (var i = 0; i <= curve.d; i++) {
                    var x = oX + i * (eX - oX) / curve.d;
                    var y = oY + i * (eY - oY) / curve.d;
                    if (this.sharpType === 0) {
                        context.moveTo(x, y)
                        context.arc(x, y, curve.w, 0, 2 * Math.PI, false)
                    } else if (this.sharpType === 1) {
                        context.moveTo(x, y - curve.w * 2)
                        context.lineTo(x + minW, y)
                        context.lineTo(x, y + curve.w * 2)
                        context.lineTo(x - minW, y)
                    } else if (this.sharpType === 2) {
                        context.moveTo(x, y)
                        context.arc(x, y, maxW, 0, 2 * Math.PI, false)
                    } else if (this.sharpType === 3) {
                        context.moveTo(x, y)
                        context.clearRect(x - 2 * maxW, y - 2 * maxW, maxW * 4, maxW * 4)
                    }
                }
                context.closePath();
                context.fill();
            } else {
                var _addPoint = this._addPoint(pro, ori, end)
                if (_addPoint.curve && _addPoint.widths) {
                    this._drawCurve(_addPoint.curve, _addPoint.widths.start, _addPoint.widths.end)
                }
            }
        } else if (this.drawType === 2) {
            context.lineWidth = (this.minWidth + this.maxWidth) / 2
            context.beginPath()
            context.moveTo(oX, oY)
            context.lineTo(eX, eY)
            context.stroke()
        } else if (this.drawType === 3) {
            context.lineWidth = (this.minWidth + this.maxWidth) / 2
            var k = ((eX - oX) / 0.75) / 2,
                w = (eX - oY) / 2,
                h = (eY - oY) / 2,
                x = (eX + oX) / 2,
                y = (eY + oY) / 2;
            context.beginPath();
            context.moveTo(x, y - h);
            context.bezierCurveTo(x + k, y - h, x + k, y + h, x, y + h);
            context.bezierCurveTo(x - k, y + h, x - k, y - h, x, y - h);
            context.closePath();
            context.stroke();
        } else if (this.drawType === 4) {
            context.lineWidth = (this.minWidth + this.maxWidth) / 2
            context.beginPath();
            context.rect(oX, oY, eX - oX, eY - oY);
            context.stroke();
        }
    }

    signaturePad.prototype._drawPoint = function (context, fromX, fromY, mW) {
        if (this.drawType > 1) return
        var sc = this._scrolly - this.scrolly
        var oX = fromX ? fromX : this._origin.x;
        var oY = fromY ? fromY - sc : this._origin.y - sc;
        context.beginPath()
        context.fillStyle = this.penColor
        context.strokeStyle = this.penColor
        let w = mW ? mW : this.maxWidth
        if (this.sharpType === 0 || this.sharpType === 2) {
            context.moveTo(oX, oY)
            context.arc(oX, oY, w, 0, 2 * Math.PI, false)
        } else if (this.sharpType === 1) {
            context.moveTo(oX, oY - w * 2)
            context.lineTo(oX + w * 3, oY)
            context.lineTo(oX, oY + w * 2)
            context.lineTo(oX - w * 2, oY)
        } else if (this.sharpType === 3) {
            context.moveTo(oX, oY)
            context.clearRect(oX - 2 * w, oY - 2 * w, w * 4, w * 4)
        }

        context.closePath();
        context.fill();
    }

    signaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
        var ctx = this._ctx
        var widthDelta = endWidth - startWidth
        var drawSteps = Math.floor(curve.length())

        ctx.beginPath()

        // 二阶贝塞尔曲线
        for (var i = 0; i < drawSteps; i++) {
            var t = i / drawSteps
            var tt = t * t
            var u = 1 - t
            var uu = u * u

            var x = uu * curve.startPoint.x
            x += 2 * u * t * curve.controlPoint.x
            x += tt * curve.endPoint.x

            var y = uu * curve.startPoint.y
            y += 2 * u * t * curve.controlPoint.y
            y += tt * curve.endPoint.y

            var width = (startWidth + tt * widthDelta) * curve.startPoint.f
            ctx.moveTo(x, y)
            ctx.arc(x, y, width, 0, 2 * Math.PI, false)
        }

        ctx.closePath()
        ctx.fill()
    }

    signaturePad.prototype._addPoint = function (pro, ori, end) {
        var temp = void 0;

        temp = this._calculateCurveControlPoints(pro, ori, end)
        var cp = temp.c2
        var curve = new Bezier(ori, cp, end)
        var widths = this._calculateCurveWidths(curve)

        return { curve: curve, widths: widths }
    }

    signaturePad.prototype._createPoint = function (x, y, time, force) {
        return new Point(x - this._canvasOffset.x, y - this._canvasOffset.y, time || new Date().getTime(), force || 1)
    }

    signaturePad.prototype.clear = function () {
        var ctx = this._ctx
        var canvas = this.canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._isEmpty = true
        this._lines = []
        this._origin = {}
        this._end = {}
        this._drawStatus = []
    }

    signaturePad.prototype.toData = function () {
        return this._drawStatus
    }

    signaturePad.prototype.isEmpty = function () {
        return this._isEmpty
    }

    signaturePad.prototype.toDataUrl = function (type, encoderOptions) {
        if (!type) {
            type = 'image/png'
        }
        switch (type) {
            case 'image/svg+xml':
                return
            default:
                return this.canvas.toDataURL(type, encoderOptions)
        }
    }

    signaturePad.prototype.scorll = function (scorlly) {
        this.canvas.style.top = -scorlly + 'px'
    }

    signaturePad.prototype.cancel = function () {
        let sich = this
        if (this._isEmpty) return
        let osharp = this.sharpType
        let otype = this.drawType
        let ocolor = this.penColor
        this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this._drawStatus.map((lineArr, index) => {
            if (index === sich.level) {
                lineArr.pop()
            }
            if (lineArr.length > 0) {
                lineArr.map((lines) => {
                    let len = lines.line.length
                    this.sharpType = lines.sharp
                    this.drawType = lines.type
                    this.penColor = lines.line_color
                    if (len > 1) {
                        for (let i = 0; i < len - 1; i++) {
                            let ori = lines.line[i],
                                pro = lines.line[i - 1],
                                end = lines.line[i + 1];
                            sich._draw(sich._ctx, lines.line_width, ori, end, pro)
                        }
                    } else {
                        sich._drawPoint(this._ctx, lines.line[0].x, lines.line[0].y, lines.line_width)
                    }

                })
            }
        })
        this.sharpType = osharp
        this.drawType = otype
        this.penColor = ocolor
    }

    signaturePad.prototype._reDraw = function () {
        let sich = this
        let osharp = this.sharpType
        let otype = this.drawType
        let ocolor = this.penColor
        if (this._isEmpty) return
        this._drawStatus.map((lineArr, index) => {
            if (lineArr.length > 0) {
                lineArr.map((lines) => {
                    let len = lines.line.length
                    this.sharpType = lines.sharp
                    this.drawType = lines.type
                    this.penColor = lines.line_color
                    if (len > 1) {
                        this._pro = lines.line[0]
                        for (let i = 0; i < len - 1; i++) {
                            let ori = lines.line[i],
                                pro = lines.line[i - 1],
                                end = lines.line[i + 1];
                            sich._draw(sich._ctx, lines.line_width, ori, end, pro)
                        }
                    } else {
                        sich._drawPoint(this._ctx, lines.line[0].x, lines.line[0].y, lines.line_width)
                    }

                })
            }
        })
        this.sharpType = osharp
        this.drawType = otype
        this.penColor = ocolor
    }

    signaturePad.prototype.saveImage = function () {
        $(".op-frame.active").css("top", textAreaData.top + "px");
        let img = $('.op-frame.active')
        this._drawStatus[this.level].push({
            'place': this.page,
            'width': img.width
        })
    }

    signaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
        var dx1 = s1.x - s2.x;
        var dy1 = s1.y - s2.y;
        var dx2 = s2.x - s3.x;
        var dy2 = s2.y - s3.y;

        var m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
        var m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

        var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        var l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        var dxm = m1.x - m2.x;
        var dym = m1.y - m2.y;

        var k = l2 / (l1 + l2);
        var cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

        var tx = s2.x - cm.x;
        var ty = s2.y - cm.y;

        return {
            c1: new Point(m1.x + tx, m1.y + ty, 1, 1),
            c2: new Point(m2.x + tx, m2.y + ty, 1, 1)
        };
    }

    signaturePad.prototype._calculateCurveWidths = function (curve) {
        var startPoint = curve.startPoint
        var endPoint = curve.endPoint
        var widths = { start: null, end: null }

        var velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) + (1 - this.velocityFilterWeight) * this._lastVelocity;
        var newWidth = this._strokeWidth(velocity)

        widths.start = this._lastWidth
        widths.end = newWidth

        this._lastVelocity = velocity
        this._lastWidth = newWidth

        return widths

    }

    signaturePad.prototype._strokeWidth = function (velocity) {
        return Math.max(this.maxWidth / (velocity + 1), this.minWidth)
    }

    window.SignaturePad = signaturePad;
}())

var uploadHtml = '<div class="op-frame active">' +
    '<div class="op-inter" data-id="corner8"></div>' +
    '<div class="op-obj op-rect op-text">' +
    '<label>' +
    '<input type="file" style="display: none;" onchange="uploadImage(this)"/>' +
    '<div class="image-box"/>' +
    '</label>' +
    '</div>' +
    '<div class="op-ctl-p lt-p" data-id="corner0"></div>' +
    '<div class="op-ctl-p mt-p" data-id="corner1"></div>' +
    '<div class="op-ctl-p rt-p" data-id="corner2"></div>' +
    '<div class="op-ctl-p rm-p" data-id="corner3"></div>' +
    '<div class="op-ctl-p rb-p" data-id="corner4"></div>' +
    '<div class="op-ctl-p mb-p" data-id="corner5"></div>' +
    '<div class="op-ctl-p lb-p" data-id="corner6"></div>' +
    '<div class="op-ctl-p lm-p" data-id="corner7"></div>' +
    '</div>'

var dragable = false
var dragType = null
var textAreaData = {
    "left": 0,
    "top": 0,
    "width": 200,
    "height": 100
}
var origin = {
    x: 0,
    y: 0
}
var end = {
    x: 0,
    y: 0
}
var pad = null
function listenDrag(signaturePad) {
    pad = signaturePad
    $(".op-inter,.op-ctl-p").bind("mousedown touchstart", function (event) {
        event.stopPropagation()
        dragable = true;
        var i = event.type == "touchstart" ? event.originalEvent.targetTouches[0] : event;
        origin.x = i.clientX - signaturePad._canvasOffset.x;
        origin.y = i.clientY - signaturePad._canvasOffset.y;
        textAreaData.left = $(".op-frame.active").position().left;
        textAreaData.top = $(".op-frame.active").position().top;
        textAreaData.width = $(".op-frame.active").width();
        textAreaData.height = $(".op-frame.active").height();
        $(".saveText").remove();
        if ($(event.target).attr("data-id") == "corner8") {
            dragType = 0
        } else if ($(event.target).attr("data-id") == "corner0") {
            dragType = 1
        } else if ($(event.target).attr("data-id") == "corner1") {
            dragType = 2
        } else if ($(event.target).attr("data-id") == "corner2") {
            dragType = 3
        } else if ($(event.target).attr("data-id") == "corner3") {
            dragType = 4
        } else if ($(event.target).attr("data-id") == "corner4") {
            dragType = 5
        } else if ($(event.target).attr("data-id") == "corner5") {
            dragType = 6
        } else if ($(event.target).attr("data-id") == "corner6") {
            dragType = 7
        } else if ($(event.target).attr("data-id") == "corner7") {
            dragType = 8
        };

    });
    //bind textRea move
    $(document).bind('mousemove touchmove', function (event) {
        event.preventDefault();
        var i = event.type == "touchmove" ? event.originalEvent.targetTouches[0] : event;
        if (dragable == true) {
            end.x = i.clientX - signaturePad._canvasOffset.x;
            end.y = i.clientY - signaturePad._canvasOffset.y;
            if (dragType == 0) {
                $(".op-frame.active").css({
                    "left": textAreaData.left + (end.x - origin.x) + "px",
                    "top": textAreaData.top + (end.y - origin.y) + "px"
                })
            } else if (dragType == 1) {
                $(".op-frame.active").css({
                    "left": textAreaData.left + (end.x - origin.x) + "px",
                    "top": textAreaData.top + (end.y - origin.y) + "px",
                    "width": textAreaData.width - (end.x - origin.x) + "px",
                    "height": textAreaData.height - (end.y - origin.y) + "px"
                })
            } else if (dragType == 2) {
                $(".op-frame.active").css({
                    "top": textAreaData.top + (end.y - origin.y) + "px",
                    "height": textAreaData.height - (end.y - origin.y) + "px"
                })
            } else if (dragType == 3) {
                $(".op-frame.active").css({
                    "top": textAreaData.top + (end.y - origin.y) + "px",
                    "width": textAreaData.width + (end.x - origin.x) + "px",
                    "height": textAreaData.height - (end.y - origin.y) + "px"
                })
            } else if (dragType == 4) {
                $(".op-frame.active").css({
                    "width": textAreaData.width + (end.x - origin.x) + "px",
                })
            } else if (dragType == 5) {
                $(".op-frame.active").css({
                    "width": textAreaData.width + (end.x - origin.x) + "px",
                    "height": textAreaData.height + (end.y - origin.y) + "px"
                })
            } else if (dragType == 6) {
                $(".op-frame.active").css({
                    "height": textAreaData.height + (end.y - origin.y) + "px"
                })
            } else if (dragType == 7) {
                $(".op-frame.active").css({
                    "left": textAreaData.left + (end.x - origin.x) + "px",
                    "width": textAreaData.width - (end.x - origin.x) + "px",
                    "height": textAreaData.height + (end.y - origin.y) + "px"
                })
            } else if (dragType == 8) {
                $(".op-frame.active").css({
                    "left": textAreaData.left + (end.x - origin.x) + "px",
                    "width": textAreaData.width - (end.x - origin.x) + "px",
                })
            }
            if ($(".op-frame.active").width == 0 || $(".op-frame.active").height == 0) {
                $(".op-frame.active").css({
                    "width": "0px",
                    "height": "0px"
                })
            }

        }
    })
    $(document).bind('mouseup touchend', function (event) {
        dragable = false;
        if (dragable == false && $(".op-frame.active").position()) {
            //constrict size of textArea
            if ($(".op-frame.active").position().left + $(".op-frame.active").width() > signaturePad.canvas.width - 20) {
                $(".op-frame.active").css({
                    "left": (signaturePad.canvas.width - $(".op-frame.active").width() - 20) + "px"
                })
            }
            if ($(".op-frame.active").position().top + $(".op-frame.active").height() > signaturePad.canvas.height - 20) {
                $(".op-frame.active").css({
                    "top": (signaturePad.canvas.height - $(".op-frame.active").height() - 20) + "px"
                })
            };
            if ($(".op-frame.active").position().left < 20) {
                $(".op-frame.active").css({
                    "left": "20px"
                })
            }
            if ($(".op-frame.active").position().top < 50) {
                $(".op-frame.active").css({
                    "top": "50px"
                })
            }
            if ($(".op-frame.active").width() > signaturePad.canvas.width - 40) {
                $(".op-frame.active").css({
                    "left": "20px",
                    "width": (signaturePad.canvas.width - 40) + "px"
                })
            }
            if ($(".op-frame.active").height() > signaturePad.canvas.height - 70) {
                $(".op-frame.active").css({
                    "top": "50px",
                    "height": (signaturePad.canvas.height - 40) + "px"
                })
            }
            textAreaData.left = $(".op-frame.active").position().left;
            textAreaData.top = $(".op-frame.active").position().top;
            textAreaData.width = $(".op-frame.active").width();
            textAreaData.height = $(".op-frame.active").height();
            if ($(".saveText").length != 1) {
                var op_frame_width = $('.op-frame.active').width();
                $(".op-frame.active").append("<div class='saveText' style='left:" + (op_frame_width - 50) / 2 + "px'>" +
                    '<i class="arrow" style=""></i>' +
                    "<input type='button' value='删除' onclick='deleteTextArea(this)'>" +
                    "</div>");
            }

        }
    });

}

function deleteTextArea(e) {
    pad._drawStatus[pad.level].pop()
    $(e).parent().parent().remove();
}

function uploadImage(etwas) {
    console.log(signaturePad)
}
