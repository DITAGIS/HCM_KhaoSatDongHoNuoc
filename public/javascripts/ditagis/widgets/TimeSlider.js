define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",
    "esri/core/watchUtils",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Expand",
    'css!ditagis/widgets/TimeSlider.css'

], function (domConstruct, domClass, dom, on,
    watchUtils, GraphicsLayer,
    Expand) {

        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    position: "top-right",
                    distanceBuffer: 50,
                    icon: "esri-icon-time-clock",
                    title: 'Thời gian sâu bệnh',
                    step: 1//MONTH
                };
this.DOM = {
    container:null
}
                if (options && typeof options === 'object') {
                    for (let index in options) {
                        this.options[index] = options[index] || this.options[index];
                    }
                }

            }
            startup() {
                try {
                    if (!this.isStartup) {
                        this.view.map.findLayerById(constName.SAUBENH).then((layer) => {
                            this.view.whenLayerView(layer).then(layerView => {
                                this.layerView = layerView;
                                this.watch = layerView.watch('updating', val => {
                                    if (!val && !this.graphics) {  // wait for the layer view to finish updating
                                        if (!this.DOM.container) {
                                            this.initView();
                                            this.view.ui.add(this.expand, this.options.position);
                                        }
                                        layerView.queryFeatures().then(results => {
                                            this.graphics = results;
                                            this.watch.remove();
                                            delete this.watch;
                                        });
                                    }
                                })
                            })
                        })
                        this.isStartup = true;
                    }
                } catch (error) {
                    throw error;
                }

            }
            destroy() {
                if (this.isStartup) {
                    this.view.ui.remove(this.expand);
                    delete this.DOM;
                    delete this.expand;
                    this.isStartup = false;
                }
            }
            get timeStart() {
                return document.getElementById('timeslider-start');
            }
            get timeEnd() {
                return document.getElementById('timeslider-end');
            }
            initView() {
                try {
                    this.DOM = {};
                    this.DOM.container = domConstruct.create('div', {
                        id: "dtg-wget-timeslider",
                        class: "esri-widget dtg-wget-timeslider",
                        title: this.options.title
                    });
                    this.DOM.slider = domConstruct.toDom(` <div id="timeslider-input"></div>`);

                    domConstruct.place(this.DOM.slider, this.DOM.container);
                    domConstruct.place(this.DOM.container, document.body);
                    let current = new Date();
                    let defaultMin = new Date(current.getFullYear(), current.getMonth() - this.options.step, current.getDate());
                    let defaultValues = {
                        min: defaultMin,
                        max: current
                    }
                    this.timeSlider = $("#timeslider-input").dateRangeSlider({
                        bounds: {
                            min: new Date(2016, 0, 1),
                            max: current
                        },
                        defaultValues: defaultValues,
                        formatter: function (value) {
                            var days = value.getDate(),
                                month = value.getMonth() + 1,
                                year = value.getFullYear();
                            return days + "/" + month + "/" + year;;
                        }
                    });


                    // Preferred method
                    this.timeSlider.on("valuesChanging", (e, data) => {
                        const min = data.values.min.getTime(),
                            max = data.values.max.getTime();
                        // const graphics = 
                        this.layerView.featuresView.graphics.removeAll();
                        this.graphics.map((item, i) => {
                            const attributes = item.attributes,
                                value = attributes['NgayXayRa'];

                            if (value && value >= min && value <= max) {
                                this.layerView.featuresView.graphics.add(item);
                            }
                        });
                    });
                    this.expand = new Expand({
                        expandIconClass: this.options.icon,
                        expandTooltip: this.options.title,
                        view: this.view,
                        content: this.DOM.container
                    });
                } catch (error) {
                    throw error;
                }
            }
            clickHandler(evt) {

            }

        }
    });