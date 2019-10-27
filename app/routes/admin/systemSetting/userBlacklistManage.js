'use strict';

module.exports = app => {
  // 后台白名单管理
  app.router.get('/admin/systemSetting/userBlacklistManage', app.controller.admin.systemSetting.userBlacklistManage.index);
  app.router.get('/admin/systemSetting/userBlacklistManage/list', app.controller.admin.systemSetting.userBlacklistManage.list);
  app.router.post('/admin/systemSetting/userBlacklistManage/saveUserBlacklist', app.controller.admin.systemSetting.userBlacklistManage.saveUserBlacklist);
  app.router.get('/admin/systemSetting/userBlacklistManage/:id', app.controller.admin.systemSetting.userBlacklistManage.get);
  app.router.delete('/admin/systemSetting/userBlacklistManage/delete/:id', app.controller.admin.systemSetting.userBlacklistManage.deleteUserBlacklist);


};
