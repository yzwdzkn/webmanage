'use strict';

module.exports = app => {
  // 游戏设置
  app.router.get('/admin/operateManage/gameManage/gameManage', app.controller.admin.gameManage.gameManage.index);
  app.router.get('/admin/operateManage/gameManage/gameManage/list', app.controller.admin.gameManage.gameManage.list);
  app.router.post('/admin/operateManage/gameManage/gameManage/saveAddGame', app.controller.admin.gameManage.gameManage.saveAddGame);
  app.router.post('/admin/operateManage/gameManage/gameManage/saveEditGame', app.controller.admin.gameManage.gameManage.saveEditGame);
  app.router.post('/admin/operateManage/gameManage/gameManage/findGameById', app.controller.admin.gameManage.gameManage.findGameById);
  app.router.post('/admin/operateManage/gameManage/gameManage/deleteGame', app.controller.admin.gameManage.gameManage.deleteGame);


  // 游戏房间设置
  app.router.get('/admin/operateManage/gameRoomManage/gameRoomManage', app.controller.admin.gameManage.gameRoomManage.index);
  app.router.get('/admin/operateManage/gameRoomManage/gameRoomManage/list', app.controller.admin.gameManage.gameRoomManage.list);
  app.router.post('/admin/operateManage/gameRoomManage/gameRoomManage', app.controller.admin.gameManage.gameRoomManage.saveGameRoom);
  app.router.get('/admin/operateManage/gameRoomManage/gameRoomManage/findRoomById', app.controller.admin.gameManage.gameRoomManage.findRoomById);
  app.router.put('/admin/operateManage/gameRoomManage/gameRoomManage/editRoom', app.controller.admin.gameManage.gameRoomManage.editRoom);
};

