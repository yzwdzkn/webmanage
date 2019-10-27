'use strict';

module.exports = app => {
  // 会员业绩明细
  app.router.get('/admin/billManage/userAgentSettlementManage', app.controller.admin.billManage.userAgentSettlementManage.index);
  app.router.get('/admin/billManage/userAgentSettlementManage/list', app.controller.admin.billManage.userAgentSettlementManage.list);
  app.router.get('/admin/billManage/userAgentSettlementManage/getPopInfo', app.controller.admin.billManage.userAgentSettlementManage.getPopInfo);
  //   app.router.get('/admin/billManage/platformBillManage/export', app.controller.admin.billManage.platformBillManage.export);

};
