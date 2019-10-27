'use strict';

module.exports = app => {
  // 用户登录分析
  app.router.get('/admin/operateManage/userLoginHallManage', app.controller.admin.operateManage.userLoginHallManage.index);
  app.router.get('/admin/operateManage/userLoginHallManage/list', app.controller.admin.operateManage.userLoginHallManage.list);
  app.router.get('/admin/operateManage/userLoginHallManage/userLoginList', app.controller.admin.operateManage.userLoginHallManage.userLoginList);
  app.router.get('/admin/operateManage/userLoginHallManage/export', app.controller.admin.operateManage.userLoginHallManage.export);
};
