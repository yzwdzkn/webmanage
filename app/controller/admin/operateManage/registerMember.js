'use strict';
const Controller = require('egg').Controller;

class registerMemberController extends Controller {
  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('operateManage/registerMember', {
      title: '新增注册用户',
      agents,
    });
  }

  /**
           * 获取注册总数列表
           */
  async list() {
    const params = this.ctx.query;
    const result = await this.service.registerMember.findList(params);
    console.log(params);
    if (params.start_time == params.end_time) {
      result[0].dayname = '今日';
      result[1].dayname = '昨日';
      result[2].dayname = '本周';
      result[3].dayname = '上周';
    } else if (params.start_time != params.end_time) {
      result[0].dayname = `${params.start_time} - ${params.end_time}`;
    }
    this.ctx.body = {
      data: result,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  /**
         * 获取会员列表名单
         */
  async viplist() {
    const params = this.ctx.query;
    const result = await this.service.registerMember.findVipList(params);
    console.log(params);
    this.ctx.body = {
      data: result,
      msg: '',
      code: 0,
      count: params.count,
    };
  }
}

module.exports = registerMemberController;
