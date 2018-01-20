define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/views/MapView", "esri/Graphic", "./MapEditor"], function (require, exports, Map, FeatureLayer, MapView, Graphic, MapEditor) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var user;
    var map, miniView, mapEditor;
    var myApp, mainView, $$ = Dom7;
    initMobile();
    myApp.showPreloader("Đang tải...");
    map = new Map({
        basemap: "osm"
    });
    miniView = new MapView({
        container: "minimap",
        map: map, constraints: ["attribution"]
    });
    miniView.ui.empty("top-left");
    var node = document.createElement("i");
    node.classList.add("fa", "fa-map-pin");
    miniView.ui.add(node);
    miniView.on('click', (evt) => {
        selectLocation();
    });
    miniView.on('drag', (evt) => {
        selectLocation();
    });
    var layer = new FeatureLayer({
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
            actions: [
                {
                    className: "esri-icon-map-pin", id: "cap-nhat-vi-tri", title: "Cập nhật vị trí"
                }
            ]
        }
    });
    map.add(layer);
    layer.then(function () {
        let container = document.getElementById("form-container");
        layer.fields.forEach(function (f) {
            if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap")
                return;
            let li = document.createElement("li");
            li.classList.add("field");
            let label = document.createElement("label");
            label.classList.add("flabel");
            label.setAttribute("for", f.name);
            label.innerText = f.alias;
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
            li.appendChild(label);
            li.appendChild(input);
            container.appendChild(li);
        });
        myApp.hidePreloader();
    });
    function initMapEditor() {
        mapEditor = new MapEditor({
            map: map, app: myApp
        });
        function watch() {
            miniView.center = mapEditor.view.center;
            miniView.zoom = mapEditor.view.zoom;
            $$(".long").text(mapEditor.view.center.longitude.toFixed(4) + "");
            $$(".lat").text(mapEditor.view.center.latitude.toFixed(4) + "");
        }
        mapEditor.view.watch("center", watch);
        mapEditor.view.watch("zoom", watch);
    }
    initMobile();
    initMapEditor();
    $$("#btnSubmit").click(applyEditFeatures);
    function selectLocation() {
        mainView.router.load({
            url: 'map.html'
        });
    }
    function initMobile() {
        myApp = new Framework7();
        mainView = myApp.addView('.view-main', {
            dynamicNavbar: true
        });
    }
    function clearAttributes() {
        let clearData = {};
        layer.fields.forEach(function (f) {
            clearData[f.name] = f.type === "string" ? "" : -1;
        });
        myApp.formFromJSON("#infoForm", clearData);
    }
    function applyEditFeatures() {
        myApp.showPreloader("Đang cập nhật...");
        var attributes = {};
        var formAttr = myApp.formToJSON('#infoForm');
        if (!formAttr.MaDanhBo || (miniView.center.x < 0 || miniView.center.y < 0)) {
            let message = 'Vui lòng điền đầy đủ các thông tin trên';
            myApp.addNotification({
                title: 'Thông báo',
                message: message,
                hold: 3000
            });
            return;
        }
        layer.fields.forEach(function (f) {
            if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap")
                return;
            attributes[f.name] = formAttr[f.name];
        });
        attributes['ThoiGianNhap'] = new Date().getTime();
        attributes['NguoiNhap'] = "test";
        layer.applyEdits({
            addFeatures: [new Graphic({
                    attributes: attributes, geometry: miniView.center
                })]
        }).then(result => {
            var objectId = result.addFeatureResults[0].objectId;
            let message;
            if (objectId) {
                clearAttributes();
                message = "Cập nhật thành công.";
            }
            else {
                message = 'Có lỗi xảy ra trong quá trình thực hiện, vui lòng thử lại.';
            }
            if (message)
                myApp.addNotification({
                    title: 'Thông báo',
                    message: message,
                    hold: 3000
                });
            myApp.hidePreloader();
        });
    }
});
