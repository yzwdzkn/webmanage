'use strict';

module.exports = app => {
  // 权限管理
  app.router.get('/admin/systemSetting/roleManage', app.controller.admin.systemSetting.roleManage.index);
  app.router.get('/admin/systemSetting/roleManage/list', app.controller.admin.systemSetting.roleManage.list);
  app.router.post('/admin/systemSetting/roleManage/saveRole', app.controller.admin.systemSetting.roleManage.saveRole);
  app.router.post('/admin/systemSetting/roleManage/get', app.controller.admin.systemSetting.roleManage.get);
  app.router.post('/admin/systemSetting/roleManage/deleteRole', app.controller.admin.systemSetting.roleManage.deleteRole);
  app.router.post('/admin/systemSetting/roleManage/authorizationMenu', app.controller.admin.systemSetting.roleManage.authorizationMenu);
  app.router.post('/admin/systemSetting/roleManage/saveAuthorizationMenu', app.controller.admin.systemSetting.roleManage.saveAuthorizationMenu);

};
