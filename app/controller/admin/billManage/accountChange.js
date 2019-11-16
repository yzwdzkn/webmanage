'use strict';

const Controller = require('egg').Controller;

class AccountChangeController extends Controller {
  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('billManage/account_change', {
      title: '会员账单明细',
      agents,
    });
  }
  async list() {
    const params = this.ctx.query;
    console.log('---------',params)
    const result = await this.service.orders.findList(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

}

module.exports = AccountChangeController;
