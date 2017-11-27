define([
    "esri/geometry/Point",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/SpatialReference"
], function (Point, webMercatorUtils, SpatialReference) {
    'use strict';
    return class {
        static convertPathsToPoints(paths) {
            let points = [];
            if (paths) {
                for (let p of paths) {
                    var longlat = webMercatorUtils.xyToLngLat(p[0], p[1]),
                        point = new Point({
                            longitude: longlat[0],
                            latitude: longlat[1],
                            spatialReference: new SpatialReference(102100)
                        });
                    points.push(point);
                }
            }
            return points;
        }
    }
});