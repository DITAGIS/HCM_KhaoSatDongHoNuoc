define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    "ditagis/tools/PointDrawingToolManager",
    'css!ditagis/widgets/LayerEditor.css'

], function (on,
    domConstruct, domClass, dom,
    Expand,
    PointDrawingToolManager
) {
        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this.options = {
                    position: "top-right",
                    icon: 'esri-icon-layers',
                    title: 'Biên tập dữ liệu'
                }
                for (let i in options) {
                    this.options[i] = options[i];
                }
                this.isStartup = false;

                this.initView();
                this.drawManager = new PointDrawingToolManager(this.view);

            }
            get selectedFeature() {
                return this.systemVariable.selectedFeature;
            }
            set selectedFeature(value) {
                this.drawManager.drawLayer = value;
                this.systemVariable.selectedFeature = value;
            }
            startup() {
                if (!this.isStartup) {
                    this.keydownEvent = this.view.on('key-down', evt => {
                        const key = evt.key;
                        if (key === 'p') {
                            this.expand.toggle();
                        }
                    })
                    this.view.ui.add(this.expand, this.options.position);
                    this.isStartup = true;
                }
            }
            destroy() {
                if (this.isStartup) {
                    if (this.keydownEvent)
                        this.keydownEvent.remove();
                    this.drawManager.clearEvents();
                    this.view.ui.remove(this.expand);
                    this.isStartup = false;
                }
            }
            initView() {
                try {
                    this.container = domConstruct.create('div', {
                        class: 'esri-widget ditagis-widget-layer-editor'
                    });
                    let ul = domConstruct.create('ul', null, this.container);

                    this.view.map.layers.map(layer => {
                        layer.then(() => {
                            if (layer.type == 'feature') {
                                const permission = layer.permission;
                                if (permission && permission.create) {
                                    const symbol = layer.renderer.symbol || layer.renderer.uniqueValueInfos[0].symbol;
                                    let layerSymbols = [];

                                    //tạo tiêu đề
                                    domConstruct.create('li', {
                                        innerHTML: layer.title,
                                        class: 'title'
                                    }, ul)
                                    //nếu như layer không hiển thị theo domain
                                    if (layer.renderer.symbol) {
                                        const img = symbol.url;
                                        let contentSymbol;
                                        if (img) {
                                            contentSymbol = `<img src='${img}'></img>`;
                                        } else {
                                            contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                                    <path 
                                    fill="none" 
                                    fill-opacity="0" 
                                    stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                                    stroke-opacity="1" 
                                    stroke-width="1.3333333333333333" 
                                    path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                                   transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                                   </path>
                                   </svg>`
                                        }
                                        layerSymbols.push({
                                            symbol: contentSymbol
                                        })
                                    }
                                    //hiển thị theo symbol
                                    else {
                                        let contentSymbol;
                                        for (let icon of layer.renderer.uniqueValueInfos) {
                                            let symbol = icon.symbol;
                                            //nếu là điểm
                                            if (symbol.type === "simple-marker-symbol") {
                                                // console.log(icon);
                                                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                                    <circle fill="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                                    fill-opacity="1" 
                                    stroke="rgb(0, 0, 0)" 
                                    stroke-opacity="1" 
                                    stroke-width="1.3333333333333333" 
                                    x="0" cy="0" r="2.6666666666666665" 
                                    transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                                    </circle>
                                    </svg>`
                                            }
                                            //nếu là đường 
                                            else if (symbol.type === "simple-line-symbol") {
                                                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                                    <path 
                                    fill="none" 
                                    fill-opacity="0" 
                                    stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                                    stroke-opacity="1" 
                                    stroke-width="1.3333333333333333" 
                                    path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                                   transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                                   </path>
                                   </svg>`
                                            }
                                            //nếu như có hình ảnh thì hiển thị hình ảnh
                                            else {
                                                const img = symbol.url;
                                                contentSymbol = `<img src='${img}'></img>`;
                                            }
                                            layerSymbols.push({
                                                symbol: contentSymbol,
                                                label: icon.label,
                                                value: icon.value
                                            })
                                        }
                                    }
                                    for (let symbolItem of layerSymbols) {
                                        const symbol = symbolItem.symbol,
                                            label = symbolItem.label,
                                            value = symbolItem.value;
                                        let li = domConstruct.create('li', {
                                            class: 'list-item'
                                        }, ul);
                                        let div = domConstruct.create('div', {
                                            class: 'item-container'
                                        }, li);
                                        let symbolContainer = domConstruct.create('div', {
                                            innerHTML: symbol
                                        }, div);
                                        //nếu có label
                                        if (label) {
                                            domConstruct.create('div', {
                                                innerHTML: label,
                                                class: 'icon-label'
                                            }, div);

                                        }
                                        on(li, "click", (evt) => {
                                            this.layerItemClickHandler(layer, value);
                                        });

                                    }
                                }
                            }
                        });
                    });

                    this.expand = new Expand({
                        expandIconClass: this.options.icon,
                        expandTooltip: this.options.title,
                        view: this.view,
                        content: this.container
                    });
                } catch (error) {
                    throw error;
                }
            }
            layerItemClickHandler(layer, value) {
                try {


                    const typeIdField = layer.renderer.field || layer.typeIdField;
                    if (value) {
                        layer.drawingAttributes = {};
                        layer.drawingAttributes[typeIdField] = value;
                    }
                    this.selectedFeature = layer;
                    switch (layer.geometryType) {
                        case 'point':
                            // this.pointDrawingTools.startup();
                            this.drawManager.drawSimple();
                            break;
                        default:
                            console.log("Chưa được liệt kê")
                            break;
                    }
                    this.expand.expanded = false;
                } catch (error) {
                    console.log(error);
                }
            }
        }
    });