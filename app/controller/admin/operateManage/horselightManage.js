/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, SYSTEM, HORSE_LIGHT, OPERATION_TYPE_DELETE } = require('../../../tools/constant');
const qs = require('querystring');

class HorselightManageController extends Controller {
  async index() {
    const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('operateManage/horselight_manage', {
      title: '跑马灯管理',
      gameData: result,
    });
  }

  /**
         * 获取公告列表
         */
  async list() {
    const { game_id, title, page, limit } = this.ctx.query;
    const result = await this.service.horselight.findList(game_id, title, parseInt(page), parseInt(limit));
    console.log(JSON.parse(JSON.stringify(result)));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  /**
         * 根据id获取后台
         */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.horselight.findById(id);
    this.ctx.body = {
      status: 0,
      horselight: result,
    };
  }


  /**
         * 添加或者修改公告
         */
  async saveHorselight() {
    const params = this.ctx.request.body;
    if (params.action == 0) { // 添加公告
      params.create_operator = this.ctx.session.admin.username;
      const result = await this.service.horselight.addHorselight(params);
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, result, SYSTEM, HORSE_LIGHT);
    } else if (params.action == 1) { // 修改公告
      params.revise_operator = this.ctx.session.admin.username;
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, HORSE_LIGHT);
      await this.service.horselight.editHorselight(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
         * 根据id删除公告(软删除)
         */
  async deleteHorselight() {
    const id = this.ctx.request.body.id;
    await this.service.horselight.deleteHorselight(id);
    const params = { id };
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_DELETE, params, SYSTEM, HORSE_LIGHT);
    await this.service.recycleBin.saveRecycleBin(params, SYSTEM, HORSE_LIGHT);
    this.ctx.body = {
      status: 0,
    };
  }
  // /**
  //        * 根据id删除公告
  //        */
  // async deleteHorselight() {
  //   const id = this.ctx.request.body.id;
  //   await this.service.horselight.deleteHorselight(id);
  //   const params = { id };
  //   await this.service.operationLog.saveOperationLog(OPERATION_TYPE_DELETE, params, SYSTEM, HORSE_LIGHT);
  //   this.ctx.body = {
  //     status: 0,
  //   };
  // }

  /**
         * 查询所有游戏
         */
  async findGame() {
    const result = await this.service.gameInfo.findAllGame();
    this.ctx.body = {
      status: 0,
      games: result,
    };
  }
  /**
   * 修改用户状态
   */
  async horselightStatus() {
    try {
      const { id, status } = this.ctx.request.body;
      const user = await this.ctx.service.horselight.findById(id);
      const url = this.app.config.gameServerURl + 'updatePlayerStatus?' + qs.stringify({ account: user.username, status, agent: this.app.config.defualtPlatformId });
      await this.service.tools.sendServerGetRequest(url, 10000); // 更新服务器会员状态
      const a = await this.ctx.service.horselight.changeStatus(id, status); // 更新数据库会员状态
      console.log('aa', a);
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };

    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }
}

module.exports = HorselightManageController;
