'use strict';

const Controller = require('egg').Controller;
const { OPERATION_TYPE_UPDATE, SYSTEM, ROOM_KILL } = require('../../../tools/constant');

class GlobalKillController extends Controller {

  async index() {
    const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('riskManagement/room_kill', {
      title: '房间杀放',
      gameData: result,
    });
  }

  /**
     * 获取所有游戏的杀数列表
     */
  async list() {
    const { game_id, page, limit } = this.ctx.query;
    const result = await this.service.killNumber.findRoomKill(game_id, page, limit);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
     * 根据游戏id获取杀数信息
     */
  async getGameKill() {
    const room_id = this.ctx.request.body.room_id;
    const result = await this.service.killNumber.getGameKill(room_id);
    this.ctx.body = {
      status: 0,
      gameKill: result,
    };
  }

  /**
     * 保存全局杀数
     */
  async saveGameKill() {
    let { room_id, room_name, kill_number } = this.ctx.request.body;
    const params = this.ctx.request.body;
    const host = this.app.config.gameServerURl;
    params.id = room_id;
    if (kill_number === '' || kill_number === undefined) {
      kill_number = null;
    }
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, ROOM_KILL);
    await this.service.killNumber.saveRoomKill(room_id, kill_number, room_name);
    const url = `${host}/saveGameKill?kill_number=${kill_number}`;
    try {
      this.service.tools.sendServerGetRequest(url, 5000);
    } catch (error) {
      this.ctx.logger.error(error);
    }
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = GlobalKillController;
