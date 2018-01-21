define(["require", "exports", "./capnhat/main", "./khaosat/main", "./routes"], function (require, exports, CapNhatPage, KhaoSatPage, routes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var app = window.app;
    app.routes = routes;
    app.on("pageInit", function (page) {
        if (page.name === "cap-nhat") {
            new CapNhatPage({ app: app }).run();
        }
        else if (page.name === "khao-sat") {
            new KhaoSatPage({ app: app }).run();
        }
    });
    var mainView = app.views.create('.view-main', {
        url: '/', domCache: true, uniqueHistory: true
    });
});
