'use strict';

const Controller = require('egg').Controller;

class userOnlineManageController extends Controller {

  async index() {
    await this.ctx.render('operateManage/userLoginHall_manage', {
      title: '玩家登录分析',
    });
  }
  // 获取地区登录详情信息
  async list() {
    const params = this.ctx.query;
    const data = await this.service.userLoginHall.getLoginInfo(params);
    // console.log(data.rows);
    // for (let i = 0; i < data.rows.length; i++) {
    //   data.rows[i].percentage = +data.rows[i].percentage;
    // }
    this.ctx.body = {
      code: '0',
      data: data.rows,
      count: data.count[0].count,
    };
  }
  async export() {
    const params = this.ctx.query;
    const data = await this.service.userLoginHall.getExportFile(params);
    this.ctx.body = {
      data,
      status: '',
      code: 0,
    };
  }
  // 获取用户登录列表
  async userLoginList() {
    const params = this.ctx.query;
    const data = await this.service.userLoginHall.getuserLoginList(params.region, params.page, params.limit, params.s_start_date, params.s_end_date);
    this.ctx.body = {
      code: '0',
      data: data.rows,
      count: data.count,
    };
  }
}

module.exports = userOnlineManageController;
