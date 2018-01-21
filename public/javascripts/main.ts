import CapNhatPage = require('./capnhat/main');
import KhaoSatPage = require('./khaosat/main');

import routes = require('./routes');
var app = (window as any).app;
app.routes = routes;
app.on("pageInit", function (page) {
  if (page.name === "cap-nhat") {
    new CapNhatPage({ app: app }).run();
  }else if(page.name === "khao-sat"){
    new KhaoSatPage({ app: app }).run();
  }
})
var mainView = app.views.create('.view-main', {
  url: '/',domCache:true,uniqueHistory:true
});