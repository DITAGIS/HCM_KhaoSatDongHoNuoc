define(["require", "exports", "esri/widgets/Locate", "esri/views/MapView", "./config"], function (require, exports, Locate, MapView, mapconfig) {
    "use strict";
    class MapEditor {
        constructor(options) {
            this.app = options.app;
            this.view = new MapView({
                container: "viewDiv",
                map: options.map,
                zoom: mapconfig.zoom,
                center: mapconfig.center,
            });
            this.view.then(function () {
                console.log('hihi');
            });
            var node = document.createElement("i");
            node.classList.add("fa", "fa-map-pin");
            this.view.ui.add(node);
            this.app.onPageInit('map', () => {
                this.view.container = "viewDiv";
                this.setLongLat(this.view.center);
                this.getLocation();
            });
            this.initWidget();
            this.registerEvent();
        }
        initWidget() {
            this.locateView = new Locate({
                view: this.view
            });
            this.view.ui.add(this.locateView, "top-left");
        }
        registerEvent() {
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
        setLongLat(geometry) {
            let latitude = geometry.latitude.toFixed(4);
            let longitude = geometry.longitude.toFixed(4);
        }
        getLocation() {
            Dom7('#getlocation').on('click', (evt) => {
                this.app.views[0].router.back();
            });
        }
        refresh() {
            this.view.goTo({
                center: mapconfig.center, zoom: mapconfig.zoom
            });
        }
    }
    return MapEditor;
});
