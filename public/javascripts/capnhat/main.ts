import Map = require("esri/Map");
import FeatureLayer = require("esri/layers/FeatureLayer")
import MapView = require("esri/views/MapView");
import Graphic = require("esri/Graphic");
import Locate = require("esri/widgets/Locate");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import MapEditor = require('./Map');
import mapconfig = require('../config');

import esriRequest = require("esri/request");
import { Dom7 } from "Dom7";
var user;
var map, miniView: MapView, mapEditor: MapEditor;
// esriRequest('/session', {
//   method: 'post'
// }).then(function (esriRes) {
//   user = esriRes.data;
// })
var myApp: Framework7, mainView: Framework7.View, $$ = Dom7;
initMobile();
map = new Map({
  basemap: "osm"
});
miniView = new MapView({
  container: "viewDiv",
  map: map,zoom:mapconfig.zoom,center:mapconfig.center
});
miniView.ui.empty("top-left");
var node = document.createElement("i");
node.classList.add("fa", "fa-map-pin")
miniView.ui.add(node);

var layer = new FeatureLayer({
  minScale: 30000,
  id:"mainLayer",
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
})
function initMobile() {
  myApp = new Framework7();
  // Add view
}