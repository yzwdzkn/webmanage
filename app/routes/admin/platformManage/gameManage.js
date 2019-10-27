'use strict';

module.exports = app => {
  // 游戏设置
  app.router.get('/admin/platformManage/gameManage', app.controller.admin.platformManage.gameManage.index);
  app.router.get('/admin/platformManage/gameManage/list', app.controller.admin.platformManage.gameManage.list);
  app.router.post('/admin/platformManage/gameManage/saveAddGame', app.controller.admin.platformManage.gameManage.saveAddGame);
  app.router.post('/admin/platformManage/gameManage/saveEditGame', app.controller.admin.platformManage.gameManage.saveEditGame);
  app.router.post('/admin/platformManage/gameManage/findGameById', app.controller.admin.platformManage.gameManage.findGameById);
  app.router.post('/admin/platformManage/gameManage/deleteGame', app.controller.admin.platformManage.gameManage.deleteGame);
};

