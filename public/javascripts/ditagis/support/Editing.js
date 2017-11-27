define([
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
], function (QueryTask, Query) {
    'use strict';
    return class {
        static getLocationName(view,params={PhuongXa:null,HuyenTP:null}){
            return new Promise((resolve, reject) => {
                try {
                    if (!this.queryLocation)
                        this.queryLocation = new QueryTask({
                            url: view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
                        });
                        let where = [];
                        if(params.PhuongXa)where.push(`MaPhuongXa = '${params.PhuongXa}'`);
                        if(params.HuyenTP)where.push(`MaHuyenTP = '${params.HuyenTP}'`);
                    this.queryLocation.execute({
                        outFields: ['TenXa', 'TenHuyen'],
                        where:where.join(' and ')
                    }).then(res => {
                        if (res) {
                            let ft = res.features[0];
                            if (ft && ft.attributes) {
                                resolve(ft.attributes);
                            }
                        } else {
                            resolve(null);
                        }
                    });
                } catch (error) {
                    console.log(error)
                    reject(error);
                }

            });
        }
        static getCreatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            }
        }
        static getUpdatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            }
        }
        static getNhomCayTrong(view,geometry){
            let layer = view.map.findLayerById(constName.TRONGTROT);
            var query = layer.createQuery();
            query.geometry = geometry;
            query.outFields = ["LoaiCayTrong","NhomCayTrong"];
            return new Promise((resolve, reject) => {
                layer.queryFeatures(query).then(result =>{
                    resolve(result.features[0].attributes);
                });
                
            })
        }
        static getLocationInfo(view,geometry) {
            return new Promise((resolve, reject) => {
                try {
                    if (!this.queryLocation)
                        this.queryLocation = new QueryTask({
                            url: view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
                        });
                    this.queryLocation.execute({
                        outFields: ['MaPhuongXa', 'MaHuyenTP'],
                        geometry: geometry
                    }).then(res => {
                        if (res) {
                            let ft = res.features[0];
                            if (ft && ft.attributes) {
                                resolve(ft.attributes);
                            }
                        } else {
                            resolve(null);
                        }
                    });
                } catch (error) {
                    console.log(error)
                    reject(error);
                }

            });
        }
    }
});