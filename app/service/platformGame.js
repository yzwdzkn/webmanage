/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
// const util = require('util');
class PlatfromGameService extends Service {

  /**
     * 获取所以游戏信息
     */
  async list(platform_id) {
    const a = await this.ctx.model.PlatformGame.findAll(
      { where: { platform_id },
        order: [[ 'game_sort', 'asc' ]],
        include: [
          {
            model: this.ctx.model.GameInfo,
            attributes: [ 'game_name' ],
          },
        ] }
    );
    return a;
  }

  async add(params) {
    return await this.ctx.model.PlatformGame.create(params);
  }

  async edit(params) {
    // console.log('###################: ', params);
    return await this.ctx.model.PlatformGame.update(
      params,
      { where: { platform_id: params.platform_id, game_id: params.game_id } }
    );
  }

  async changeStatusAll(game_id) {
    return await this.ctx.model.PlatformGame.update(
      { status: 1 },
      { where: { game_id } }
    );
  }

  async delete(game_id, platform_id) {
    return await this.ctx.model.PlatformGame.destroy(
      { where: { game_id, platform_id } }
    );
  }

  async findGameById(game_id, platform_id) {
    return await this.ctx.model.PlatformGame.findOne(
      { where: { platform_id, game_id } }
    );
  }
}

module.exports = PlatfromGameService;
