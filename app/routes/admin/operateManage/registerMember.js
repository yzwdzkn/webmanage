'use strict';

module.exports = app => {
  /**
   * 新增注册会员路由
   */
  app.router.get('/admin/operateManage/registerMember', app.controller.admin.operateManage.registerMember.index);
  app.router.get('/admin/operateManage/registerMember/list', app.controller.admin.operateManage.registerMember.list);
  app.router.get('/admin/operateManage/registerMember/viplist', app.controller.admin.operateManage.registerMember.viplist);

};