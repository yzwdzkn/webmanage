'use strict';

const Controller = require('egg').Controller;

class UserAgentSettlementManageController extends Controller {
  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('billManage/userAgentSettlement_manage', {
      title: '会员业绩明细',
      agents,
    });
  }

  // 查询会员业绩明细
  async list() {
    const parms = this.ctx.query;
    const data = await this.service.userAgentSettlement.getList(parms);
    this.ctx.body = {
      data: data.rows,
      count: data.count.length,
      code: 0,
    };
  }
  async getPopInfo() {
    const params = this.ctx.query;
    console.log(params);
    const data = await this.service.userAgentSettlement.getUserInfo(params);
    this.ctx.body = {
      data: data.rows,
      code: 0,
    };
  }
}

module.exports = UserAgentSettlementManageController;
