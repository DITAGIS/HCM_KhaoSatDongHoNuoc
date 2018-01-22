define(["require", "exports"], function (require, exports) {
    "use strict";
    var $ = Dom7;
    class List {
        constructor(options) {
            this.app = options.app;
            this.layer = options.layer;
            this.user = options.user;
            this.pullRefresh();
        }
        pullRefresh() {
            var $ptrContent = $('.ptr-content');
            $ptrContent.on('ptr:refresh', e => {
                $ptrContent.find('ul').empty();
                this.layer.queryFeatures({
                    where: `NguoiNhap = '${this.user.Username}'`, outFields: ["MaDanhBo", "ThoiGianNhap", "DiaChi"], orderByFields: ["ThoiGianNhap DESC"]
                }).then(r => {
                    r.features.forEach(f => {
                        const attributes = f.attributes;
                        let maDanhBo = attributes.MaDanhBo ? attributes.MaDanhBo : "Chưa xác định";
                        let diaChi = attributes.DiaChi ? attributes.DiaChi : "Chưa xác định";
                        let tgNhapFormat = "Chưa xác định";
                        if (f.attributes.ThoiGianNhap) {
                            let d = new Date(f.attributes.ThoiGianNhap);
                            tgNhapFormat = `${d.getHours()}:${d.getMinutes()} ${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
                        }
                        var itemHTML = '<li class="item-content">' +
                            '<div class="item-inner">' +
                            '<div class="item-title-row">' +
                            '<div class="item-title">' + maDanhBo + '</div>' +
                            '<div class="item-date">' + tgNhapFormat + '</div>' +
                            '</div>' +
                            '<div class="item-subtitle">' + diaChi + '</div>' +
                            '</div>' +
                            '</li>';
                        $ptrContent.find('ul').prepend(itemHTML);
                    });
                    this.app.ptr.done();
                });
            });
        }
    }
    return List;
});
