import Locate = require("esri/widgets/Locate");
import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
import mapconfig = require("./config");
import { Point } from "esri/geometry";
class MapEditor {
    private app: Framework7;
    public view: MapView;
    private locateView: Locate
    constructor(options: {
        map: Map, app: Framework7
    }) {
        this.app = options.app;
        this.view = new MapView({
            container:"viewDiv",
            map: options.map,
            zoom: mapconfig.zoom, // Sets the zoom level based on level of detail (LOD)
            center: mapconfig.center,
        });
        this.view.then(function(){
            console.log('hihi');
        })
        var node = document.createElement("i");
        node.classList.add("fa", "fa-map-pin")
        this.view.ui.add(node);

        this.app.onPageInit('map', () => {
            this.view.container = "viewDiv";
            this.setLongLat(this.view.center);
            this.getLocation();
        });
        this.initWidget();
        this.registerEvent();
    }
    private initWidget() {
        this.locateView = new Locate({
            view: this.view
        });
        this.view.ui.add(this.locateView, "top-left");
    }
    private registerEvent() {
        this.locateView.on('locate', (response) => {
            let coords = response.position.coords;
            this.setLongLat(coords);
        });
        this.view.on('drag', (evt) => {
            this.setLongLat(this.view.center);
        });
        this.view.on('mouse-wheel', (evt) => {
            this.setLongLat(this.view.center);
        });
    }
    private setLongLat(geometry) {
        let latitude = geometry.latitude.toFixed(4);
        let longitude = geometry.longitude.toFixed(4);
    }
    private getLocation() {
        Dom7('#getlocation').on('click', (evt) => {
            this.app.views[0].router.back();
        });
    }
    public refresh() {
        this.view.goTo(<__esri.MapViewGoToTarget>{
            center: mapconfig.center, zoom: mapconfig.zoom
        })
    }

}
export = MapEditor;