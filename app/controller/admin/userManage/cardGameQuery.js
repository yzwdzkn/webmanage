'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const moment = require('moment');

class GameStatusController extends Controller {
  async index() {
    const username = this.ctx.query.username || '';
    const platforms = await this.ctx.service.platformInfo.findPlatformByStatus(0);
    const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('userManage/card_game_query', {
      title: '会员牌局详情',
      gameData: result,
      platforms,
      username,
    });
  }

  async indexByUser() {
    const username = this.ctx.query.username || '';
    const platform_id = this.ctx.query.platform_id || '';
    const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('userManage/card_game_query_by_user', {
      title: '会员牌局详情',
      gameData: result,
      platform_id,
      username,
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
    let params = {};
    if (this.ctx.method == 'GET') {
      params = this.ctx.query;
    } else {
      params = this.ctx.request.body;
    }
    console.log('params: ', params);
    const tableName = 'game_record_' + moment(new Date(params.start_time)).utcOffset(8).format('YYYYMM');
    const start_time = moment(new Date(params.start_time));
    const end_time = moment(new Date(params.end_time));
    console.log('start_time: ', start_time);
    console.log('end_time: ', end_time);

    try {
      if (params.start_time == '' || params.end_time == '') {
        this.ctx.body = {
          data: [],
          msg: '开始时间和结束时间不能为空！',
          count: 0,
          code: 1,
        };
        return;
      }
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
    } catch (error) {
      if (error.message == `Table '${this.app.config.sequelize.database}.` + tableName + "' doesn't exist") {
        this.ctx.body = {
          data: [],
          msg: '无数据',
          count: 0,
          code: 1,
        };
      } else {
        this.ctx.body = {
          data: [],
          msg: '参数错误',
          count: 0,
          code: 1,
        };
      }
      return;
    }

  }
  // 导出
  async export() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log('params: ', params);
    const headers = [];
    const condition = [
      { t: `平台:${params.platform_name}`, m1: 'A1', m2: 'A1' },
      { t: `游戏:${params.game_name || '所有游戏'}`, m1: 'B1', m2: 'B1' },
      { t: `房间:${params.room_name || '所有房间'}`, m1: 'C1', m2: 'C1' },
      { t: `开始时间:${params.start_time}`, m1: 'D1', m2: 'D1' },
      { t: `结束时间:${params.end_time}`, m1: 'E1', m2: 'E1' },
      { t: `会员名称:${params.username}`, m1: 'F1', m2: 'F1' },
      { t: `牌局编号:${params.game_no}`, m1: 'G1', m2: 'G1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '开始时间', f: 'start_time', totalRow: true },
      { t: '游戏时长', f: 'end_time', totalRow: true },
      { t: '牌局编号', f: 'game_no', totalRow: true },
      { t: '游戏名称', f: 'game_name', totalRow: true },
      { t: '房间名称', f: 'room_name', totalRow: true },
      { t: '房间模式', f: 'room_type', totalRow: true },
      { t: '玩家', f: 'username', totalRow: true },
      { t: '平台', f: 'platform_name', totalRow: true },
      { t: '座位号', f: 'pos_id', totalRow: true },
      // { t: '庄闲', f: 'banker', totalRow: true },
      { t: '会员投注', f: 'valid_bet', totalRow: true },
      { t: '会员输赢', f: 'profit', totalRow: true },
      { t: '抽水', f: 'deduct', totalRow: true },
    ]);
    const data = await this.service.dataStatistics.gameRecord.findAndCount(params);
    const workbook = await this.service.exportExcel.generateExcel(headers, data[0].map(element => {
      // element = element.toJSON();
      switch (element.room_type) {
        case 1: element.room_type = '站点独立匹配'; break;
        case 2: element.room_type = '平台匹配'; break;
        case 3: element.room_type = '机器人匹配'; break;
        case 4: element.room_type = '追杀'; break;
        case 5: element.room_type = '放水'; break;
        case 6: element.room_type = '公共'; break;
        case 7: element.room_type = '高级追杀'; break;
        default: element.room_type = '未知:' + element.room_type;
      }
      element.platform_name = element.platform_name != null ? element.platform_name : '/';
      element.banker = (element.banker && element.banker == element.pos_id) ? '庄' : '闲';
      element.valid_bet = parseFloat((element.valid_bet / 100).toFixed(2));
      element.profit = parseFloat((element.profit / 100).toFixed(2));
      element.deduct = parseFloat((element.deduct / 100).toFixed(2));
      element.end_time = ((new Date(element.end_time).getTime() - new Date(element.start_time).getTime()) / 1000) + 's';
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }


  /**
   * 根据房间编号查询游戏记录
   */
  async findByGameNo() {
    const game_no = this.ctx.query.game_no;
    const platform_id = this.ctx.query.platform_id;
    const result = await this.service.dataStatistics.gameRecord.findByGameNo(game_no, platform_id);
    this.ctx.body = {
      status: 0,
      record: result.length > 0 ? result[0] : null,
    };
  }
}

module.exports = GameStatusController;
