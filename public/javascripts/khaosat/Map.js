define(["require", "exports", "esri/widgets/Locate", "esri/views/MapView", "../config"], function (require, exports, Locate, MapView, mapconfig) {
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
                constraints: {
                    rotationEnabled: false,
                },
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
