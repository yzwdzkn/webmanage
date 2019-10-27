'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const moment = require('moment');
class PlatformTotalManageController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_total_manage', {
      title: '平台账单结算',
      platforms,
    });
  }

  /**
     * 获取平台上下分订单列表
     */
  async list() {
    const { ctx } = this;
    let { platform_id, start_date, end_date, page, limit } = ctx.query;
    if (start_date === '' || end_date === '') {
      start_date = moment().format('YYYY-MM-DD');
      end_date = start_date;
    }
    const result = await this.service.platformOrder.findTotalList(start_date, end_date, platform_id, parseInt(page), parseInt(limit));
    const today = moment().format('YYYY-MM-DD');
    const length = result.rows.length - 1;

    if (length >= 0 && result.rows[length].date >= today) { // 拼接今天数据
      const todayData = await this.service.dataStatistics.platformData.getPlatformDataAll();
      const item = todayData[result.rows[length].platform_id];
      if (item) {
        result.rows[length].deduct_gold = item.deductGold || 0;
        result.rows[length].duration = item.duration || 0;
        result.rows[length].insert_time = '';
        result.rows[length].lost_games = item.lostGames || 0;
        result.rows[length].lost_gold = item.lostGold || 0;
        result.rows[length].total_games = item.totalGames || 0;
        result.rows[length].valid_bet = item.validBet || 0;
        result.rows[length].win_games = item.winGames || 0;
        result.rows[length].win_gold = item.winGold || 0;
      } else {
        result.rows[length].deduct_gold = 0;
        result.rows[length].duration = 0;
        result.rows[length].insert_time = '';
        result.rows[length].lost_games = 0;
        result.rows[length].lost_gold = 0;
        result.rows[length].total_games = 0;
        result.rows[length].valid_bet = 0;
        result.rows[length].win_games = 0;
        result.rows[length].win_gold = 0;
      }

    }
    ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  /**
 * 代理上下分名单
 */
  async agentSettlement() {
    const { ctx } = this;
    let { platform_id, start_date, end_date, agent } = ctx.query;
    if (start_date === '' || end_date === '') {
      start_date = moment().format('YYYY-MM-DD');
      end_date = start_date;
    }
    const result = await this.service.platformOrder.findAgentList(start_date, end_date, platform_id, agent);
    ctx.body = result;
  }

  /**
   * 平台报表数据 dq 10-14
   */
  async listReport() {
    try {
      const platform_id = this.ctx.query.platform_id;
      if (platform_id) {
        const result = await this.service.platformOrder.listReport(platform_id);
        this.ctx.body = {
          data: result,
          msg: '',
          code: 0,
        };
        return;
      }
    } catch (error) {
      console.error('error:', error);
    }
    this.ctx.body = {
      data: [],
      msg: '参数错误',
      code: 0,
    };

  }

  // 导出
  async export() {
    const { ctx } = this;
    let { platform_id, start_date, end_date, isA } = ctx.request.body;
    if (start_date === '' || end_date === '') {
      start_date = moment().format('YYYY-MM-DD');
      end_date = start_date;
    }
    const data = await this.service.platformOrder.findTotalList(start_date, end_date, platform_id);
    const name = await this.service.platformInfo.findNickByPlatformId(platform_id);
    if (isA) {
      ctx.body = data;
      return;
    }
    const headers = [];
    const condition = [
      { t: `平台:${+platform_id ? platform_id + '--' + name.platform_name : '所有平台'}`, m1: 'A1', m2: 'A1' },
      { t: `开始时间:${start_date}`, m1: 'B1', m2: 'B1' },
      { t: `结束时间:${end_date}`, m1: 'C1', m2: 'C1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '时间', f: 'date', totalRow: true },
      // { t: '平台ID', f: 'platform_id', totalRow: true },
      { t: '平台名称', f: 'platform_name', totalRow: true },
      { t: '交易金额', f: 'add_score', totalRow: true },
      { t: '账前金额', f: 'pre_score', totalRow: true },
      { t: '账后金额', f: 'current_score', totalRow: true },
      { t: '分成比例', f: 'rate', totalRow: true },
      { t: '平台盈利', f: 'platform_gold', totalRow: true },
      { t: '交收金额', f: 'gold', totalRow: true },
      { t: '交收状态', f: 'status', totalRow: true },
    ]);
    if (platform_id) {
      condition['平台'] = platform_id;
    } else {
      condition['平台'] = '所有平台';
    }
    if (start_date) {
      condition['开始时间'] = start_date;
    }
    if (end_date) {
      condition['结束时间'] = end_date;
    }
    const workbook = await this.service.exportExcel.generateExcel(headers, data.map(element => {
      element.pre_score = parseFloat(element.pre / 100).toFixed(2) || 0;
      element.add_score = parseFloat((element.current - element.pre) / 100).toFixed(2);
      element.current_score = parseFloat(element.current / 100).toFixed(2);
      element.platform_name = element.platform_id + '--' + element.platform_name;
      if (element.status == 1) {
        element.rate += '%';
      } else if (element.status == 0) {
        element.rate = element.platRate + '%';
      } else {
        element.rate = '-';
      }
      element.platform_gold = ((element.lost_gold - element.win_gold + element.valid_bet) / 100).toFixed(2);
      element.gold = (((element.win_gold - element.lost_gold) / 100).toFixed(2) * -1) <= 0 ? '-' : ((element.win_gold - element.lost_gold) / 100).toFixed(2) * -1;
      const lost_win = ((element.win_gold - element.lost_gold) / 100).toFixed(2) * -1;
      if (lost_win <= 0) {
        element.gold = '-';
      }
      if (element.status == 1) {
        element.gold = (element.rate * lost_win / 100).toFixed(2) || '-';
      } else {
        element.gold = (element.platRate * lost_win / 100).toFixed(2) || '-';
      }
      if (element.status == 1) {
        element.status = '已交收';
      } else if (element.status == 0) {
        element.status = '交收';
      } else {
        element.status = '-';
      }


      return element;
    }), condition);
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }

}

module.exports = PlatformTotalManageController;
