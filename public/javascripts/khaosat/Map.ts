var $ = Dom7;
import Locate = require("esri/widgets/Locate");
import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
import Search = require("esri/widgets/Search");
import FeatureLayer = require("esri/layers/FeatureLayer");
import mapconfig = require("../config");
import { Point } from "esri/geometry";
import Graphic = require("esri/Graphic");
class MapEditor {
  private app;
  public view: MapView;
  private locateView: Locate;
  constructor(options: {
    map: Map, app
  }) {
    this.app = options.app;
    this.view = new MapView({
      container: "viewDiv",
      map: options.map,
      zoom: mapconfig.zoom, // Sets the zoom level based on level of detail (LOD)
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
  private initWidget() {
    var node = document.createElement("i");
    node.classList.add("esri-icon-map-pin")
    this.view.ui.add(node);
    this.locateView = new Locate({
      view: this.view
    });
    this.view.ui.move("zoom", "bottom-right");
    this.view.ui.add(this.locateView, "bottom-right");
    var searchWidget = new Search({
      view: this.view,
      allPlaceholder: "Nhập nội dung tìm kiếm",
      sources: [<__esri.FeatureLayerSource>{
        featureLayer: this.view.map.findLayerById(mapconfig.KSDongHoNuocLayer.id),
        searchFields: ["MADANHBO"],
        displayField: "MADANHBO",
        exactMatch: false,
        outFields: ["*"],
        resultGraphicEnabled: false,
        zoomScale: 1000,
        name: "Đồng hồ nước",
        placeholder: "Tìm kiếm mã danh bộ",
      }, <__esri.FeatureLayerSource>{
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
    // Add the search widget to the top left corner of the view
    this.view.ui.add(searchWidget, "top-right");
  }
  private registerEvent() {
    this.view.watch("center", function (oldVal, newVal) {
      $(".long").text(newVal.longitude.toFixed(4) + "")
      $(".lat").text(newVal.latitude.toFixed(4) + "");
    })

  }

}
export = MapEditor;