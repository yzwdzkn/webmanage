'use strict';

const Service = require('egg').Service;

class SystemMaintenanceService extends Service {
  async findList(page, limit) {
    return await this.ctx.model.SystemMaintenance.findAndCountAll({
      offset: (page - 1) * limit, // 每页起始位置
      limit,
      order: [[ 'create_time', 'DESC' ]],
    });
  }
  async addrecord(params) {
    return await this.ctx.model.SystemMaintenance.create({
      create_operator: params.create_operator,
      reason: params.reason,
      create_time: new Date(),
    });
  }
}

module.exports = SystemMaintenanceService;
