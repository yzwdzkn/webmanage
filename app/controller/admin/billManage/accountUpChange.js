'use strict';

const Controller = require('egg').Controller;

class AccountUpChangeController extends Controller {
  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('billManage/account_up_change', {
      title: '会员账单上分明细',
      agents,
    });
  }
  async list() {
    const params = this.ctx.query;
    const result = await this.service.accountUpChange.findUpList(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  async lock() {
    const params = this.ctx.request.body;
    params.lock_people = this.ctx.session.admin.username;
    const result = await this.service.accountUpChange.lockOrder(params);
    this.ctx.body = {
      status: 0,
    };
  }
}

module.exports = AccountUpChangeController;
