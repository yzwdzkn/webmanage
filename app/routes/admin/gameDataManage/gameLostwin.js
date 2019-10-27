'use strict';

module.exports = app => {
  app.router.get('/admin/gameDataManage/gameLostwin', app.controller.admin.gameDataManage.gameLostwin.index);
};
