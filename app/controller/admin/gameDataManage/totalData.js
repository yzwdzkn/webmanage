'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
class totalDataController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('gameDataManage/total_data', {
      title: '数据总览',
      platforms,
    });
  }
  async initData_test() {
    const type = parseInt(this.ctx.query.type);
    const date = this.ctx.query.date || moment();
    const { platform_id } = this.ctx.query;
    const { start_date, end_date } = this._getEndDate(type, date);
    console.log(`${type}: ${start_date}:${end_date}`);
    const resultData = await this.ctx.service.timerService.timerOperation_bk(platform_id, type, start_date, end_date);
    this.ctx.body = {
      data: resultData,
    };
  }

  async initData() {
    const date = this.ctx.query.date || moment();
    const { platform_id } = this.ctx.query;
    let { start_date, end_date } = this._getEndDate(1, date);
    let today = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 今日
    const b = this._getEndDate(2, date);
    start_date = b.start_date;
    end_date = b.end_date;
    let yesterday = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 昨日
    const c = this._getEndDate(3, date);
    start_date = c.start_date;
    end_date = c.end_date;
    let week = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 本周
    const d = this._getEndDate(4, date);
    start_date = d.start_date;
    end_date = d.end_date;
    let lastWeek = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 上周
    const e = this._getEndDate(5, date);
    start_date = e.start_date;
    end_date = e.end_date;
    let month = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 本月
    const f = this._getEndDate(6, date);
    start_date = f.start_date;
    end_date = f.end_date;
    let lastMonth = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 上月
    const g = this._getEndDate(7, date);
    start_date = g.start_date;
    end_date = g.end_date;
    let everyDay = this.ctx.service.timerService.timerOperation(platform_id, start_date, end_date); // 每日
    let month_gold = 0;

    [ today, yesterday, week, lastWeek, month, lastMonth, everyDay ] = await Promise.all([ today, yesterday, week, lastWeek, month, lastMonth, everyDay ]);

    if (platform_id) { // 指定平台
      const platformInfo = await this.ctx.service.platformInfo.findById(platform_id);
      const rate = platformInfo.rate;
      const e = this._getEndDate(5, date);
      const month_start_date = e.start_date;
      const month_end_date = e.end_date;
      const data = await this.service.dataStatistics.platformData.getDataByMonth(month_start_date, month_end_date);
      Object.keys(data).forEach(key => {
        if (key == platform_id) {
          month_gold = data[key] * rate / 100;
        }
      });
    } else { // 所有平台
      const rows = await this.ctx.service.platformInfo.findPlatformByStatus(0);
      const objRate = {};
      for (const row of rows) {
        objRate[row.platform_id] = row.rate;
      }
      const e = this._getEndDate(5, date);
      const month_start_date = e.start_date;
      const month_end_date = e.end_date;
      const data = await this.service.dataStatistics.platformData.getDataByMonth(month_start_date, month_end_date);
      Object.keys(data).forEach(key => {
        month_gold += data[key] * (objRate[key] || 0) / 100;
      });
    }

    /** ************************************ 表头数据 *****************************************/
    const bet_number = today.bet_number; // 今日投注人数
    const lost_gold = today.lost_gold - today.win_gold + today.deduct_gold; // 今日总盈利
    const kill = lost_gold / today.valid_bet; // 今日杀数==> 输赢 / 总投注
    const month_lost_gold = month.lost_gold - month.win_gold + month.deduct_gold; // 本月总盈利
    // const month_gold = '--'; // 本月待交收金额
    const usr_number = await this.ctx.service.user.getUserCount(platform_id); // 会员总人数
    const { valid_bet, lost_win } = await this.ctx.service.dataStatistics.platformData.getHistoryBet(platform_id); // 历史总投注,历史总输赢
    const his_kill = lost_win / valid_bet; // 历史平均杀数

    /** ************************************ 表数据 *****************************************/

    // 1.登录会员数 2:新增会员数 3.新增投注率 (new_bet_number/register_count) 4.总投注人数 5.总投注额 6.总抽水额 7.平台盈利 8.杀数
    const respData = {
      /* 表头数据*/
      bet_number,
      kill,
      lost_gold,
      month_lost_gold,
      month_gold,
      usr_number,
      valid_bet,
      lost_win,
      his_kill,
      /* 表数据 */
      today: { // 今日
        date,
        user_login_count: today.user_login_number[0].count, // 登录会员数
        register_count: today.register_count, // 新增会员数
        new_bet_number: today.new_bet_number, // 新增投注率
        bet_number: today.bet_number, // 总投注人数
        valid_bet: today.valid_bet, // 总投注金额
        deduct_gold: today.deduct_gold, // 总抽水
        platform_makeMoney: today.platform_makeMoney, // 平台盈利
        his_kill_count: today.his_kill_count, // 杀数
      },
      yesterdayRate: {
        date,
        user_login_count: (today.user_login_number[0].count - yesterday.user_login_number[0].count) / yesterday.user_login_number[0].count, // 登录会员数
        register_count: (today.register_count - yesterday.register_count) / yesterday.register_count, // 新增会员数
        new_bet_number: (today.new_bet_number - yesterday.new_bet_number) / yesterday.new_bet_number, // 新增投注率
        bet_number: (today.bet_number - yesterday.bet_number) / yesterday.bet_number, // 总投注人数
        valid_bet: (today.valid_bet - yesterday.valid_bet) / yesterday.valid_bet, // 总投注金额
        deduct_gold: (today.deduct_gold - yesterday.deduct_gold) / yesterday.deduct_gold, // 总抽水
        platform_makeMoney: (today.platform_makeMoney - yesterday.platform_makeMoney) / yesterday.platform_makeMoney, // 平台盈利
        his_kill_count: (today.his_kill_count - yesterday.his_kill_count) / yesterday.his_kill_count, // 杀数
      }, // 环比上日
      historyRate: { // 同比历史每日
        date,
        user_login_count: (today.user_login_number[0].count - everyDay.user_login_number[0].count) / everyDay.user_login_number[0].count, // 登录会员数
        register_count: (today.register_count - everyDay.register_count) / everyDay.register_count, // 新增会员数
        new_bet_number: (today.new_bet_number - everyDay.new_bet_number) / everyDay.new_bet_number, // 新增投注率
        bet_number: (today.bet_number - everyDay.bet_number) / everyDay.bet_number, // 总投注人数
        valid_bet: (today.valid_bet - everyDay.valid_bet) / everyDay.valid_bet, // 总投注金额
        deduct_gold: (today.deduct_gold - everyDay.deduct_gold) / everyDay.deduct_gold, // 总抽水
        platform_makeMoney: (today.platform_makeMoney - everyDay.platform_makeMoney) / everyDay.platform_makeMoney, // 平台盈利
        his_kill_count: (today.his_kill_count - everyDay.his_kill_count) / everyDay.his_kill_count, // 杀数
      },
      week: { // 本周
        date,
        user_login_count: week.user_login_number[0].count, // 登录会员数
        register_count: week.register_count, // 新增会员数
        new_bet_number: week.new_bet_number, // 新增投注率
        bet_number: week.bet_number, // 总投注人数
        valid_bet: week.valid_bet, // 总投注金额
        deduct_gold: week.deduct_gold, // 总抽水
        platform_makeMoney: week.platform_makeMoney, // 平台盈利
        his_kill_count: week.his_kill_count, // 杀数
      },
      lastWeekRate: { // 环比上周
        date,
        user_login_count: (week.user_login_number[0].count - lastWeek.user_login_number[0].count) / lastWeek.user_login_number[0].count, // 登录会员数
        register_count: (week.register_count - lastWeek.register_count) / lastWeek.register_count, // 新增会员数
        new_bet_number: (week.new_bet_number - lastWeek.new_bet_number) / lastWeek.new_bet_number, // 新增投注率
        bet_number: (week.bet_number - lastWeek.bet_number) / lastWeek.bet_number, // 总投注人数
        valid_bet: (week.valid_bet - lastWeek.valid_bet) / lastWeek.valid_bet, // 总投注金额
        deduct_gold: (week.deduct_gold - lastWeek.deduct_gold) / lastWeek.deduct_gold, // 总抽水
        platform_makeMoney: (week.platform_makeMoney - lastWeek.platform_makeMoney) / lastWeek.platform_makeMoney, // 平台盈利
        his_kill_count: (week.his_kill_count - lastWeek.his_kill_count) / lastWeek.his_kill_count, // 杀数
      },
      month: { // 当月
        date,
        user_login_count: month.user_login_number[0].count, // 登录会员数
        register_count: month.register_count, // 新增会员数
        new_bet_number: month.new_bet_number, // 新增投注率
        bet_number: month.bet_number, // 总投注人数
        valid_bet: month.valid_bet, // 总投注金额
        deduct_gold: month.deduct_gold, // 总抽水
        platform_makeMoney: month.platform_makeMoney, // 平台盈利
        his_kill_count: month.his_kill_count, // 杀数
      },
      lastMonthRate: { // 环比上月
        date,
        user_login_count: (month.user_login_number[0].count - lastMonth.user_login_number[0].count) / lastMonth.user_login_number[0].count, // 登录会员数
        register_count: (month.register_count - lastMonth.register_count) / lastMonth.register_count, // 新增会员数
        new_bet_number: (month.new_bet_number - lastMonth.new_bet_number) / lastMonth.new_bet_number, // 新增投注率
        bet_number: (month.bet_number - lastMonth.bet_number) / lastMonth.bet_number, // 总投注人数
        valid_bet: (month.valid_bet - lastMonth.valid_bet) / lastMonth.valid_bet, // 总投注金额
        deduct_gold: (month.deduct_gold - lastMonth.deduct_gold) / lastMonth.deduct_gold, // 总抽水
        platform_makeMoney: (month.platform_makeMoney - lastMonth.platform_makeMoney) / lastMonth.platform_makeMoney, // 平台盈利
        his_kill_count: (month.his_kill_count - lastMonth.his_kill_count) / lastMonth.his_kill_count, // 杀数
      },
    };
    let res;
    try {
      res = respData.toJSON();
    } catch (err) {
      res = respData;
    }
    this.ctx.body = {
      data: res,
    };
  }

  _getEndDate(type, date) {
    let start_date;
    let end_date;
    switch (type) {
      case 1: // 今日
        start_date = moment(date).startOf('day').startOf('day');
        end_date = moment(date).endOf('day');
        break;
      case 2: // 昨日
        start_date = moment(date).subtract(1, 'day').startOf('day');
        end_date = moment(date).subtract(1, 'day').endOf('day');
        // end_date = moment(date).subtract(1, 'day'); // 同比昨日为当时的时间点
        break;
      case 3: // 本周
        start_date = moment(date).startOf('week');
        end_date = moment(date).endOf('week');
        break;
      case 4: // 上周
        start_date = moment(date).subtract(7, 'day').startOf('week');
        end_date = moment(date).subtract(7, 'day').endOf('week');
        break;
      case 5: // 本月
        start_date = moment(date).startOf('month');
        end_date = moment(date).endOf('month');
        break;
      case 6:
        start_date = moment(date).subtract(1, 'month').startOf('month');
        end_date = moment(date).subtract(1, 'month').endOf('month');
        break;
      case 7:
        start_date = moment('2000-01-01');
        end_date = moment();
        break;
      default:
        console.log('type类型错误');
        throw new Error('tpye 类型错误');
    }
    return { start_date, end_date };
  }

  async registerNum() {
    const { ctx } = this;
    const { limit = 30 } = ctx.query;
    const { platformId } = ctx.query;
    const { startDate } = ctx.query;
    const { endDate } = ctx.query;
    const res = await this.ctx.service.totalDataService.registerNum(limit, platformId, startDate, endDate);
    const days = [];
    for (let i = limit; i >= 0; i -= 1) {
      const day = moment(endDate || new Date()).subtract(i, 'days').format('YYYY-MM-DD');
      if (startDate && moment(day).diff(startDate) < 0) continue;
      days.push(day);
    }
    const data = {};
    const total = [];
    for (const day of days) {
      if (!data[day]) {
        data[day] = 0;
      }
      res.forEach(element => {
        if (moment(element.createdate).format('YYYY-MM-DD') === day) {
          data[day] += element.total;
        }
      });
      total.push(data[day]);
    }
    ctx.body = {
      code: 0,
      data: {
        days,
        total,
      },
    };
  }

  async getOnlineNumberByMonth() {
    const { ctx } = this;
    try {
      const { startDate } = ctx.query;
      const { endDate } = ctx.query;
      const result = await this.ctx.service.userOnline.getOnlineNumberByMonth(startDate, endDate);
      const day = [];
      const value = [];
      const diff = moment(endDate).diff(startDate, 'days');
      console.log(diff);
      for (let i = diff; i > 0; i -= 1) {
        const a = moment(endDate || new Date()).subtract(i, 'days').format('YYYY-MM-DD');
        day.push(a);
        let b = true;
        for (const res of result) {
          if (res.date === a) {
            value.push(res.number);
            b = false;
            break;
          }
        }
        if (b) value.push(0);
      }
      ctx.body = { data: { day, value }, msg: '', code: 0 };
    } catch (error) {
      console.log(error);
      ctx.body = { data: '', msg: '', status: '' };
    }
  }
}

module.exports = totalDataController;
