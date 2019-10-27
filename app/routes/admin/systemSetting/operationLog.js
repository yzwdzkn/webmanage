'use strict';

module.exports = app => {
  // 操作日志
  app.router.get('/admin/systemSetting/operationLog', app.controller.admin.systemSetting.operationLog.index);
  app.router.get('/admin/systemSetting/operationLog/list', app.controller.admin.systemSetting.operationLog.list);
};
