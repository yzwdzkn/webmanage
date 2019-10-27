'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const { SYSTEM, GAME_INFO } = require('../../../tools/constant');
class GameStatusController extends Controller {
  async index() {
    await this.ctx.render('/gameManage/game_manage', {
      title: '游戏设置',
    });
  }

  /**
     * 获取所有游戏的列表
     */
  async list() {
    const result = await this.service.gameInfo.gameList();
    this.ctx.body = {
      data: result,
      msg: '',
      count: result.length,
      code: 0,
    };
  }

  /**
     * 根据id查询游戏
     */
  async findGameById() {
    const game_id = this.ctx.request.body.game_id;
    const result = await this.service.gameInfo.findGameById(game_id);
    this.ctx.body = {
      status: 0,
      game: result,
    };
  }

  /**
     * 添加游戏
     */
  async saveAddGame() {
    const { game_id, game_name, game_code, status } = this.ctx.request.body;
    const result = await this.service.gameInfo.findGameById(game_id); // 查询这个游戏id是否存在了
    if (result) {
      this.ctx.body = {
        status: 1,
        msg: '该【' + game_id + '】游戏ID已存在！',
      };
      return;
    }
    await this.service.gameInfo.AddGame({ game_id, game_name, game_code, status });
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 修改游戏
     */
  async saveEditGame() {
    const { game_id, game_name, game_code, status } = this.ctx.request.body;
    await this.service.gameInfo.editGame({ game_id, game_name, game_code, status });
    if (status == 1) {
      await this.service.platformGame.changeStatusAll(game_id);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id删除游戏(软删除)
     */
  async deleteGame() {
    const game_id = this.ctx.request.body.game_id;
    const result = await this.service.gameInfo.findRoomByGameId(game_id);
    if (result.length != 0) {
      this.ctx.body = {
        status: 1,
        msg: '该游戏下有房间,不能删除！',
      };
      return;
    }
    await this.service.gameInfo.deleteGame(game_id);
    const params = { id: game_id };
    await this.service.recycleBin.saveRecycleBin(params, SYSTEM, GAME_INFO);
    this.ctx.body = {
      status: 0,
    };
  }
  /**
     * 根据id删除游戏
     */
  // async deleteGame() {
  //   const game_id = this.ctx.request.body.game_id;
  //   const result = await this.service.gameInfo.findRoomByGameId(game_id);
  //   if (result.length != 0) {
  //     this.ctx.body = {
  //       status: 1,
  //       msg: '该游戏下有房间,不能删除！',
  //     };
  //     return;
  //   }
  //   await this.service.gameInfo.deleteGame(game_id);
  //   this.ctx.body = {
  //     status: 0,
  //   };
  // }
}

module.exports = GameStatusController;
