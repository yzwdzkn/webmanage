'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;

class platformBillController extends Controller {

  async index() {
    await this.ctx.render('billManage/platformBill_manage', {
      title: '平台账单管理',
    });
  }

  async list() {
    try {
      const { bill_type, status, start_date, end_date, page, limit } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (bill_type) {
        params.bill_type = bill_type;
      }
      if (status) {
        params.status = status;
      }
      if (start_date && end_date) {
        params.bill_date = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.bill_date = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.bill_date = {
          [Op.lte]: end_date,
        };
      }
      const { rows, count } = await this.ctx.service.platformBill.list(params, parseInt(page), parseInt(limit));
      this.ctx.body = { data: rows, count, status: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  async baseInfo() {
    try {
      const result = await this.ctx.service.platformBill.baseInfo();
      this.ctx.body = { data: result[0], status: 0, code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  async export() {
    try {
      const { bill_type, status, start_date, end_date } = this.ctx.request.query;
      const Op = this.ctx.model.Sequelize.Op;
      const params = {};
      if (bill_type) {
        params.bill_type = bill_type;
      }
      if (status) {
        params.status = status;
      }
      if (start_date && end_date) {
        params.bill_date = {
          [Op.gte]: start_date,
          [Op.lte]: end_date,
        };
      } else if (start_date) {
        params.bill_date = {
          [Op.gte]: start_date,
        };
      } else if (end_date) {
        params.bill_date = {
          [Op.lte]: end_date,
        };
      }
      const rows = await this.ctx.service.platformBill.exportFile(params);
      this.ctx.body = { data: rows, status: '', code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }
}

module.exports = platformBillController;
