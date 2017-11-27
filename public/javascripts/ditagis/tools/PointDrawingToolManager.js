/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ tùy chọn, hướng, giao hội)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
    "ditagis/tools/SimpleDrawPoint",
    // "ditagis/tools/BufferDrawPoint",
    // "ditagis/tools/ConjunctionDrawPoint",
    "ditagis/editing/PointEditing",
    "ditagis/classes/EventListener",
], function (SimpleDrawPoint, /*BufferDrawPoint, ConjunctionDrawPoint,*/PointEditing,
    EventListener) {
        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this._drawLayer = null;
                this.systemVariable = view.systemVariable;
                // // Chức năng vẽ Khoảng cách- Hướng
                // this.bufferDrawPoint = new BufferDrawPoint(this.view);
                // // Chức năng vẽ giao hội
                // this.conjunctionDrawPoint = new ConjunctionDrawPoint(this.view);
                // Chức năng vẽ tùy chọn
                this.simpleDrawPoint = new SimpleDrawPoint(this.view);
                this.eventListener = new EventListener(this);
                this.pointEditing = new PointEditing(this.view);
                this.registerEvent();
            }
            addFeature(graphic) {
                let accept = confirm('Chắc chắn muốn thêm?');
                if (!accept) return;
                this.pointEditing.draw(this.drawLayer, graphic);
            }
            registerEvent() {
                // this.bufferDrawPoint.on('draw-finish', (graphic) => {
                //     this.eventListener.fire('draw-finish', {
                //         graphic: graphic,
                //         method: 'buffer'
                //     });
                //     this.addFeature(graphic);
                // })
                // this.conjunctionDrawPoint.on('draw-finish', (graphic) => {
                //     this.eventListener.fire('draw-finish', {
                //         graphic: graphic,
                //         method: 'arcsegment'
                //     });
                //     this.addFeature(graphic);
                // })
                this.simpleDrawPoint.on('draw-finish', (graphic) => {
                    this.eventListener.fire('draw-finish', {
                        graphic: graphic,
                        method: 'simple'
                    });
                    this.addFeature(graphic);
                })
            }
            set drawLayer(val) {
                this._drawLayer = val;
            }
            get drawLayer() {
                return this._drawLayer;
            }
            // Vẽ Tùy chọn
            drawSimple() {
                this.clearEvents();
                this.simpleDrawPoint.draw(this.drawLayer);
            }
            // Vẽ Khoảng cách - hướng
            // drawBuffer() {
            //     this.clearEvents();
            //     this.bufferDrawPoint.draw(this.drawLayer);
            // }
            // // Vẽ giao hội
            // drawConjunction() {
            //     this.clearEvents();
            //     this.conjunctionDrawPoint.draw(this.drawLayer);
            // }
            // Xóa các sự kiện tồn tại khi gọi chức năng khác
            clearEvents() {
                // this.bufferDrawPoint.clearEvents();
                this.simpleDrawPoint.clearEvents();
                // this.conjunctionDrawPoint.clearEvents();
            }

        }
    });