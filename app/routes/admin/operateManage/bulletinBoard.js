'use strict';

module.exports = app => {
  // 公告栏管理
  app.router.get('/admin/operateManage/bulletinBoard', app.controller.admin.operateManage.bulletinBoard.index);
  app.router.get('/admin/operateManage/bulletinBoard/list', app.controller.admin.operateManage.bulletinBoard.list);
  app.router.post('/admin/operateManage/bulletinBoard/saveBulletinBoard', app.controller.admin.operateManage.bulletinBoard.saveBulletinBoard);
  app.router.post('/admin/operateManage/bulletinBoard/get', app.controller.admin.operateManage.bulletinBoard.get);
  app.router.post('/admin/operateManage/bulletinBoard/deleteBulletinBoard', app.controller.admin.operateManage.bulletinBoard.deleteBulletinBoard);

};
