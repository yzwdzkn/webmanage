'use strict';
/* eslint-disable eqeqeq*/
const Controller = require('egg').Controller;
const moment = require('moment');
const { OPERATION_TYPE_UPDATE, ROBOT_MONIOTR, SYSTEM } = require('../../../tools/constant');

class robotController extends Controller {
  async index() {
    const robotMonitor = await this.service.robot.findRobotById();
    // console.log('robotMonitor: ', JSON.stringify(robotMonitor));
    await this.ctx.render('riskManagement/robot', {
      title: '机器人设置',
      robotMonitor: robotMonitor ? JSON.stringify(robotMonitor) : {},
    });
  }

  async list() {
    const { username, page, limit } = this.ctx.query;
    const Op = this.ctx.model.Sequelize.Op;
    const params = {
      insert_time: {
        [Op.lte]: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    };
    if (username) {
      params.username = username;
    }
    const { rows, count } = await this.service.robot.findRobotMonitor(params, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: rows,
      msg: '',
      count,
      code: 0,
    };
  }

  async saveMonitor() {
    const params = this.ctx.request.body;
    params.id = 1;
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, ROBOT_MONIOTR);
    await this.service.robot.save(params);
    this.ctx.body = {
      status: 0,
    };
  }

  async export() {
    const { username } = this.ctx.query;
    const Op = this.ctx.model.Sequelize.Op;
    const params = {
      insert_time: {
        [Op.lte]: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    };
    if (username) {
      params.username = username;
    }
    const rows = await this.service.robot.export(params);
    this.ctx.body = {
      data: rows,
      msg: '',
      staus: 0,
      code: 0,
    };
  }

  async detailLog() {
    try {
      const params = this.ctx.query;
      //   const params = { username };
      if (params.start_time && params.end_time) {
        if (moment(params.start_time).month() != moment(params.end_time).month()) {
          throw new Error('开始时间和结束时间必须是同月,不能跨月查询！');
        }
      } else if (!params.start_time && !params.end_time) {
        params.start_time = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
        params.end_time = moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        throw new Error('开始时间和结束时间必须是同月,不能跨月查询！');
      }
      const { rows, count } = await this.ctx.service.robot.getDetailLog(params);
      this.ctx.body = { data: rows, msg: '', count, code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: error.message, status: '', code: 2 };
    }
  }

  async detailExport() {
    try {
      const params = this.ctx.query;
      //   const params = { username };
      if (params.start_time && params.end_time) {
        if (moment(params.start_time).month() != moment(params.end_time).month()) {
          throw new Error('开始时间和结束时间必须是同月,不能跨月查询！');
        }
      } else if (!params.start_time && !params.end_time) {
        params.start_time = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
        params.end_time = moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        throw new Error('开始时间和结束时间必须是同月,不能跨月查询！');
      }
      const rows = await this.ctx.service.robot.detailExport(params);
      this.ctx.body = { data: rows, msg: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: error.message, status: '', code: 2 };
    }
  }
}

module.exports = robotController
;
