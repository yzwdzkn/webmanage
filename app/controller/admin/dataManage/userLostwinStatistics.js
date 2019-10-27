'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

class PlayerKillController extends Controller {
  async index() {
    const result = await this.service.gameInfo.findAllGame();
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('dataManage/user_lostwin_statistics', {
      title: '玩家输赢详情',
      gameData: result,
      agents,
    });
  }


  async list() {
    const { is_realtime, agent_id, room_id, username, start_date, end_date, page, limit } = this.ctx.query;
    const data = await this.service.user.findUserData(parseInt(is_realtime), agent_id, room_id, username, start_date, end_date, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: data.rows,
      msg: '',
      count: data.count,
      code: 0,
    };
  }

  /**
     * 根据游戏id 获取房间信息
     */
  async findRoomByGameId() {
    const game_id = this.ctx.request.body.game_id;
    const result = await this.service.gameInfo.findRoomByGameId(game_id);
    this.ctx.body = {
      rooms: result,
    };
  }

}

module.exports = PlayerKillController;
