'use strict';

const { Controller } = require('egg');
const sequelize = require('sequelize');
const moment = require('moment');

class PlatformHistoryDataController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_history_data', {
      title: '平台流水统计',
      platforms,
    });
  }

  /**
     * 获取平台上下分订单列表
     */
  async list() {
    const { platform_id, start_date, end_date, page, limit } = this.ctx.query;
    const result = await this.service.dataStatistics.platformData.findPlatformHistoryData(start_date, end_date, platform_id, parseInt(page), parseInt(limit));
    const curDate = moment().format('YYYY-MM-DD');
    let todayResult = [];

    if (curDate == end_date && result.rows.length < 10) {
      todayResult = await this.service.dataStatistics.platformData.findPlatformRealtimeData(platform_id);
      for (const t of todayResult) {
        t.create_time = curDate;
        result.rows.push(t);
      }
    }
    this.ctx.body = {
      data: result.rows,
      // res: data,
      msg: '',
      count: result.count + todayResult.length,
      code: 0,
    };
  }
  // 导出
  async export() {
    const { ctx } = this;
    const { platform_id, start_date, end_date } = ctx.request.body;
    const headers = [];
    const name = await this.service.platformInfo.findNickByPlatformId(platform_id);
    const condition = [
      { t: `平台:${+platform_id ? platform_id + '--' + name.platform_name : '所有平台'}`, m1: 'A1', m2: 'A1' },
      { t: `开始时间:${start_date}`, m1: 'B1', m2: 'B1' },
      { t: `结束时间:${end_date}`, m1: 'C1', m2: 'C1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '日期', f: 'create_time', totalRow: true },
      { t: '平台名称', f: 'platform', totalRow: true },
      { t: '总局数', f: 'total_games', totalRow: true },
      { t: '投注人数', f: 'bet_number', totalRow: true },
      { t: '总投注', f: 'total_bet', totalRow: true },
      { t: '平台盈利', f: 'last_win', totalRow: true },
      { t: '平台杀数', f: 'platform_kill_number', totalRow: true },
      { t: '抽水', f: 'pump', totalRow: true },
      { t: '人均投注', f: 'bet', totalRow: true },
      { t: '人均输赢', f: 'win_or_lose', totalRow: true },
      { t: '人均抽水', f: 'people_pump', totalRow: true },
      { t: '人均游戏时长', f: 'game_time', totalRow: true },
      { t: '赢局占比', f: 'win_bl', totalRow: true },
    ]);
    const result = await this.service.dataStatistics.platformData.findPlatformHistoryData(start_date, end_date, platform_id, null, null);

    const curDate = moment().format('YYYY-MM-DD');
    let todayResult = [];

    if (curDate == end_date && result.length < 10) {
      todayResult = await this.service.dataStatistics.platformData.findPlatformRealtimeData(platform_id);
      for (const t of todayResult) {
        t.create_time = curDate;
        result.push(t);
      }
    }
    const workbook = await this.service.exportExcel.generateExcel(headers, result.map(element => {
      element.platform = element.platform_info != null ? element.platform + '--' + element.platform_info.platform_name : '-';
      element.total_bet = (parseInt(element.valid_bet) / 100).toFixed(2);
      element.last_win = ((parseFloat((element.win_gold - element.lost_gold - element.deduct_gold) / 100)).toFixed(2) * -1).toFixed(2);
      element.platform_kill_number = typeof (parseFloat((element.win_gold - element.lost_gold) / element.valid_bet * -100).toFixed(2)) === 'number' || typeof (parseFloat((element.win_gold - element.lost_gold) / element.valid_bet * -100).toFixed(2)) === 'string' ? parseFloat((element.win_gold - element.lost_gold) / element.valid_bet * -100).toFixed(2) + '%' : '-';
      element.pump = (parseInt(element.deduct_gold) / 100).toFixed(2);
      element.bet = element.bet_number != 0 ? (parseInt(element.valid_bet / element.bet_number) / 100).toFixed(2) : '-';
      element.win_or_lose = element.bet_number != 0 ? parseInt((element.win_gold - element.lost_gold) / element.bet_number / 100).toFixed(2) : '-';
      element.people_pump = element.bet_number != 0 ? (parseInt(element.deduct_gold / element.bet_number) / 100).toFixed(2) : '-';
      element.game_time = element.bet_number != 0 ? (parseInt(element.duration) / element.bet_number).toFixed(2) : '-';
      element.win_bl = element.total_games ? (parseFloat(element.win_games / element.total_games) * 100).toFixed(2) + '%' : '0%';
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }

  /**
   * 修改交收状态,记录历史交手率
   */
  async changeStatus() {
    const { platform_id, date, rate } = this.ctx.request.body;
    await this.service.dataStatistics.platformData.updatePlatformStatus(platform_id, date, rate);
    this.ctx.body = {
      msg: '',
      code: 0,
      status: 0,
    };
  }

  async changeStatusAll() {
    const { ctx } = this;
    const { data } = ctx.request.body;
    const res = [];
    if (!data) {
      ctx.body = {
        msg: '没有需要交收的数据',
        status: 1,
      };
      return;
    }
    // console.log(ctx.request.body);
    for (const d of data) {
      res.push(this.service.dataStatistics.platformData.updatePlatformStatus(d.platform_id, d.date, d.rate));
    }
    await Promise.all(res);
    ctx.body = {
      msg: '',
      code: 0,
      status: 0,
    };
  }

  async changePlatStatus() {
    const { platform_id, date, rate } = this.ctx.request.body;
    await this.service.dataStatistics.platformData.updatePlatformStatus(platform_id, date, rate);
    this.ctx.body = {
      msg: '',
      code: 0,
      status: 0,
    };
  }

  async changePlatStatusAll() {
    const { ctx } = this;
    const { platform_id, data } = ctx.request.body;
    const res = [];
    if (!data) {
      ctx.body = {
        msg: '没有需要交收的数据',
        status: 1,
      };
      return;
    }
    for (const d of data) {
      res.push(this.service.dataStatistics.platformData.updatePlatformStatus(platform_id, d.date, d.rate));
    }
    await Promise.all(res);
    ctx.body = {
      msg: '',
      code: 0,
      status: 0,
    };
  }

  // 牌局明细渲染
  async cardIndex() {
    const { ctx } = this;
    const { platform_id } = ctx.query;
    const { date } = ctx.query;
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_card_data', {
      title: '会员牌局记录',
      platforms,
      platform_id,
      date,
    });
  }

  // 查询每天牌局详情
  async findCard() {
    const params = this.ctx.query;
    const result = await this.service.dataStatistics.platformData.findCard(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count[0].count,
      code: 0,
    };
  }

  // 牌局记录导出
  async cardExport() {
    const { ctx } = this;
    const { platform_id } = ctx.request.body;
    const { platformName } = ctx.request.body;
    // const { date } = ctx.request.body;
    const { start_date, end_date } = ctx.request.body;
    const TYPE = {
      1: '站点独立匹配',
      2: '平台匹配',
      3: '机器人匹配',
      4: '追杀',
      5: '放水',
      6: '公共',
      7: '高级追杀',
    };
    const headers = [];
    const condition = [
      { t: `平台:${platformName || ''}`, m1: 'A1', m2: 'A1' },
      { t: `开始时间:${start_date || ''}`, m1: 'B1', m2: 'B1' },
      { t: `结束时间:${end_date || ''}`, m1: 'C1', m2: 'C1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '开始时间', f: 'start_time', totalRow: true },
      { t: '游戏时长', f: 'duration', totalRow: true },
      { t: '牌局编号', f: 'game_no', totalRow: true },
      { t: '游戏名称', f: 'game_name', totalRow: true },
      { t: '房间名称', f: 'room_name', totalRow: true },
      { t: '房间模式', f: 'room_type', totalRow: true },
      { t: '会员账号', f: 'username', totalRow: true },
      { t: '平台', f: 'platform_name', totalRow: true },
      { t: '座位', f: 'pos_id', totalRow: true },
      { t: '会员投注', f: 'valid_bet', totalRow: true },
      { t: '会员输赢', f: 'profit', totalRow: true },
      { t: '抽水', f: 'deduct', totalRow: true },
    ]);
    const result = await this.service.dataStatistics.platformData.findCard({ platform_id, start_date, end_date });
    const workbook = await this.service.exportExcel.generateExcel(headers, result.rows.map(element => {
      // element = element.toJSON();
      element.platform_name = element.platform_name != null ? element.platform_name : '/';
      element.valid_bet = parseFloat((element.valid_bet / 100).toFixed(2));
      element.profit = parseFloat((element.profit / 100).toFixed(2));
      element.room_type = TYPE[element.room_type];
      element.deduct = parseFloat((element.deduct / 100).toFixed(2));
      element.duration = ((new Date(element.end_time).getTime() - new Date(element.start_time).getTime()) / 1000) + 's';
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }
}
module.exports = PlatformHistoryDataController;
