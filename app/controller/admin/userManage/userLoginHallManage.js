'use strict';

const Controller = require('egg').Controller;

class userOnlineManageController extends Controller {

  async index() {
    const platforms = await this.ctx.service.user.findPlatformInfo();
    await this.ctx.render('userManage/userLoginHall_manage', {
      title: '会员登录分析',
      platforms: platforms.rows,
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
  // 获取用户登录列表
  async userLoginList() {
    const params = this.ctx.query;
    const data = await this.service.userLoginHall.getuserLoginList(params.region, params.page, params.limit, params.s_start_date, params.s_end_date, params.platform_id);
    this.ctx.body = {
      code: '0',
      data: data.rows,
      count: data.count,
    };
  }
  // 导出
  async export() {
    const { ctx } = this;
    const params = ctx.request.body;
    const headers = [];
    const condition = [
      { t: `平台:${params.platform_id || '所有平台'}`, m1: 'A1', m2: 'A1' },
      { t: `登陆地区:${params.region || ''}`, m1: 'B1', m2: 'B1' },
      { t: `开始时间:${params.s_start_date}`, m1: 'C1', m2: 'C1' },
      { t: `结束时间:${params.s_end_date}`, m1: 'D1', m2: 'D1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '登录地区', f: 'region', totalRow: true },
      { t: '数量', f: 'no_region', totalRow: true },
      { t: '占比%', f: 'percentage', totalRow: true },
    ]);
    const data = await this.service.userLoginHall.getLoginInfo(params);
    console.log(data);
    const workbook = await this.service.exportExcel.generateExcel(headers, data.rows.map(element => {
      // element = element.toJSON();
      element.region;
      element.no_region;
      element.percentage = parseFloat(element.percentage).toFixed(2) + '%';
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('玩家登录分析') + '.xlsx');
    ctx.body = workbook;
  }
}
module.exports = userOnlineManageController;
