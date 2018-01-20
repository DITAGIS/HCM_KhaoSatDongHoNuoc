define(["require", "exports", "esri/widgets/Locate", "esri/views/MapView", "./config", "esri/Graphic"], function (require, exports, Locate, MapView, mapconfig, Graphic) {
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
            this.view.popup.on("trigger-action", (e) => {
                if (e.action.id === "cap-nhat-vi-tri") {
                    this.updateGeometry();
                }
            });
            var node = document.createElement("i");
            node.classList.add("fa", "fa-map-pin");
            this.view.ui.add(node);
            this.app.onPageInit('map', () => {
                this.view.container = "viewDiv";
                this.setLongLat(this.view.center);
                this.registerEvent();
            });
            this.initWidget();
        }
        updateGeometry() {
            Dom7('#cap-nhat-vi-tri').removeClass("hidden");
            Dom7('#huy-cap-nhat-vi-tri').removeClass("hidden");
            Dom7('#getlocation').addClass("hidden");
            this.app.addNotification({
                message: "Chọn vị trí và nhấn nút cập nhật",
                hold: 3000
            });
            this.view.popup.close();
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
            Dom7('#getlocation').on('click', (evt) => {
                this.app.views[0].router.back();
            });
            Dom7('#huy-cap-nhat-vi-tri').on('click', (evt) => {
                Dom7('#cap-nhat-vi-tri').addClass("hidden");
                Dom7('#huy-cap-nhat-vi-tri').addClass("hidden");
                Dom7('#getlocation').removeClass("hidden");
            });
            Dom7('#cap-nhat-vi-tri').on('click', (evt) => {
                let objectId = this.view.popup.selectedFeature.attributes.OBJECTID;
                this.app.showPreloader("Đang cập nhật vị trí...");
                let layer = this.view.map.findLayerById("mainLayer");
                layer.applyEdits({
                    updateFeatures: [new Graphic({ attributes: { objectId: objectId }, geometry: this.view.center })]
                }).then(e => {
                    let error = e.updateFeatureResults[0].error;
                    let message = error ? "Có lỗi xảy ra trong quá trình xử lý" : "Cập nhật thành công";
                    this.app.hidePreloader();
                    this.app.addNotification({
                        message: message,
                        hold: 3000
                    });
                });
            });
        }
        setLongLat(geometry) {
            let latitude = geometry.latitude.toFixed(4);
            let longitude = geometry.longitude.toFixed(4);
        }
        refresh() {
            this.view.goTo({
                center: mapconfig.center, zoom: mapconfig.zoom
            });
        }
    }
    return MapEditor;
});
