define(["require", "exports", "esri/widgets/Locate", "esri/views/MapView", "esri/widgets/Search", "esri/layers/FeatureLayer", "../config"], function (require, exports, Locate, MapView, Search, FeatureLayer, mapconfig) {
    "use strict";
    var $ = Dom7;
    class MapEditor {
        constructor(options) {
            this.app = options.app;
            this.view = new MapView({
                container: "viewDiv",
                map: options.map,
                zoom: mapconfig.zoom,
                center: mapconfig.center,
                popup: {
                    dockEnabled: false, dockOptions: {
                        buttonEnabled: false
                    }
                }
            });
            this.initWidget();
            this.registerEvent();
        }
        initWidget() {
            var node = document.createElement("i");
            node.classList.add("esri-icon-map-pin");
            this.view.ui.add(node);
            this.locateView = new Locate({
                view: this.view
            });
            this.view.ui.move("zoom", "bottom-right");
            this.view.ui.add(this.locateView, "bottom-right");
            var searchWidget = new Search({
                view: this.view,
                allPlaceholder: "Nhập nội dung tìm kiếm",
                sources: [{
                        featureLayer: this.view.map.findLayerById(mapconfig.KSDongHoNuocLayer.id),
                        searchFields: ["MADANHBO"],
                        displayField: "MADANHBO",
                        exactMatch: false,
                        outFields: ["*"],
                        resultGraphicEnabled: false,
                        zoomScale: 1000,
                        name: "Đồng hồ nước",
                        placeholder: "Tìm kiếm mã danh bộ",
                    }, {
                        featureLayer: new FeatureLayer({ url: "https://ditagis.com:6443/arcgis/rest/services/HoChiMinh/KhaoSatDongHoNuoc_Nen/MapServer/0" }),
                        searchFields: ["DBDongHoNuoc"],
                        displayField: "DBDongHoNuoc",
                        exactMatch: false,
                        outFields: ["DBDongHoNuoc"],
                        name: "Đồng hồ nước Q9",
                        zoomScale: 1000,
                        popupOpenOnSelect: false,
                        placeholder: "Tìm kiếm mã danh bộ",
                    }]
            });
            this.view.ui.add(searchWidget, "top-right");
        }
        registerEvent() {
            this.view.watch("center", function (oldVal, newVal) {
                $(".long").text(newVal.longitude.toFixed(4) + "");
                $(".lat").text(newVal.latitude.toFixed(4) + "");
            });
        }
    }
    return MapEditor;
});
