'use strict';

module.exports = app => {

  /**
   * 公告管理路由
   */
  app.router.get('/admin/operateManage/noticeManage', app.controller.admin.operateManage.noticeManage.index);
  app.router.get('/admin/operateManage/noticeManage/list', app.controller.admin.operateManage.noticeManage.list);
  app.router.post('/admin/operateManage/noticeManage/saveNotice', app.controller.admin.operateManage.noticeManage.saveNotice);
  app.router.post('/admin/operateManage/noticeManage/get', app.controller.admin.operateManage.noticeManage.get);
  app.router.post('/admin/operateManage/noticeManage/deleteNotice', app.controller.admin.operateManage.noticeManage.deleteNotice);
  app.router.post('/admin/operateManage/noticeManage/findGame', app.controller.admin.operateManage.noticeManage.findGame);

};
