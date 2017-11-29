define([
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "ditagis/support/Editing"
], function (QueryTask, Query, editingSupport) {
  'use strict';
  return class PointEditing {
    constructor(view) {
      if (view) {
        this.view = view;
      }
    }
    get layer() {
      return this._layer;
    }
    set layer(value) {
      this._layer = value;
    }
    draw(point) {
      this.draw(this.layer, point);
    }

    async draw(layer, point) {
      try {
        var notify = $.notify({
          title: '<strong>Cập nhật đối tượng</strong>',
          message: 'Đang cập nhật...'
        }, {
          showProgressbar: true,
          delay: 20000
        });
        //tạo attributes để giữ giá trị cho graphic attribute khi sử dụng phương thức applyEdits
        let attributes = {};

        /**
         * ví dụ sử dụng domain thì cần phải gán domain vào attributes thì khi thêm đối tượng
         * vào cơ sở dữ liệu thì mới hiển thị lên được bản đồ
         */
        if (layer.drawingAttributes) {
          for (let i in layer.drawingAttributes) {
            attributes[i] = layer.drawingAttributes[i];
          }
        }

        //lấy thông tin cập nhật gồm người tạo và thời gian tạo


        $.get('http://nominatim.openstreetmap.org/reverse', {
          format: 'json',
          lat: point.geometry.latitude,
          lon: point.geometry.longitude
        }).done((res) => {
          var address = res.display_name;
          attributes['GHICHU'] = address;
          attributes['ThoiGianNhap'] = new Date().getTime();
          attributes['NguoiNhap'] = this.view.systemVariable.user.userName;
          point.attributes = attributes;
          let edits = {
            addFeatures: [point]
          };
          layer.applyEdits(edits).then((result) => {
            if (result.addFeatureResults[0].error) {
              notify.update({
                'type': 'danger',
                'progress': 90
              });

            } else {
              notify.update({
                'type': 'success',
                'progress': 90
              });
              layer.queryFeatures({
                where: 'OBJECTID = ' + result.addFeatureResults[0].objectId,
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: this.view.spatialReference
              }).then(results => {
                this.view.popup.open({
                  features: results.features,
                  location: results.features[0].geometry
                })
              })
            }

          })
        })
      } catch (err) {
        console.log(err);
      }
    }

  }

});