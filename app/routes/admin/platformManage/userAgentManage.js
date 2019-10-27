'use strict';

module.exports = app => {
  // 全民代管理
  app.router.get('/admin/platformManage/userAgentManage', app.controller.admin.platformManage.userAgentManage.index);
  app.router.get('/admin/platformManage/userAgentManage/list', app.controller.admin.platformManage.userAgentManage.list);
  app.router.post('/admin/platformManage/userAgentManage/addUserAgent', app.controller.admin.platformManage.userAgentManage.addUserAgent);
  app.router.post('/admin/platformManage/userAgentManage/editUserAgent', app.controller.admin.platformManage.userAgentManage.editUserAgent);

};
