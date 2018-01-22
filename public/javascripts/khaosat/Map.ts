var $ = Dom7;
import Locate = require("esri/widgets/Locate");
import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
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
    private initWidget() {
        var node = document.createElement("i");
        node.classList.add("esri-icon-map-pin")
        this.view.ui.add(node);
        this.locateView = new Locate({
            view: this.view
        });
        this.view.ui.move("zoom", "bottom-right");
        this.view.ui.add(this.locateView, "bottom-right");
    }
    private registerEvent() {
        this.view.watch("center", function (oldVal, newVal) {
            $(".long").text(newVal.longitude.toFixed(4) + "")
            $(".lat").text(newVal.latitude.toFixed(4) + "");
        })
       
    }

}
export = MapEditor;