'use strict';

module.exports = app => {
  // 菜单管理
  app.router.get('/admin/systemSetting/menuManage', app.controller.admin.systemSetting.menuManage.index);
  app.router.get('/admin/systemSetting/menuManage/list', app.controller.admin.systemSetting.menuManage.list);
  app.router.post('/admin/systemSetting/menuManage/showMenuTree', app.controller.admin.systemSetting.menuManage.showMenuTree);
  app.router.post('/admin/systemSetting/menuManage/saveMenu', app.controller.admin.systemSetting.menuManage.saveMenu);
  app.router.post('/admin/systemSetting/menuManage/get', app.controller.admin.systemSetting.menuManage.get);
  app.router.post('/admin/systemSetting/menuManage/deleteMenu', app.controller.admin.systemSetting.menuManage.deleteMenu);

};
