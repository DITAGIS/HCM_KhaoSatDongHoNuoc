define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/views/MapView", "../config"], function (require, exports, Map, FeatureLayer, MapView, mapconfig) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var user;
    var map, miniView, mapEditor;
    var myApp, mainView, $$ = Dom7;
    initMobile();
    map = new Map({
        basemap: "osm"
    });
    miniView = new MapView({
        container: "viewDiv",
        map: map, zoom: mapconfig.zoom, center: mapconfig.center
    });
    miniView.ui.empty("top-left");
    var node = document.createElement("i");
    node.classList.add("fa", "fa-map-pin");
    miniView.ui.add(node);
    var layer = new FeatureLayer({
        minScale: 30000,
        id: "mainLayer",
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/0",
        outFields: ["*"],
        popupTemplate: {
            title: "Danh bộ: {MaDanhBo}",
            content: [
                {
                    type: "fields", fieldInfos: [{
                            fieldName: "DiaChi",
                            label: "Địa chỉ",
                        }, {
                            fieldName: "GhiChu", label: "Ghi chú"
                        }]
                }
            ],
        }
    });
    map.add(layer);
    layer.then(function () {
    });
    function initMobile() {
        myApp = new Framework7();
    }
});
