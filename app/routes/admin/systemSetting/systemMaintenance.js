'use strict';

module.exports = app => {
  // 系统维护
  app.router.get('/admin/systemSetting/systemMaintenance', app.controller.admin.systemSetting.systemMaintenance.index);
  app.router.get('/admin/systemSetting/systemMaintenance/list', app.controller.admin.systemSetting.systemMaintenance.list);
  app.router.post('/admin/systemSetting/systemMaintenance/saverecord', app.controller.admin.systemSetting.systemMaintenance.saverecord);
};
