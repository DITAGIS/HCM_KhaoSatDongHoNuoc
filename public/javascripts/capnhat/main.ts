var $ = Dom7;
import Map = require("esri/Map");
import FeatureLayer = require("esri/layers/FeatureLayer")
import MapView = require("esri/views/MapView");
import Graphic = require("esri/Graphic");
import Locate = require("esri/widgets/Locate");
import mapconfig = require('../config');
import ListTab = require('./List');
import FeatureTable = require('../ditagis/FeatureTable');
import User = require('../ditagis/User');
import WebTileLayer = require("esri/layers/WebTileLayer");
import Search = require("esri/widgets/Search");
import esriRequest = require("esri/request");
import config = require('../config');
import MapImageLayer = require("esri/layers/MapImageLayer");

class CapNhatPage {
  private view: __esri.MapView;
  private app;
  private map: __esri.Map;
  private layer: __esri.FeatureLayer;
  private mapDHKHQ9: __esri.MapImageLayer;
  private centerPin: HTMLElement;
  private listTab: ListTab;
  private table: FeatureTable;
  private user: User
  constructor(options: { app, user: User }) {
    this.app = options.app;
    this.user = options.user;
  }
  private initListTab() {
    this.listTab = new ListTab({ app: this.app, layer: this.layer, user: this.user });
  }
  private initWidget() {
    this.view.ui.move("zoom", "bottom-right");
    this.centerPin = document.createElement("i");
    this.centerPin.classList.add("esri-icon-map-pin", "hidden")
    this.view.ui.add(this.centerPin);
    this.view.ui.add(new Locate({ view: this.view }), "bottom-right")
    var searchWidget = new Search({
      view: this.view,
      allPlaceholder: "Nhập nội dung tìm kiếm",
      sources: [<__esri.FeatureLayerSource>{
        featureLayer: this.layer,
        searchFields: ["MADANHBO"],
        displayField: "MADANHBO",
        exactMatch: false,
        outFields: ["*"],
        name: "Đồng hồ nước",
        placeholder: "Tìm kiếm mã danh bộ",
      }]
    });
    // Add the search widget to the top left corner of the view
    this.view.ui.add(searchWidget, "top-right");
  }
  private initMapView() {
    this.map = new Map();
    let worldImage = new WebTileLayer({
      id: 'worldimagery',
      urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
      title: 'Ảnh vệ tinh',
    })
    this.map.add(worldImage);
    this.mapDHKHQ9 = new MapImageLayer({url:config.DongHoKhachHang_Quan9_TongHopLayer.url});
    this.map.add(this.mapDHKHQ9)
    this.view = new MapView({
      container: "viewDiv",
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
        actions: [{ id: "cap-nhat-vi-tri", title: "Cập nhật vị trí", className: "esri-icon-locate" },
        { id: "cap-nhat-thuoc-tinh", title: "Cập nhật thuộc tính", className: "esri-icon-edit" },
        { id: "xoa", title: "Xóa đối tượng", className: "esri-icon-erase" }]
      }
    });
    this.map.add(this.layer);
    this.table = new FeatureTable({ url: config.BangMaDanhBo.url,fieldID: "MaDanhBo" });
  }
  private registerEvent() {
    this.view.popup.on("trigger-action", (e) => {
      //nếu đối tượng đúng người cập nhật thì mới cho cập nhật
      const attributes = this.view.popup.selectedFeature.attributes;
      if (attributes['NguoiNhap'] !== this.user.Username) {
        this.app.dialog.alert("Không có quyền truy cập", "Thông báo");
        return;
      }

      if (e.action.id === "cap-nhat-vi-tri") {
        this.updateGeometry();
      } else if (e.action.id === "cap-nhat-thuoc-tinh") {
        this.updateAttributes();
      } else if (e.action.id === "xoa") {
        this.deleteFeature();
      }
    })
    this.view.watch("center", function (oldVal, newVal) {
      $(".long").text(newVal.longitude.toFixed(4) + "")
      $(".lat").text(newVal.latitude.toFixed(4) + "");
    })
    $('#huy-cap-nhat-vi-tri').on('click', (evt) => {
      this.toggleCapNhatViTri();
    });
    $('#cap-nhat-vi-tri').on('click', (evt) => {
      let objectId = this.view.popup.selectedFeature.attributes.OBJECTID;
      this.app.preloader.show("Đang cập nhật vị trí...");
      let layer = this.view.map.findLayerById("mainLayer") as __esri.FeatureLayer;
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
      })
    });
    this.app.on("pageInit", (page) => {
      if (page.name === "cap-nhat/thuoc-tinh") {
        this.routeAttributesPage(page.el);
      }
    })
  }
  private routeAttributesPage(container) {
    let ul = $(container).find(".page-content .list ul")
    const attributes = this.view.popup.selectedFeature.attributes;
    //cập nhật giao diện
    this.layer.fields.forEach(function (f) {
      if (f.type === "oid" || f.name === "NguoiNhap" || f.name === "ThoiGianNhap") return;
      let input: HTMLElement;
      if (f.domain) {
        input = document.createElement("select");
        let option = document.createElement('option');
        option.innerText = "Chọn giá trị";
        option.value = "-1";
        input.appendChild(option);
        (f.domain as __esri.CodedValueDomain).codedValues.forEach(function (domain) {
          let option = document.createElement('option');
          option.innerText = domain.name;
          option.value = domain.code + "";
          input.appendChild(option);
        })
      } else {
        input = document.createElement("input");
        let type = f.type === "string" ? "text" : "number";
        if (f.name === "MaDanhBo") {
          type = "number";
          //nếu danh bộ có giá trị thì không cho nhập lại
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
        `
      ul[0].appendChild(li);
    })
    //cập nhật giá trị
    this.app.form.fillFromData("form", attributes)
    $("#btnSubmit").click(this.onSubmitClick.bind(this))
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
  private onSubmitClick() {
    const attributes = this.view.popup.selectedFeature.attributes;
    let applyAttributes = this.app.form.convertToData("form");
    applyAttributes.objectId = attributes.OBJECTID;
    if (!attributes["MaDanhBo"] && applyAttributes['MaDanhBo']) {
      this.isValidDanhBo(applyAttributes['MaDanhBo']).then(tblVal => {
        const isValid = tblVal !== null;
        if (isValid) {
          this.applyEdit(applyAttributes);
          //thêm xong rồi thì xóa mã danh bộ
          this.table.applyEdits({
            deleteFeatures: [tblVal.attributes['OBJECTID']]
          });
        } else {
          this.app.dialog.alert('Không tồn tại mã danh bộ', "Thông báo");
        }
      })
    } else {
      this.applyEdit(applyAttributes);
    }
  }
  private applyEdit(attributes) {
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
    })
  }
  private toggleCapNhatViTri() {
    let status = this.centerPin.classList.contains("hidden");
    if (status) {
      this.centerPin.classList.remove("hidden");
      $('#cap-nhat-vi-tri').removeClass("hidden");
      $('#huy-cap-nhat-vi-tri').removeClass("hidden");
    } else {
      this.centerPin.classList.add("hidden");
      $('#cap-nhat-vi-tri').addClass("hidden");
      $('#huy-cap-nhat-vi-tri').addClass("hidden");
    }

  }
  private deleteFeature() {
    this.app.dialog.confirm("Đối tượng sẽ bị xóa khỏi cơ sở dữ liệu", "Thông báo",
      _ => {
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
        })
      }
    )
  }
  private updateGeometry() {
    this.toggleCapNhatViTri();
    this.app.toast.create({
      text: 'Chọn vị trí và nhấn nút cập nhật',
      closeTimeout: 2000,
    }).open();
    this.view.popup.close();
  }
  private updateAttributes() {
    this.app.views.main.router.navigate("/cap-nhat/thuoc-tinh/")
  }
  public run() {
    this.app.preloader.show();
    this.initMapView();
    this.initLayer();
    this.initWidget();
    this.registerEvent();
    this.initListTab();
    this.layer.then(_ => {
      this.app.preloader.hide();
    })
  }
}
export = CapNhatPage