import CapNhatPage = require('./capnhat/main');
import routes = require('./routes');
var app = (window as any).app;
app.routes = routes;
app.on("pageInit", function (page) {
  if (page.name === "cap-nhat") {
    new CapNhatPage({ app: app }).run();
  }
})
var mainView = app.views.create('.view-main', {
  url: '/'
});