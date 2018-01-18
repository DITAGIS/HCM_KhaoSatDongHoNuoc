define(["require", "exports"], function (require, exports) {
    "use strict";
    return {
        basemap: {
            title: 'Dữ liệu nền',
            id: 'dulieunen',
            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer',
            visible: true,
            copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
            sublayers: [
                {
                    id: 5,
                    title: 'Hành chính huyện'
                },
                {
                    id: 4,
                    title: 'Hành chính xã'
                }, {
                    id: 3,
                    title: 'Phủ bề mặt',
                    visible: false
                },
                {
                    id: 2,
                    title: 'Mặt giao thông',
                    visible: false
                }, {
                    id: 1,
                    title: 'Sông hồ'
                }, {
                    id: 0,
                    title: 'Tim đường'
                }
            ]
        },
        BangMaDanhBo: {
            title: 'Bảng Mã Danh Bộ',
            id: 'BangMaDanhBo',
            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/1',
            outFields: ['*']
        },
        KSDongHoNuocLayer: {
            title: 'Khảo sát đồng hồ nước',
            id: "KSDongHoNuoc",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/KhaoSatDongHoNuoc/FeatureServer/0",
            outFields: ['*'],
            permission: {
                view: true, create: true, delete: true, edit: true
            }
        },
        zoom: 13,
        center: [106.7502031, 10.7803536]
    };
});
