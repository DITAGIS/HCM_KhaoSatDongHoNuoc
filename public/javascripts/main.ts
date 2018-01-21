import CapNhatPage = require('./capnhat/main');
import KhaoSatPage = require('./khaosat/main');
import routes = require('./routes');
var app = (window as any).app;
var user;
app.routes = routes;
app.request.post("/session", function (res) {
  user = JSON.parse(res);
  app.preloader.hide();
});
app.on("pageInit", function (page) {
  if (page.name === "cap-nhat") {
    new CapNhatPage({ app: app, user: user }).run();
  } else if (page.name === "khao-sat") {
    new KhaoSatPage({ app: app, user: user }).run();
  }
})
var mainView = app.views.create('.view-main', {
  url: '/',
});