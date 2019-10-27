'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

class agentCommissonController extends Controller {

  async index() {
    const agentList = await this.ctx.service.agent.findAgentByStatus(0);
    console.log('agentList: ', JSON.stringify(agentList));
    await this.ctx.render('billManage/agentCommisson_manage', {
      title: '代理结算',
      agentList,
    });
  }

  async list() {
    try {
      const { page, limit, agent_id, status, start_date, end_date } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (agent_id) {
        params.agent_id = agent_id;
      }
      if (status) {
        params.status = status;
      }
      if (start_date && end_date) {
        params.create_date = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.create_date = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.create_date = {
          [Op.lte]: end_date,
        };
      }
      const { rows, count } = await this.ctx.service.agentCommission.list(params, parseInt(page), parseInt(limit));
      console.log('rows: ', JSON.stringify(rows));
      this.ctx.body = { data: rows, count, status: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  async export() {
    try {
      const { agent_id, status, start_date, end_date } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (agent_id) {
        params.agent_id = agent_id;
      }
      if (status) {
        params.status = status;
      }
      if (start_date && end_date) {
        params.create_date = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.create_date = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.create_date = {
          [Op.lte]: end_date,
        };
      }
      const data = await this.ctx.service.agentCommission.export(params);
      console.log('rows: ', JSON.stringify(data));
      this.ctx.body = { data, status: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  async changeStatus() {
    const { id } = this.ctx.request.body;
    await this.ctx.service.agentCommission.changeStatus(id);
    this.ctx.body = { data: '', status: 0, code: 0 };
  }

}

module.exports = agentCommissonController;
