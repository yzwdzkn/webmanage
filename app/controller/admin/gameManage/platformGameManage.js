'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const qs = require('querystring');
class PlatformGameController extends Controller {
  /**
     * 获取所有游戏的列表
     */
  async list() {
    const { platform_id } = this.ctx.request.query;
    const result = await this.service.platformGame.list(platform_id);
    this.ctx.body = {
      data: result,
      msg: '',
      count: result.length,
      code: 0,
    };
  }

  async add() {
    const { game_id, game_sort, game_tag, status, platform_id } = this.ctx.request.body;
    const result = await this.ctx.service.platformGame.findGameById(game_id, platform_id);
    const host = this.app.config.gameServerURl;
    if (result) {
      this.ctx.body = { status: 1, msg: '该游戏已经添加' };
      return;
    }
    await this.service.platformGame.add({ game_id, game_sort, game_tag, status, platform_id });
    const params = {
      gameId: game_id,
      agent: platform_id,
      gameSort: game_sort,
      type: game_tag,
    };
    const str = qs.stringify(params);
    const url = `${host}?${str}`;
    await this.service.tools.sendServerGetRequest(url, 5000);
    this.ctx.body = {
      status: 0,
    };
  }

  async edit() {
    const { game_id, game_sort, game_tag, status, platform_id } = this.ctx.request.body;
    const host = this.app.config.gameServerURl;
    await this.service.platformGame.edit({ game_id, game_sort, game_tag, status, platform_id });
    const params = {
      gameId: game_id,
      agent: platform_id,
      gameSort: game_sort,
      type: game_tag,
      status,
    };
    const str = qs.stringify(params);
    const url = `${host}setGameStatus?${str}`;
    console.log('url:', url);
    await this.service.tools.sendServerGetRequest(url, 5000);
    this.ctx.body = {
      status: 0,
    };
  }

  async delete() {
    const { game_id, platform_id } = this.ctx.request.body;
    await this.service.platformGame.delete(game_id, platform_id);
    this.ctx.body = {
      status: 0,
    };
  }

  /**
     * 根据id查询游戏
     */
  async findGameById() {
    const { game_id, platform_id } = this.ctx.request.query;
    console.log('##: ', this.ctx.request.query);
    const result = await this.service.platformGame.findGameById(game_id, platform_id);
    this.ctx.body = {
      status: 0,
      game: result,
    };
  }
}

module.exports = PlatformGameController;
