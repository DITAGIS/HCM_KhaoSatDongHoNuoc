define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/geometryEngine",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/SpatialReference"

], function (domConstruct, domClass, dom, on,
    Graphic, GraphicsLayer, Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, geometryEngineAsync, SpatialReference) {

        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    position: "top-right",
                    distanceBuffer: 50,
                    icon: "esri-icon-map-pin",
                    title: 'Đo khoảng cách'
                };

                if (options && typeof options === 'object') {
                    for (let index in options) {
                        this.options[index] = options[index] || this.options[index];
                    }
                }


                this.points = [];
                this.statusDraw = false;
                this.initWidget();

            }
            initWidget() {
                this.divDistance = domConstruct.create('div', {
                    id: "dtg-wget-distance",
                    class: "esri-widget esri-widget-button",
                    title: this.options.title
                });
                this.spanComponent = domConstruct.create('span', {
                    class: this.options.icon
                })
                domConstruct.place(this.spanComponent, this.divDistance);
                domConstruct.place(this.divDistance, document.body);

                this.view.ui.add(dom.byId('dtg-wget-distance'), this.options.position);
                on(this.divDistance, "click", (evt) => {
                    this.clickHandler(evt);
                });
            }

            clickHandler(evt) {
                this.changeStatusDraw();
                if (this.statusDraw) {
                    this.clickLineDistanceEvent = on(this.view, 'click', (evt) => {
                        this.clickLineDistanceFunc(evt);
                    });
                    this.moveLineEvent = on(this.view, 'pointer-move', (evt) => {
                        this.moveLineFunc(evt);
                    });
                    this.drawingCompleteDoubleClickClick = on(this.view, 'double-click', (evt) => {
                        this.drawingCompleteDoubleClickFunc(evt);
                    })

                }
                else {
                    if (this.clickLineDistanceEvent) {
                        this.clickLineDistanceEvent.remove();
                        this.clickLineDistanceEvent = null;
                    }
                    if (this.moveLineEvent) {
                        this.moveLineEvent.remove();
                        this.moveLineEvent = null;
                    }
                    for (let point of this.points) {
                        this.view.graphics.remove(point);
                    }
                    this.points = [];
                }

            }
            moveLineFunc(evt) {
                if (this.preMoveLine)
                    this.view.graphics.remove(this.preMoveLine);
                let screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                let pointcenter = this.view.toMap(screenCoors);
                if (this.points.length > 0) {
                    if (this.preMoveLine) {
                        this.view.graphics.remove(this.preMoveLine);
                    }
                    let line = new Polyline({
                        paths: [
                            [this.points[this.points.length - 1].geometry.x, this.points[this.points.length - 1].geometry.y],
                            [pointcenter.x, pointcenter.y]
                        ],
                        spatialReference: pointcenter.spatialReference
                    });
                    let moveLine = new Graphic({
                        geometry: line,
                        symbol: new SimpleLineSymbol()
                    });
                    this.preMoveLine = moveLine;
                    this.view.graphics.add(moveLine);
                }

            }
            async checkHittest(evt) {
                let screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                var res = await this.view.hitTest(screenCoors);
                var pointcenter;
                if (res.results.length === 2)
                    pointcenter = res.results[1].graphic.geometry;
                else
                    pointcenter = this.view.toMap(screenCoors);
                return pointcenter;
            }
            async clickLineDistanceFunc(evt) {
                evt.stopPropagation();
                let screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                //nếu có chế độ snap
                if (this.view.snapping) {
                    //nếu có nhấn key thì chạy hitest
                    if (this.view.snapping.isKeyPress()) {
                        var pointcenter = await this.checkHittest(evt);
                        this.calculate(pointcenter);

                    }
                    //không thì lấy điểm screenCoors
                    else {
                        this.calculate(this.view.toMap(screenCoors));
                    }

                } else {
                    this.calculate(this.view.toMap(screenCoors));
                }
            }
            async drawingCompleteDoubleClickFunc(evt) {
                let paths = [];
                for (let point of this.points) {
                    paths.push([point.geometry.x, point.geometry.y]);
                }
                let line = new Polyline({
                    paths: paths,
                    spatialReference: new SpatialReference(102100)
                });
                var distance = await geometryEngineAsync.geodesicLength(line, 'meters');
                //làm tròn
                distance = Math.round(distance * 10000) / 10000;
                console.log(distance);
                // var linedistance = new LineDistance();
                // if (this.points.length >= 2) {
                //     for (let i = 0; i < this.points.length - 1; i++) {
                //         let distance = linedistance.distance([this.points[i], this.points[i + 1]]);
                //         console.log(distance);
                //     }
                // }
            }
            calculate(pointcenter) {
                if (this.prePolylineGraphic){}
                    this.view.graphics.remove(this.prePolylineGraphic);
                var pointD = new Graphic({
                    geometry: pointcenter,
                    symbol: new SimpleMarkerSymbol({
                        color: [0, 0, 0],
                        size: 4
                    })
                });
                this.points.push(pointD);
                this.view.graphics.add(pointD);
                let paths = [];
                for (let point of this.points) {
                    paths.push([point.geometry.x, point.geometry.y]);
                }
                let line = new Polyline({
                    paths: paths,
                    spatialReference: pointcenter.spatialReference
                });
                let polylineGraphic = new Graphic({
                    geometry: line,
                    symbol: new SimpleLineSymbol()
                });
                this.view.graphics.add(polylineGraphic);
                this.prePolylineGraphic = polylineGraphic;
                if (this.points.length === -2) {
                    this.moveLineEvent.remove();
                    let line = new Polyline({
                        paths: [
                            [this.points[0].geometry.x, this.points[0].geometry.y],
                            [this.points[1].geometry.x, this.points[1].geometry.y]
                        ],
                        spatialReference: pointcenter.spatialReference
                    });
                    let moveLine = new Graphic({
                        geometry: line,
                        symbol: new SimpleLineSymbol()
                    });
                    this.view.graphics.add(moveLine);
                    this.preMoveLine = moveLine;
                    geometryEngineAsync.distance(this.points[0].geometry, pointD.geometry, "meters").then((res) => {
                        this.distance = Math.round(res * 1000) / 1000;
                        alert(this.distance);
                        this.changeStatusDraw();
                        for (let point of this.points) {
                            this.view.graphics.remove(point);
                        }
                        this.points = [];
                        this.clickLineDistanceEvent.remove();
                    });
                };
            }



            changeStatusDraw() {
                if (!this.statusDraw) {
                    domClass.add(this.spanComponent, 'esri-icon-directions');
                    domClass.remove(this.spanComponent, 'esri-icon-map-pin');
                    this.statusDraw = true;
                } else {
                    domClass.add(this.spanComponent, 'esri-icon-map-pin');
                    domClass.remove(this.spanComponent, 'esri-icon-directions');
                    if (this.preMoveLine)
                        this.view.graphics.remove(this.preMoveLine);
                    this.statusDraw = false;
                }

            }




        }
    });