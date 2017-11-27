define([

], function () {
    'use strict';
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
        layers: [{
            title: 'Trồng trọt',
            id: "TrongTrot",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/2",
            outFields: ['*'],
        }, {
            title: 'Sâu bệnh',
            id: "SauBenh",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/1",
            outFields: ['*']
            
        },{
            title: 'Doanh nghiệp',
            id: "DoanhNghiep",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/0",
            outFields: ['*'],
        } ,
        ],
        zoom: 10,
        center: [106.6843694, 11.158752270428375]
    }
});