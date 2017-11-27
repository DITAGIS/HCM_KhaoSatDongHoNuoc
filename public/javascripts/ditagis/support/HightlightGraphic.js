define([
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol"
], function (Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol) {

    return class {
        constructor(view, options) {
            options = options || {};
            this.view = view;
            this.symbolMarker = options.symbolMarker || new SimpleMarkerSymbol({
                color: [255, 0, 0],
                size: 3,
                width: 4,
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 64, 0, 0.4], // autocasts as new Color()
                    width: 7
                }
            })

            this.symbolLine = options.symbolLine || new SimpleLineSymbol({
                color: [255, 0, 0],
                size: 3,
                width: 4,
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 64, 0, 0.4], // autocasts as new Color()
                    width: 7
                }
            })
            this.symbolFill = options.symbolFill || new SimpleFillSymbol({
                color: [255, 0, 0],
                size: 3,
                width: 4,
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 64, 0, 0.4], // autocasts as new Color()
                    width: 7
                }
            })
            this.tmpGraphics = [];
        }
        /**
         * Làm sáng các graphic được tìm thấy xung quanh screenCoor
         * @param {ScreenCoor{x,y}} screenCoors 
         */
        hightlight(screenCoors) {
            this.clear(); //xóa cái hightlight hiện có
            //tìm những graphic có ở tọa độ screenCoors
            this.view.hitTest(screenCoors).then((res) => {
                //duyệt kết quả
                for (let result of res.results) {
                    const graphic = result.graphic; //lấy graphic
                    //kiểm tra xem có attributes hay không
                    //nếu không có nghĩa là graphic này không được sinh ra từ FeatureLayer services
                    if (graphic.attributes && graphic.attributes != null) {
                        this.add(graphic);
                    }
                }
                //nếu như có graphic cần hightlight thì gọi renderer
            })
        }
        /**
         * Trên bản đồ chỉ được hightlight duy nhất một vùng nên 
         * cần phải có phương thức này để xóa các hightlight của những layer khác
         * vì giải thuật này hightlight theo UniqueValuaRenderer 
         * nên sẽ có tình trạng những layer khác nhau được hightligt thì sẽ không bị ẩn đi
         * có thể xóa dùng this.clear() ở phương thức hightlight để nhìn nhận rõ ràng hơn
         */
        clear() {
            this.removeAll();
        }
        rendererGraphic(type, geometry) {
            let symbol = type === 'point' ? this.symbolMarker : type === 'polyline' ? this.symbolLine : this.symbolFill;

            let graphic = new Graphic({
                geometry: geometry,
                symbol: symbol
            });
            return graphic;
        }
        add(graphic) {
            const type = graphic.layer.geometryType;
            let renderergraphic = this.rendererGraphic(type, graphic.geometry);
            this.tmpGraphics.push(renderergraphic);
            this.view.graphics.add(renderergraphic);
        }
        addAll(graphics) {
            for (let g of graphics) {
                this.add(g);
            }
        }
        removeAll() {
            for (let g of this.tmpGraphics) {
                this.view.graphics.remove(g);
            }
            this.tmpGraphics = [];
        }
    }
});