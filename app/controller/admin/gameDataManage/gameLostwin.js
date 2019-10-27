'use strict';

const Controller = require('egg').Controller;

class GameLostwinController extends Controller {
  async index() {
    const result = await this.service.gameInfo.findAllGame();
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('dataManage/game_lostwin_statistics', {
      title: '游戏输赢统计',
      gameData: result,
      agents,
    });
  }
}

module.exports = GameLostwinController;
