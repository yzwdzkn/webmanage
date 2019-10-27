'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const moment = require('moment');

class GameStatusController extends Controller {
  async index() {
    const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('dataManage/card_game_query', {
      title: '玩家对局日志',
      gameData: result,
    });
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

  /**
   * 获取房间和游戏的列表数据
   */
  async list() {
    // let { start_time , end_time , game_id , room_id , username , game_no } = this.ctx.query;
    const params = this.ctx.query;
    const start_time = moment(new Date(params.start_time));
    const end_time = moment(new Date(params.end_time));
    if (end_time.unix() < start_time.unix()) {
      this.ctx.body = {
        data: [],
        msg: '结束时间小于开始时间',
        count: 0,
        code: 1,
      };
      return;
    }
    if (start_time.month() != end_time.month()) {
      this.ctx.body = {
        data: [],
        msg: '开始时间和结束时间必须是同月,不能跨月查询！',
        count: 0,
        code: 2,
      };
      return;
    }
    const result = await this.service.dataStatistics.gameRecord.findAndCount(params);
    this.ctx.body = {
      data: result[0],
      msg: '',
      count: result[1][0].count,
      code: 0,
    };
  }

  /**
   * 根据房间编号查询游戏记录
   */
  async findByGameNo() {
    const game_no = this.ctx.query.game_no;
    const result = await this.service.dataStatistics.gameRecord.findByGameNo(game_no);
    this.ctx.body = {
      status: 0,
      record: result.length > 0 ? result[0] : null,
    };
  }
}

module.exports = GameStatusController;
