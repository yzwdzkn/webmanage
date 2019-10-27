'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const moment = require('moment');

class OperationLogController extends Controller {

  async index() {
    await this.ctx.render('systemSetting/operation_log', {
      title: '操作日志',
    });
  }

  async list() {
    let { type, operator_name, operated_name, start_time, end_time, page, limit } = this.ctx.request.query;
    const params = {};
    const Op = this.ctx.model.Sequelize.Op;
    if (start_time == '') {
      start_time = moment(Date.now() - (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss');
    }
    if (end_time == '') {
      end_time = moment(Date.now() + (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss');
    }
    if (type) {
      params.type = type;
    }
    if (operated_name) {
      params.operated_name = operated_name;
    }
    if (operator_name) {
      params.operator_name = operator_name;
    }
    if (start_time && end_time) {
      params.create_time = {
        [Op.gte]: start_time,
        [Op.lte]: end_time,
      };
    } else if (start_time) {
      params.create_time = {
        [Op.gte]: start_time,
      };
    } else if (end_time) {
      params.create_time = {
        [Op.lte]: end_time,
      };
    }

    const { rows, count } = await this.ctx.service.operationLog.getList(params, parseInt(page), parseInt(limit));
    this.ctx.body = { data: rows, count, code: 0, status: 0, msg: '' };
  }
}

module.exports = OperationLogController;
