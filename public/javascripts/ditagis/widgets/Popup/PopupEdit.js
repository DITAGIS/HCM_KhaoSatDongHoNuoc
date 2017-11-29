define([
  "dojo/on",
  "dojo/dom",
  "dojo/dom-construct",
  "esri/request",
  "esri/tasks/QueryTask",
  "esri/core/watchUtils",
  "esri/geometry/Point",
  "esri/widgets/Locate/LocateViewModel",
  "esri/layers/FeatureLayer",
  "ditagis/support/Editing",
  "ditagis/toolview/bootstrap",
  "ditagis/toolview/DateTimeDefine"
], function (on, dom, domConstruct, esriRequest, QueryTask, watchUtils, Point, LocateViewModel, FeatureLayer,
  editingSupport, bootstrap, DateTimeDefine) {
  'use strict';
  return class {
    constructor(view, options) {
      this.view = view;
      this.options = options;
      this.locateViewModel = new LocateViewModel({
        view: view,
        graphic: null
      })
      this.fireFields = ['NguoiNhap', 'ThoiGianNhap'];
      this.inputElement = {};
      this.tableData = new QueryTask({
        url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/1'
      })
    }
    isValidDanhBo(id) {
      return new Promise((resolve, reject) => {
        this.tableData.execute({
          // outField: ['*'],
          where: `MaDanhBo = ${id}`
        }).then(function (results) {
          resolve(results.features.length > 0);
        })
      });

    }
    get selectFeature() {
      return this.view.popup.viewModel.selectedFeature;
    }
    get layer() {
      return this.selectFeature.layer || this._layer;
    }
    set layer(value) {
      if (this.selectFeature.layer)
        return;
      this._layer = value;
    }
    get attributes() {
      return this.selectFeature.attributes;
    }
    get objectId() {
      return this.attributes['OBJECTID'];
    }
    /**
     * Khởi tạo lại inputElement
     */
    resetInputElement() {
      this.inputElement = {};
    }
    isFireField(fieldName) {
      return this.fireFields.indexOf(fieldName) !== -1;
    }
    /**
    * Lấy subtype của {name} với giá trị {value} trong {layer}
    * @param {*} layer 
    * @param {*} name 
    * @param {*} value 
    * @return subtype
    */
    getSubtype(name, value) {
      name = name || this.layer.typeIdField;
      value = value || this.attributes[name];
      if (this.layer.typeIdField === name) {
        const typeIdField = this.layer.typeIdField,//tên thuộc tính của subtypes
          domainType = this.layer.getFieldDomain(typeIdField),//lấy domain
          subtypes = this.layer.types,//subtypes
          subtype = subtypes.find(f => f.id == value);
        return subtype;
      }
      return null;
    }
    renderDomain(codedValues, id) {
      let currentValue = this.attributes[id];
      let input = document.createElement('select');
      input.classList.add('form-control');
      input.id = id;
      let defaultComboValue = document.createElement('option');
      defaultComboValue.value = -1;
      defaultComboValue.innerText = 'Chọn giá trị...';
      input.appendChild(defaultComboValue);
      for (let codedValue of codedValues) {
        let dmCode = codedValue.code,
          dmName = codedValue.name;
        let option = document.createElement('option');
        option.setAttribute('value', dmCode);
        if (currentValue === dmCode) {
          option.setAttribute("selected",'selected');
        }
        option.innerHTML = dmName;
        input.appendChild(option);
      }
      return input;
    }
    getSubtype(name, value) {
      name = name || this.layer.typeIdField;
      value = value || this.attributes[name];
      return this.layer.fields.find(f => {
        return f.name == name;
      }).domain.codedValues;
    }
    /**
     * Hiển thị popup
     */
    showEdit(target, featureLayer) {
      const graphic = target.graphic,
        layer = featureLayer,
        attributes = graphic.attributes;
      let codedValues = this.getSubtype("TinhTrang");
      console.log(codedValues);
      if (!graphic.layer) graphic.layer = layer;
      let div = domConstruct.create('div', {
        id: 'show-edit-container',
        class: 'popup-content'
      });
      let table = domConstruct.create('table', { class: "table" }, div);
      //duyệt thông tin đối tượng
      for (let field of this.layer.fields) {

        if (field.type === 'oid' || this.isFireField(field.name)
        )
          continue;
        //tạo <tr>
        let row = domConstruct.create('tr');
        //tạo <td>
        let tdName = domConstruct.create('td', {
          innerHTML: field.alias
        }),
          input,
          tdValue = domConstruct.create('td');
        if (codedValues && field.domain) {
          input = this.renderDomain(codedValues,field.name);
        }
        else {
          let inputType;
          //neu du lieu qua lon thi hien thi textarea
          input = domConstruct.create('input', {
            type: "tel",
            class: "form-control",
            name: field.name,
            id: field.name
          });
          if (this.attributes[field.name])
            input.setAttribute('value', this.attributes[field.name]);
        }
        domConstruct.place(input, tdValue);
        domConstruct.place(tdName, row);
        domConstruct.place(tdValue, row);
        domConstruct.place(row, table);

      }

      return div.outerHTML;
    }
    renderAttachmentEditPopup(item, props) {
      const
        container = props.container || document.getElementById(`attachment-${this.layer.id}-${this.attributes['OBJECTID']}`);

      let url = `${this.layer.url}/${this.layer.layerId}/${attributes['OBJECTID']}`;
      let itemDiv = domConstruct.create('div', {
        class: 'attachment-item'
      }, container);
      let itemName = domConstruct.create('div', {
        class: 'attachment-name'
      }, itemDiv);
      let aItemName = domConstruct.create('a', {
        href: `${url}/attachments/${item.id}`,
        target: '_blank'
      }, itemName)
      aItemName.innerText = item.name;
      let itemDelete = domConstruct.create('div', {
        class: 'delete-attachment esri-icon-trash'
      }, itemDiv);
      on(itemDelete, 'click', () => {
        if (!attributes.deleteAttachment)
          attributes.deleteAttachment = [];
        attributes.deleteAttachment.push(`${url}/deleteAttachments?f=json&attachmentIds=${item.id}`);
        container.removeChild(itemDiv);
      });
    }

    /**
     * Sự kiện chỉnh sửa thông tin đối tượng
     */
    editFeature() {
      let notify = $.notify({
        title: `<strong>Cập nhật <i>${this.layer.title}</i></strong>`,
        message: 'Cập nhật...'
      }, {
          showProgressbar: true,
          delay: 20000,
          placement: {
            from: 'top',
            alias: 'left'
          }
        })
      try {
        if (this.attributes) {
          var inputMaDanhBo = document.getElementById("MaDanhBo");
          //kiem tra ma danh bo
          //neu trung thi khong cho cap nhat
          //dong thoi xoa luon diem moi them
          this.isValidDanhBo(inputMaDanhBo.value).then(isValid => {
            if (!isValid) {
              notify.update({
                'type': 'danger',
                'message': 'Không tồn tại mã danh bộ!',
                'progress': 90
              });
              this.layer.applyEdits({
                deleteFeatures: [{
                  objectId: this.attributes['OBJECTID']
                }]
              })
              this.view.popup.close();
            } else {
              
              this.attributes.MaDanhBo = inputMaDanhBo.value;
              var inputTinhTrang = document.getElementById("TinhTrang");
              this.attributes.TinhTrang = inputTinhTrang.value;
              this.layer.applyEdits({
                updateFeatures: [{
                  attributes: this.attributes
                }]
              }).then((res) => {
                //khi applyEdits, nếu phát hiện lỗi
                let valid = false;
                for (let item of res.updateFeatureResults) {
                  if (item.error) {
                    valid = true;
                    break;
                  }
                }
                //không phát hiện lỗi nên tắt popup
                if (!valid) {
                  notify.update({
                    'type': 'success',
                    'message': 'Cập nhật thành công!',
                    'progress': 90
                  });
                  let query = this.layer.createQuery();
                  query.outField = ['*'];
                  query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                  this.layer.queryFeatures(query).then(res => {
                    // this.view.popup.open({
                    //   features: res.features
                    // })
                    this.view.popup.close();
                  })
                }
              })
            }
          })
          
        }

      } catch (error) {
        notify.update({ 'type': 'danger', 'message': 'Có lỗi xảy ra trong quá trình cập nhật!', 'progress': 90 });
        throw error;
      }
    }
    /**
     * Xóa đối tượng được chọn
     */
    deleteFeature() {
      let accept = confirm('Chắc chắn muốn xóa?');
      if (!accept) return;
      let objectId = this.objectId;
      let notify = $.notify({
        title: `<strong>Xóa <i>${this.layer.title}</i></strong>`,
        message: 'Đang xóa...'
      }, {
          showProgressbar: true,
          delay: 20000
        })
      this.layer.applyEdits({
        deleteFeatures: [{
          objectId: objectId
        }] //xoa objectID truyen vao
      }).then((res) => {
        if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
          this.view.popup.visible = false;
          notify.update({ 'type': 'success', 'message': 'Xóa thành công!', 'progress': 100 });
          this.hightlightGraphic.clear();
        }
      });
    }
    updateGeometryGPS() {
      let objectId = this.objectId;
      let notify = $.notify({
        title: `<strong>Cập nhật vị trí</strong>`,
        message: 'Cập nhật...'
      }, {
          showProgressbar: true,
          delay: 20000,
          placement: {
            from: 'top',
            alias: 'left'
          }
        })
      this.locateViewModel.locate().then(res => {
        const coords = res.coords,
          latitude = coords.latitude,
          longitude = coords.longitude;
        const geometry = new Point({
          latitude: latitude,
          longitude: longitude,
          spatialReference: this.view.spatialReference
        })
        this.layer.applyEdits({
          updateFeatures: [{
            attributes: { objectId: objectId },
            geometry: geometry
          }]
        }).then(res => {
          if (res.updateFeatureResults[0].error) {
            notify.update({ 'type': 'danger', 'message': 'Cập nhật không thành công!', 'progress': 90 });
          } else {
            notify.update({ 'type': 'success', 'message': 'Cập nhật thành công!', 'progress': 90 });
            this.view.popup.close();
          }
        })
      })
    }
  }
});