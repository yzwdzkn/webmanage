/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const { OPENING_FEE, PLATFORM_FEE_TYPE, PLATFORM_FEE_STATUS } = require('./../tools/constant');

class platfromBillService extends Service {

  /**
   * 平台账单列表
   * @param {*} params
   * @param {*} page
   * @param {*} limit
   */
  async list(params, page, limit) {
    return await this.ctx.model.PlatformBill.findAndCountAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
    });
  }

  /**
   * 获取平台基础信息
   */
  async baseInfo() {
    const sql = `select sum(bill)+${OPENING_FEE} as total ,
    (select sum(bill) as c from platform_bill where bill_type = '1') as line_bill,
    (select sum(bill) as d from platform_bill where bill_type = '2') as other_bill,
    (select sum(bill) as a from platform_bill where status='1') as pay,
    (select sum(bill) as b from platform_bill where status='2') as not_pay from platform_bill`;
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });

  }

  async exportFile(params) {
    const rows = await this.ctx.model.PlatformBill.findAll({
      where: params,
    });
    // console.log('result#######: ', JSON.stringify(result));
    const template = [
      [ '账单年份', '账单月份', '费用类型', '金额', '缴费时间', '状态' ],
    ];
    for (const row of rows) {
      const dateArray = row.bill_date.split('-');
      const year = dateArray[0];
      const month = dateArray[1];
      const filed = [ year, month, PLATFORM_FEE_TYPE[row.bill_type], row.bill, row.pay_time, PLATFORM_FEE_STATUS[row.status] ];
      template.push(filed);
    }
    return template;
  }
}


module.exports = platfromBillService
;
