'use strict';

const Controller = require('egg').Controller;

class SystemMaintenanceController extends Controller {
  async index() {
    await this.ctx.render('systemSetting/system_maintenance', {
      title: '系统维护',
    });
  }
  async list() {
    const { page, limit } = this.ctx.query;
    const result = await this.service.systemMaintenance.findList(parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  async saverecord() {
    const params = this.ctx.request.body;
    params.create_operator = this.ctx.session.admin.username;
    await this.service.systemMaintenance.addrecord(params);
    this.ctx.body = {
      status: 0,
    };
  }
}

module.exports = SystemMaintenanceController;
