'use strict';

module.exports = app => {
  // 会员管理
  app.router.get('/admin/userManage/userManage', app.controller.admin.userManage.userManage.index);
  app.router.get('/admin/userManage/userManage/list', app.controller.admin.userManage.userManage.list);
  app.router.post('/admin/userManage/userManage/get', app.controller.admin.userManage.userManage.get);
  app.router.get('/admin/userManage/userManage/seeCarry', app.controller.admin.userManage.userManage.seeCarry);
  app.router.post('/admin/userManage/userManage/saveUserInOutMoney', app.controller.admin.userManage.userManage.saveUserInOutMoney);
  app.router.get('/admin/userManage/userManage/clearMoney', app.controller.admin.userManage.userManage.clearMoney);
  app.router.get('/admin/userManage/userManage/forcedOffline', app.controller.admin.userManage.userManage.forcedOffline);
  app.router.put('/admin/userManage/userManage/status', app.controller.admin.userManage.userManage.changeUserStatus);

  app.router.post('/admin/userManage/userManage/export', app.controller.admin.userManage.userManage.export);
};

