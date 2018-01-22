define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/views/MapView", "esri/Graphic", "esri/widgets/Locate", "../config", "./List", "../ditagis/FeatureTable"], function (require, exports, Map, FeatureLayer, MapView, Graphic, Locate, mapconfig, ListTab, FeatureTable) {
    "use strict";
    var $ = Dom7;
    class CapNhatPage {
        constructor(options) {
            this.app = options.app;
            this.user = options.user;
        }
        initListTab() {
            this.listTab = new ListTab({ app: this.app, layer: this.layer, user: this.user });
        }
        initWidget() {
            this.view.ui.empty("top-left");
            this.centerPin = document.createElement("i");
            this.centerPin.classList.add("esri-icon-map-pin", "hidden");
            this.view.ui.add(this.centerPin);
            this.view.ui.add(new Locate({ view: this.view }), "bottom-right");
        }
        initMapView() {
            this.map = new Map({
                basemap: "osm"
            });
            this.view = new MapView({
                container: "viewDiv", constraints: {
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
                    actions: [{ id: "cap-nhat-vi-tri", title: "Cập nhật vị trí", className: "esri-icon-locate" },
                        { id: "cap-nhat-thuoc-tinh", title: "Cập nhật thuộc tính", className: "esri-icon-edit" },
                        { id: "xoa", title: "Xóa đối tượng", className: "esri-icon-erase" }]
                }
            });
            this.map.add(this.layer);
            this.table = new FeatureTable({ url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/1", fieldID: "MaDanhBo" });
        }
        registerEvent() {
            this.view.popup.on("trigger-action", (e) => {
                const attributes = this.view.popup.selectedFeature.attributes;
                if (attributes['NguoiNhap'] !== this.user.Username) {
                    this.app.dialog.alert("Không có quyền truy cập", "Thông báo");
                    return;
                }
                if (e.action.id === "cap-nhat-vi-tri") {
                    this.updateGeometry();
                }
                else if (e.action.id === "cap-nhat-thuoc-tinh") {
                    this.updateAttributes();
                }
                else if (e.action.id === "xoa") {
                    this.deleteFeature();
                }
            });
            this.view.watch("center", function (oldVal, newVal) {
                $(".long").text(newVal.longitude.toFixed(4) + "");
                $(".lat").text(newVal.latitude.toFixed(4) + "");
            });
            $('#huy-cap-nhat-vi-tri').on('click', (evt) => {
                this.toggleCapNhatViTri();
            });
            $('#cap-nhat-vi-tri').on('click', (evt) => {
                let objectId = this.view.popup.selectedFeature.attributes.OBJECTID;
                this.app.preloader.show("Đang cập nhật vị trí...");
                let layer = this.view.map.findLayerById("mainLayer");
                layer.applyEdits({
                    updateFeatures: [new Graphic({ attributes: { objectId: objectId }, geometry: this.view.center })]
                }).then(e => {
                    let error = e.updateFeatureResults[0].error;
                    let message = error ? "Có lỗi xảy ra trong quá trình xử lý" : "Cập nhật thành công";
                    this.app.preloader.hide();
                    this.app.toast.create({
                        text: message,
                        closeTimeout: 3000,
                    }).open();
                    this.toggleCapNhatViTri();
                });
            });
            this.app.on("pageInit", (page) => {
                if (page.name === "cap-nhat/thuoc-tinh") {
                    this.routeAttributesPage(page.el);
                }
            });
        }
        routeAttributesPage(container) {
            let ul = $(container).find(".page-content .list ul");
            const attributes = this.view.popup.selectedFeature.attributes;
            this.layer.fields.forEach(function (f) {
                if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap")
                    return;
                let input;
                if (f.domain) {
                    input = document.createElement("select");
                    let option = document.createElement('option');
                    option.innerText = "Chọn giá trị";
                    option.value = "-1";
                    input.appendChild(option);
                    f.domain.codedValues.forEach(function (domain) {
                        let option = document.createElement('option');
                        option.innerText = domain.name;
                        option.value = domain.code + "";
                        input.appendChild(option);
                    });
                }
                else {
                    input = document.createElement("input");
                    let type = f.type === "string" ? "text" : "number";
                    if (f.name === "MaDanhBo") {
                        type = "number";
                        if (attributes["MaDanhBo"]) {
                            input.setAttribute("readonly", "true");
                        }
                    }
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
                ul[0].appendChild(li);
            });
            this.app.form.fillFromData("form", attributes);
            $("#btnSubmit").click(this.onSubmitClick.bind(this));
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
        onSubmitClick() {
            const attributes = this.view.popup.selectedFeature.attributes;
            let applyAttributes = this.app.form.convertToData("form");
            applyAttributes.objectId = attributes.OBJECTID;
            if (!attributes["MaDanhBo"] && applyAttributes['MaDanhBo']) {
                this.isValidDanhBo(applyAttributes['MaDanhBo']).then(tblVal => {
                    const isValid = tblVal !== null;
                    if (isValid) {
                        this.applyEdit(applyAttributes);
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
                this.applyEdit(applyAttributes);
            }
        }
        applyEdit(attributes) {
            this.app.preloader.show("Đang cập nhật");
            this.layer.applyEdits({
                updateFeatures: [
                    new Graphic({
                        attributes: attributes
                    })
                ]
            }).then(r => {
                let message = r.updateFeatureResults[0].error ? 'Có lỗi xảy ra trong quá trình thực hiện, vui lòng thử lại.' : "Cập nhật thành công.";
                if (message)
                    this.app.toast.create({
                        text: message,
                        closeTimeout: 3000,
                    }).open();
                this.app.preloader.hide();
                this.app.views.main.router.back();
                this.view.popup.close();
            });
        }
        toggleCapNhatViTri() {
            let status = this.centerPin.classList.contains("hidden");
            if (status) {
                this.centerPin.classList.remove("hidden");
                $('#cap-nhat-vi-tri').removeClass("hidden");
                $('#huy-cap-nhat-vi-tri').removeClass("hidden");
            }
            else {
                this.centerPin.classList.add("hidden");
                $('#cap-nhat-vi-tri').addClass("hidden");
                $('#huy-cap-nhat-vi-tri').addClass("hidden");
            }
        }
        deleteFeature() {
            this.app.preloader.show();
            this.layer.applyEdits({
                deleteFeatures: [{ objectId: this.view.popup.selectedFeature.attributes.OBJECTID }]
            }).then(r => {
                let message = r.deleteFeatureResults[0].error ? 'Có lỗi xảy ra trong quá trình thực hiện, vui lòng thử lại.' : "Xóa thành công.";
                this.app.toast.create({
                    text: message,
                    closeTimeout: 3000,
                }).open();
                this.app.preloader.hide();
                this.view.popup.close();
            });
        }
        updateGeometry() {
            this.toggleCapNhatViTri();
            this.app.toast.create({
                text: 'Chọn vị trí và nhấn nút cập nhật',
                closeTimeout: 2000,
            }).open();
            this.view.popup.close();
        }
        updateAttributes() {
            this.app.views.main.router.navigate("/cap-nhat/thuoc-tinh/");
        }
        run() {
            this.app.preloader.show();
            this.initMapView();
            this.initWidget();
            this.initLayer();
            this.registerEvent();
            this.initListTab();
            this.layer.then(_ => {
                this.app.preloader.hide();
            });
        }
    }
    return CapNhatPage;
});
