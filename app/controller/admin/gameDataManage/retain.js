'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');

class retainController extends Controller {
  async index() {
    const [ platforms, rate, todayLogin, platformDataAll ] = await Promise.all([
      this.ctx.service.platformInfo.findListByStatus(0),
      this.ctx.service.userLoginHall.getRetainTotal(), // 总留存
      this.service.userLoginHall.getTodayLogin(), // 今日登录
      this.service.dataStatistics.platformData.getPlatformDataAll(),
    ]);
    let bet_number = 0; // 今日活跃
    Object.keys(platformDataAll).forEach(item => {
      if (item !== 'timestamp') {
        bet_number += platformDataAll[item].betNumber;
      }
    });
    await this.ctx.render('gameDataManage/retain', {
      title: '会员留存',
      platforms,
      total: rate,
      todayLogin,
      bet_number,
    });
  }

  async list() {
    try {
      const { start_date, end_date, platformId } = this.ctx.query;

      const [ result, betNumberData, platformDataAll, loginData, userRegister ] = await Promise.all([
        this.service.userLoginHall.getRetainInfo(start_date, end_date, platformId),
        this.service.dataStatistics.platformData.getDateBetnumber(start_date, end_date, platformId), // 投注人数
        this.service.dataStatistics.platformData.getPlatformDataAll(), // 今日投注人数
        this.service.userLoginHall.getDateLogin(start_date, end_date, platformId), // 登录人数
        this.service.user.getDateRegisterAll(start_date, end_date, platformId), // 获取每天注册人数
      ]);
      let today_bet_number = 0; // 今日活跃
      if (platformId) {
        today_bet_number = platformDataAll[platformId] ? platformDataAll[platformId].betNumber : 0;
      } else {
        Object.keys(platformDataAll).forEach(item => {
          if (item !== 'timestamp') {
            today_bet_number += platformDataAll[item].betNumber;
          }
        });
      }

      betNumberData[moment().format('YYYY-MM-DD')] = today_bet_number; // 凭接上今日数据

      for (let i = 0; i < result.length; i++) {
        const login_count = loginData[result[i].first_day] || 0;
        result[i].login_count = login_count; // 登录人数
        result[i].bet_number = betNumberData[result[i].first_day] || 0; // 投注活跃人数
        const count = userRegister[result[i].first_day] || 0;
        result[i].retain_all = count !== 0 ? parseFloat((login_count / count) * 100).toFixed(2) + '%' : '0%';
      }

      this.ctx.body = {
        data: result,
        msg: '',
        count: result.length,
        code: 0,
      };
    } catch (error) {
      console.log('error:', error);
      this.ctx.body = {
        data: [],
        msg: '请求失败',
        count: 0,
        code: 1,
      };
    }
  }

  // 获取平台总留存
  async total() {
    try {
      const { platformId } = this.ctx.query;
      const [ rate, todayLogin, platformDataAll ] = await Promise.all([
        this.ctx.service.userLoginHall.getRetainTotal(platformId), // 总留存
        this.service.userLoginHall.getTodayLogin(platformId), // 今日登录
        this.service.dataStatistics.platformData.getPlatformDataAll(),
      ]);
      const bet_number = platformDataAll[platformId] ? platformDataAll[platformId].betNumber : 0; // 今日活跃

      this.ctx.body = {
        total: rate,
        todayLogin,
        bet_number,
        code: 0,
      };
    } catch (error) {
      console.log('error:', error);
      this.ctx.body = {
        msg: '请求错误',
        code: 1,
      };
    }

  }

}

module.exports = retainController;
