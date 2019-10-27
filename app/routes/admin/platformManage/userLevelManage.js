'use strict';

module.exports = app => {
  // 会员等级管理
  app.router.get('/admin/platformManage/userLevelManage', app.controller.admin.platformManage.userLevelManage.index);
  app.router.get('/admin/platformManage/userLevelManage/list', app.controller.admin.platformManage.userLevelManage.list);
  app.router.post('/admin/platformManage/userLevelManage/saveUserLevel', app.controller.admin.platformManage.userLevelManage.saveUserLevel);
  app.router.post('/admin/platformManage/userLevelManage/delUserLevel', app.controller.admin.platformManage.userLevelManage.delUserLevel);


};
