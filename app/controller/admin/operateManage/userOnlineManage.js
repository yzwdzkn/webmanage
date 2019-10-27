'use strict';

const Controller = require('egg').Controller;
// const moment = require('moment');

class userOnlineManageController extends Controller {
  async index() {
    // const result = await this.service.gameInfo.findAllGame();
    await this.ctx.render('operateManage/userOnline_manage', {
      title: '会员在线',
    //   gameData: result,
    });
  }

  async getUserByTime() {
    try {
      const { s_time, page, limit } = this.ctx.request.query;
      const { rows, count } = await this.ctx.service.userOnline.getUserByTime(s_time, page, limit);
      this.ctx.body = { data: rows, msg: '', count, code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }

  async getOnlineNumberByDay() {
    try {
      const rows = await this.ctx.service.userOnline.getOnlineNumberByDay();
      const today = rows.todayData;
      const yesterday = rows.yesterdayData;
      // console.log('##############: ', JSON.stringify(rows));
      const todayData = this.ctx.service.userOnline.dataTransfer(today);
      const yesterdayData = this.ctx.service.userOnline.dataTransfer(yesterday);

      this.ctx.body = { data: { todayData, yesterdayData }, msg: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }

  async getOnlineNumberByMonth() {
    try {
      const result = await this.ctx.service.userOnline.getOnlineNumberByMonth();
      const len = result.length;
      const day = [];
      const value = [];
      for (let i = 0; i < len; i++) {
        day.push(result[i].date);
        value.push(result[i].number);
      }
      this.ctx.body = { data: { day, value }, msg: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }
}

module.exports = userOnlineManageController;
