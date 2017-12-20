/**
 * Phần này quan trọng không được xóa
 */
const constName = {
  BASEMAP: 'dulieunen',
  INDEX_HANHCHINHXA: 4,
  INDEX_HANHCHINHHUYEN: 5,
  DONG_HO: 0
}
//  var socket = io();
require([
  "ditagis/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/OpenStreetMapLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/WebTileLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Expand",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Search",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/request",
  "ditagis/classes/SystemStatusObject",

  "ditagis/widgets/User",
  "ditagis/widgets/LayerEditor",
  "ditagis/widgets/Popup",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/sniff",
  "css!ditagis/styling/dtg-map.css"


], function (mapconfigs, Map, MapView, OpenStreetMapLayer, MapImageLayer, WebTileLayer, FeatureLayer,
  Expand, Locate, LayerList, Search,
  QueryTask, Query, esriRequest,
  SystemStatusObject,
  UserWidget, LayerEditor, Popup,
  on, domConstruct, has
) {
  'use strict';
  try {
    esriRequest('/session', {
      method: 'post'
    }).then(function (esriRes) {
      var systemVariable = new SystemStatusObject();
      systemVariable.user = esriRes.data
      var map = new Map({
        // basemap: 'osm'
      });


      var view = new MapView({
        container: "map", // Reference to the scene div created in step 5
        map: map, // Reference to the map object created before the scene
        center: mapconfigs.center,
        zoom: mapconfigs.zoom
      });
      view.systemVariable = systemVariable;
      const initBaseMap = () => {
        let bmCfg = mapconfigs.basemap; //basemap config
        let worldImage = new WebTileLayer({
          id: 'worldimagery',
          urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
          title: 'Ảnh vệ tinh',
        })
        let osm = new OpenStreetMapLayer({
          title: 'Open Street Map',
          id: 'osm',
          visible: false,
        })
        map.addMany([osm, worldImage])

        function watchVisible(newValue, oldValue, property, target) {
          if (newValue) {
            switch (target) {
              case osm:
                worldImage.visible = !newValue;
                break;
              case worldImage:
                osm.visible = !newValue;
                break;
            }
          }
        }
        osm.watch('visible', watchVisible)
        worldImage.watch('visible', watchVisible)
      }
      const initFeatureLayers = () => {
        /**
         * Lấy attachments của feature layer
         */
        FeatureLayer.prototype.getAttachments = function (id) {
          return new Promise((resolve, reject) => {
            var url = this.url + "/" + this.layerId + "/" + id;
            esriRequest(url + "/attachments?f=json", {
              responseType: 'json',
              method: 'get'
            }).then(result => {
              resolve(result.data || null);
            });
          });
        }
        let fl = new FeatureLayer({
          id:constName.DONG_HO,
          url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/0',
          outFields: ['*'],
          permission: {
            view: true,
            create: true,
            delete: true,
            edit: true
          }
        });
        map.add(fl);
      }
      const initWidgets = () => {
        new UserWidget(view).startup()
        view.ui.move(["zoom"], "bottom-right");
        //LAYER LIST
        view.ui.add(new Expand({
          expandIconClass: "esri-icon-layer-list",
          view: view,
          content: new LayerList({
            container: document.createElement("div"),
            view: view
          })
        }), "top-left");


        //LOCATE
        view.ui.add(new Locate({
          view: view
        }), "top-left");
        //neu khong phai la thiet bi di dong

        // Widget Search Features //
        var searchWidget = new Search({
          view: view,
          allPlaceholder: "Nhập nội dung tìm kiếm",
          sources: [{
            featureLayer: map.findLayerById(constName.DONG_HO),
            searchFields: ["MADANHBO"],
            displayField: "MADANHBO",
            exactMatch: false,
            outFields: ["*"],
            name: "Đồng hồ nước",
            placeholder: "Tìm kiếm mã danh bộ",
          }]
        });
        // Add the search widget to the top left corner of the view
        view.ui.add(searchWidget, {
          position: "top-right"
        });
        /**
         * Layer Editor
         */
        var layerEditor = new LayerEditor(view);
        layerEditor.startup();



        var popup = new Popup(view);
        popup.startup();


      }

      initBaseMap();
      initFeatureLayers();
      initWidgets();
      Loader.hide();
    })
  } catch (error) {
    console.log(error);
  }


});