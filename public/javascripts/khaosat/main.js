define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/views/MapView", "./Map", "esri/Graphic", "../config"], function (require, exports, Map, FeatureLayer, MapView, MapEditor, Graphic, mapconfig) {
    "use strict";
    var $ = Dom7;
    class KhaoSatPage {
        constructor(options) {
            this.app = options.app;
        }
        initWidget() {
            this.view.ui.empty("top-left");
            let pin = document.createElement("i");
            pin.classList.add("esri-icon-map-pin");
            this.view.ui.add(pin);
        }
        initMapView() {
            this.map = new Map({
                basemap: "osm"
            });
            this.view = new MapView({
                container: "miniView", constraints: {
                    rotationEnabled: false,
                },
                map: this.map, zoom: mapconfig.zoom, center: mapconfig.center
            });
        }
        initLayer() {
            this.layer = new FeatureLayer({
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
            this.map.add(this.layer);
            this.layer.then(_ => {
                let container = document.getElementById("form-container");
                this.layer.fields.forEach((f) => {
                    if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap")
                        return;
                    let input;
                    if (f.domain) {
                        input = document.createElement("select");
                        let option = document.createElement('option');
                        option.innerText = "Chọn giá trị";
                        option.value = null;
                        input.appendChild(option);
                        f.domain.codedValues.forEach(function (domain) {
                            let option = document.createElement('option');
                            option.innerText = domain.name;
                            option.value = domain.code + "";
                            input.appendChild(option);
                        });
                    }
                    else {
                        let type = f.type === "string" ? "text" : "number";
                        if (f.name === "MaDanhBo")
                            type = "number";
                        input = document.createElement("input");
                        input.setAttribute("type", type);
                        input.setAttribute("name", f.name);
                        input.classList.add("fvalue");
                    }
                    let li = document.createElement("li");
                    li.innerHTML = `
          <div class="item-content item-input">
            <div class="item-inner">
              <div class="item-title item-label">${f.alias}</div>
              <div class="item-input-wrap">
              ${input.outerHTML}
              </div>
            </div>
          </div>
        `;
                    container.appendChild(li);
                });
                this.app.preloader.hide();
            });
        }
        registerEvent() {
            var route = () => {
                this.app.popup.open(".popup-map");
            };
            this.view.on('click', (evt) => {
                route();
            });
            this.view.on('drag', (evt) => {
                route();
            });
            $("#btnSubmit").click(this.applyEditFeatures.bind(this));
        }
        initMapEditor() {
            this.mapEditor = new MapEditor({ map: this.map, app: this.app });
            this.mapEditor.view.watch("center", (oldVal, newVal) => {
                this.view.center = this.mapEditor.view.center;
            });
        }
        run() {
            this.app.preloader.show();
            this.initMapView();
            this.initWidget();
            this.initLayer();
            this.registerEvent();
            this.initMapEditor();
            this.layer.then(_ => {
                this.app.preloader.hide();
            });
        }
        clearAttributes() {
            let clearData = {};
            this.layer.fields.forEach(function (f) {
                clearData[f.name] = f.type === "string" ? "" : -1;
            });
            this.app.form.fillFromData("#infoForm", clearData);
        }
        applyEditFeatures() {
            this.app.preloader.show("Đang cập nhật...");
            var attributes = {};
            var formAttr = this.app.form.convertToData('#infoForm');
            if (!formAttr.MaDanhBo || (this.view.center.x < 0 || this.view.center.y < 0)) {
                let message = 'Vui lòng điền đầy đủ các thông tin trên';
                this.app.toast.create({
                    text: message,
                    closeTimeout: 3000,
                }).open();
                return;
            }
            this.layer.fields.forEach(function (f) {
                if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap")
                    return;
                attributes[f.name] = formAttr[f.name];
            });
            attributes['ThoiGianNhap'] = new Date().getTime();
            attributes['NguoiNhap'] = "test";
            this.layer.applyEdits({
                addFeatures: [new Graphic({
                        attributes: attributes, geometry: this.view.center
                    })]
            }).then(result => {
                var objectId = result.addFeatureResults[0].objectId;
                let message;
                if (objectId) {
                    this.clearAttributes();
                    message = "Cập nhật thành công.";
                }
                else {
                    message = 'Có lỗi xảy ra trong quá trình thực hiện, vui lòng thử lại.';
                }
                if (message)
                    this.app.toast.create({
                        text: message,
                        closeTimeout: 3000,
                    }).open();
                this.app.preloader.hide()();
            });
        }
    }
    return KhaoSatPage;
});
