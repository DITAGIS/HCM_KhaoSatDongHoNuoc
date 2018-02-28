define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/views/MapView", "./Map", "esri/Graphic", "../config", "../ditagis/FeatureTable", "esri/layers/WebTileLayer", "esri/layers/MapImageLayer", "../config"], function (require, exports, Map, FeatureLayer, MapView, MapEditor, Graphic, mapconfig, FeatureTable, WebTileLayer, MapImageLayer, config) {
    "use strict";
    var $ = Dom7;
    class KhaoSatPage {
        constructor(options) {
            this.app = options.app;
            this.user = options.user;
        }
        initWidget() {
            this.view.ui.empty("top-left");
            let pin = document.createElement("i");
            pin.classList.add("esri-icon-map-pin");
            this.view.ui.add(pin);
        }
        initMapView() {
            this.map = new Map();
            let worldImage = new WebTileLayer({
                id: 'worldimagery',
                urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
                title: 'Ảnh vệ tinh',
            });
            this.map.add(worldImage);
            this.mapDHKHQ9 = new MapImageLayer({ url: config.DongHoKhachHang_Quan9_TongHopLayer.url });
            this.map.add(this.mapDHKHQ9);
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
                                    fieldName: "GhiChu", label: "Ghi chú", format: {
                                        stringFieldOption: "text-area"
                                    }
                                }, {
                                    fieldName: "NguoiNhap", label: "Người cập nhật"
                                }, {
                                    fieldName: "ThoiGianNhap", label: "Thời gian nhập", format: {
                                        dateFormat: "short-date-short-time"
                                    }
                                }
                            ]
                        }
                    ],
                }
            });
            this.table = new FeatureTable({ url: config.BangMaDanhBo.url, fieldID: "MaDanhBo" });
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
                        option.value = -1 + "";
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
                        input.classList.add("fvalue");
                    }
                    input.setAttribute("name", f.name);
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
            $("#btnSubmit").click(this.onSubmitClick.bind(this));
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
        isValidDanhBo(id) {
            return new Promise((resolve, reject) => {
                this.table.findById(id).then(function (results) {
                    if (results.features.length > 0)
                        resolve(results.features[0]);
                    else
                        resolve(null);
                });
            });
        }
        clearAttributes() {
            let clearData = {};
            this.layer.fields.forEach(function (f) {
                clearData[f.name] = f.type === "string" ? "" : -1;
            });
            this.app.form.fillFromData("#infoForm", clearData);
        }
        onSubmitClick() {
            var attributes = {};
            var formAttr = this.app.form.convertToData('#infoForm');
            if ((this.view.center.x < 0 || this.view.center.y < 0)) {
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
            attributes['NguoiNhap'] = this.user.Username;
            if (attributes['MaDanhBo']) {
                this.isValidDanhBo(attributes['MaDanhBo']).then(tblVal => {
                    const isValid = tblVal !== null;
                    if (isValid) {
                        this.applyEdit(attributes);
                        this.table.applyEdits({
                            deleteFeatures: [tblVal.attributes['OBJECTID']]
                        });
                    }
                    else {
                        this.app.dialog.alert('Không tồn tại mã danh bộ', "Thông báo");
                    }
                });
            }
            else {
                this.applyEdit(attributes);
            }
        }
        applyEdit(attributes) {
            this.app.preloader.show("Đang cập nhật...");
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
