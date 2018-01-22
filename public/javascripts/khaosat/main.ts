var $ = Dom7;
import Map = require("esri/Map");
import FeatureLayer = require("esri/layers/FeatureLayer")
import MapView = require("esri/views/MapView");
import MapEditor = require('./Map');
import Graphic = require("esri/Graphic");
import mapconfig = require('../config');
import FeatureTable = require('../ditagis/FeatureTable');
import User = require('../ditagis/User');
import WebTileLayer = require("esri/layers/WebTileLayer");
class KhaoSatPage {
  private view: __esri.MapView;
  private app;
  private map: __esri.Map;
  private layer: __esri.FeatureLayer;
  private mapEditor: MapEditor;
  private table: FeatureTable;
  private user: User
  constructor(options: { app, user: User }) {
    this.app = options.app;
    this.user = options.user;
  }
  private initWidget() {
    this.view.ui.empty("top-left");
    let pin = document.createElement("i");
    pin.classList.add("esri-icon-map-pin")
    this.view.ui.add(pin);
  }
  private initMapView() {
    this.map = new Map();
    let worldImage = new WebTileLayer({
      id: 'worldimagery',
      urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
      title: 'Ảnh vệ tinh',
    })
    this.map.add(worldImage);
    this.view = new MapView({
      container: "miniView", constraints: {
        rotationEnabled: false,
      },
      map: this.map, zoom: mapconfig.zoom, center: mapconfig.center
    });
  }
  private initLayer() {
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
    this.table = new FeatureTable({ url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/1", fieldID: "MaDanhBo" });
    this.map.add(this.layer);
    this.layer.then(_ => {
      let container = document.getElementById("form-container");
      this.layer.fields.forEach((f) => {
        if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap") return;
        let input: HTMLElement;
        if (f.domain) {
          input = document.createElement("select");
          let option = document.createElement('option');
          option.innerText = "Chọn giá trị";
          option.value = -1 + "";
          input.appendChild(option);
          (f.domain as __esri.CodedValueDomain).codedValues.forEach(function (domain) {
            let option = document.createElement('option');
            option.innerText = domain.name;
            option.value = domain.code + "";
            input.appendChild(option);
          })
        } else {
          let type = f.type === "string" ? "text" : "number";
          if (f.name === "MaDanhBo") type = "number"
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
        `
        container.appendChild(li);
      })
      this.app.preloader.hide();
    })
  }
  private registerEvent() {
    var route = () => {
      this.app.popup.open(".popup-map")
    }
    this.view.on('click', (evt) => {
      route();
    })
    this.view.on('drag', (evt) => {
      route();
    })
    $("#btnSubmit").click(this.onSubmitClick.bind(this));
  }
  private initMapEditor() {
    this.mapEditor = new MapEditor({ map: this.map, app: this.app });
    this.mapEditor.view.watch("center", (oldVal, newVal) => {
      this.view.center = this.mapEditor.view.center;
    })
  }
  public run() {
    this.app.preloader.show();
    this.initMapView();
    this.initWidget();
    this.initLayer();
    this.registerEvent();
    this.initMapEditor();
    this.layer.then(_ => {
      this.app.preloader.hide();
    })
  }
  isValidDanhBo(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.table.findById(id).then(function (results) {
        if (results.features.length > 0)
          resolve(results.features[0]);
        else resolve(null);
      })
    });
  }
  private clearAttributes() {
    let clearData = {};
    this.layer.fields.forEach(function (f) {
      clearData[f.name] = f.type === "string" ? "" : -1;
    })
    this.app.form.fillFromData("#infoForm", clearData)
  }

  private onSubmitClick() {
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
      if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap") return;
      attributes[f.name] = formAttr[f.name];
    })
    attributes['ThoiGianNhap'] = new Date().getTime();
    attributes['NguoiNhap'] = this.user.Username;
    if (attributes['MaDanhBo']) {
      this.isValidDanhBo(attributes['MaDanhBo']).then(tblVal => {
        const isValid = tblVal !== null;
        if (isValid) {
          this.applyEdit(attributes);
          //thêm xong rồi thì xóa mã danh bộ
          this.table.applyEdits({
            deleteFeatures: [tblVal.attributes['OBJECTID']]
          });
        } else {
          this.app.dialog.alert('Không tồn tại mã danh bộ', "Thông báo");
        }
      })
    } else {
      this.applyEdit(attributes);
    }
  }
  private applyEdit(attributes) {
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
        message = "Cập nhật thành công."
      } else {
        message = 'Có lỗi xảy ra trong quá trình thực hiện, vui lòng thử lại.'
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
export = KhaoSatPage;