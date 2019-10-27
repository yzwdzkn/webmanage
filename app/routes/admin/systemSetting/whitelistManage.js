'use strict';

module.exports = app => {
  // 后台白名单管理
  app.router.get('/admin/systemSetting/whitelistManage', app.controller.admin.systemSetting.whitelistManage.index);
  app.router.get('/admin/systemSetting/whitelistManage/list', app.controller.admin.systemSetting.whitelistManage.list);
  app.router.post('/admin/systemSetting/whitelistManage/saveWhitelist', app.controller.admin.systemSetting.whitelistManage.saveWhitelist);
  app.router.post('/admin/systemSetting/whitelistManage/get', app.controller.admin.systemSetting.whitelistManage.get);
  app.router.post('/admin/systemSetting/whitelistManage/deleteWhitelist', app.controller.admin.systemSetting.whitelistManage.deleteWhitelist);


};
