'use strict';
const Controller = require('egg').Controller;
// const Excel = require('exceljs');

class promotionManageController extends Controller {

  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    console.log('agentList: ', JSON.stringify(agents));
    await this.ctx.render('operateManage/promotion_manage', {
      title: '推广统计',
      agents,
    });
  }

  async list() {
    try {
      const { start_date, end_date, agent_id, page, limit } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (start_date && end_date) {
        params.create_time = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.create_time = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.create_time = {
          [Op.lte]: end_date,
        };
      }

      if (agent_id != '0') {
        params.agent_id = agent_id;
      }
      const { rows, count } = await this.ctx.service.promotion.list(params, parseInt(page), parseInt(limit));
      this.ctx.body = { data: rows, count, msg: '', status: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }

  async export() {
    try {
      const { start_date, end_date, agent_id } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (start_date && end_date) {
        params.create_time = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.create_time = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.create_time = {
          [Op.lte]: end_date,
        };
      }

      if (agent_id) {
        params.agent_id = agent_id;
      }
      const rows = await this.ctx.service.promotion.exportList(params);
      this.ctx.body = { data: rows, msg: '', status: '', code: 0 };

    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }
}

module.exports = promotionManageController;
