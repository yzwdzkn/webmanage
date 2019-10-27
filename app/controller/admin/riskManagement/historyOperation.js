'use strict';

const Controller = require('egg').Controller;

class HistoryOperationController extends Controller {

  async index() {
    await this.ctx.render('riskManagement/history_operation', {
      title: '历史操作',
    });
  }

  /**
     * 获取所有杀数的操作日志
     */
  async list() {
    const { page, limit, func, operator, s_start_date, s_end_date } = this.ctx.query;
    const result = await this.service.killNumber.findKillLogList(page, limit, func, operator, s_start_date, s_end_date);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

}

module.exports = HistoryOperationController;
