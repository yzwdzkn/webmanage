'use strict';

module.exports = app => {
  // 历史操作
  app.router.get('/admin/riskManagement/historyOperation', app.controller.admin.riskManagement.historyOperation.index);
  app.router.get('/admin/riskManagement/historyOperation/list', app.controller.admin.riskManagement.historyOperation.list);

};
