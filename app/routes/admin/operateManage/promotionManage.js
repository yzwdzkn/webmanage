'use strict';

module.exports = app => {
  // 推广统计
  app.router.get('/admin/operateManage/promotionManage', app.controller.admin.operateManage.promotionManage.index);
  app.router.get('/admin/operateManage/promotionManage/list', app.controller.admin.operateManage.promotionManage.list);
  app.router.get('/admin/operateManage/promotionManage/export', app.controller.admin.operateManage.promotionManage.export);
};

