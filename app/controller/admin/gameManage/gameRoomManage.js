'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

// const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, OPERATION_TYPE_DELETE, SYSTEM, GAME } = require('../../../tools/constant');

class GameStatusController extends Controller {
  async index() {
    const gameList = await this.service.gameInfo.findAllGame();
    await this.ctx.render('gameManage/game_room_manage', {
      title: '房间设置',
      gameList,
    });
  }

  /**
     * 获取所有游戏房间的列表
     */
  async list() {
    const { game_id, page, limit } = this.ctx.request.query;
    const { rows, count } = await this.service.gameRoom.list(game_id, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: rows,
      msg: '',
      count,
      code: 0,
    };
  }

  /**
     * 添加游戏房间
     */
  async saveGameRoom() {
    // const { game_id } = this.ctx.request.body;
    const params = this.ctx.request.body;
    console.log(params);
    const row = await this.service.gameRoom.getRoomById(params.room_id);
    if (row) {
      this.ctx.body = {
        status: '1',
        msg: '房间id已存在',
      };
      return;
    }
    await this.service.gameRoom.create(params);
    // row.id = row.game_id;
    // await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, row, SYSTEM, GAME);
    this.ctx.body = {
      status: 0,
    };
  }

  async findRoomById() {
    const { room_id } = this.ctx.request.query;
    const result = await this.ctx.service.gameRoom.getRoomById(room_id);
    this.ctx.body = {
      data: result,
      status: 0,
    };
  }
  /**
     * 修改游戏房间信息
     */
  async editRoom() {
    const params = this.ctx.request.body;
    console.log('params: ', params);
    // await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, GAME);
    // delete params.id;
    console.log('params#############: ', params);
    await this.service.gameRoom.editRoom(params);
    this.ctx.body = {
      status: 0,
    };
  }


  /**
   * 以下为B端的请求
   */
  /**
     * 获取所有游戏房间的列表
     */
  async listB() {
    const { game_id, page, limit } = this.ctx.request.query;
    const { rows, count } = await this.service.gameRoom.listB(game_id, parseInt(page), parseInt(limit));


    this.ctx.body = {
      data: rows,
      msg: '',
      count,
      code: 0,
    };
  }
  async findRoomByIdB() {
    const { game_id } = this.ctx.request.query;
    const { rows, count } = await this.service.gameRoom.roomListB(game_id);


    this.ctx.body = {
      data: rows,
      msg: '',
      count,
      code: 0,
    };
  }
  async editRoomB() {
    const { params } = this.ctx.request.body;
    // await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, GAME);
    // delete params.id;
    await this.service.gameRoom.editRoomB(params);
    this.ctx.body = {
      status: 0,
    };
  }
}

module.exports = GameStatusController;
