'use strict';

module.exports = app => {
  // 会员账单明细路由
  app.router.get('/admin/userManage/userAccountChange', app.controller.admin.userManage.userAccountChange.index);
  app.router.get('/admin/userManage/userAccountChange/list', app.controller.admin.userManage.userAccountChange.list);
  app.router.get('/admin/userManage/userAccountChange/findUserMassageList', app.controller.admin.userManage.userAccountChange.findUserMassageList);
  app.router.post('/admin/userManage/userAccountChange/export', app.controller.admin.userManage.userAccountChange.export);
};
