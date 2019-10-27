'use strict';

module.exports = app => {
  // 账户管理
  app.router.get('/admin/systemSetting/adminManage', app.controller.admin.systemSetting.adminManage.index);
  app.router.get('/admin/systemSetting/adminManage/list', app.controller.admin.systemSetting.adminManage.list);
  app.router.post('/admin/systemSetting/adminManage/saveAdmin', app.controller.admin.systemSetting.adminManage.saveAdmin);
  app.router.post('/admin/systemSetting/adminManage/get', app.controller.admin.systemSetting.adminManage.get);
  app.router.post('/admin/systemSetting/adminManage/deleteAdmin', app.controller.admin.systemSetting.adminManage.deleteAdmin);
  app.router.get('/admin/systemSetting/adminManage/findRoles', app.controller.admin.systemSetting.adminManage.findRoles);
  // app.router.post('/admin/systemSetting/adminManage/resetPassword', app.controller.admin.systemSetting.adminManage.resetPassword);
  app.router.post('/admin/systemSetting/adminManage/savePassword', app.controller.admin.systemSetting.adminManage.savePassword);

};
