'use strict';

module.exports = app => {
  app.router.get('/admin/gameDataManage/retain', app.controller.admin.gameDataManage.retain.index);
  app.router.get('/admin/gameDataManage/retain/list', app.controller.admin.gameDataManage.retain.list);
};
