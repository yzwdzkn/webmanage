'use strict';

module.exports = app => {
  // 用户登录分析
  app.router.get('/admin/userManage/userLoginHallManage', app.controller.admin.userManage.userLoginHallManage.index);
  app.router.get('/admin/userManage/userLoginHallManage/list', app.controller.admin.userManage.userLoginHallManage.list);
  app.router.get('/admin/userManage/userLoginHallManage/userLoginList', app.controller.admin.userManage.userLoginHallManage.userLoginList);
  app.router.post('/admin/userManage/userLoginHallManage/export', app.controller.admin.userManage.userLoginHallManage.export);
};
