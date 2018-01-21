define(["require", "exports", "./capnhat/main", "./routes"], function (require, exports, CapNhatPage, routes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var app = window.app;
    app.routes = routes;
    app.on("pageInit", function (page) {
        if (page.name === "cap-nhat") {
            new CapNhatPage({ app: app }).run();
        }
    });
    var mainView = app.views.create('.view-main', {
        url: '/'
    });
});
