'use strict';
/* eslint-disable eqeqeq */
const Controller = require('egg').Controller;
const moment = require('moment');
class PlatformOrderManageController extends Controller {
  async index() {
    const { platform_id, date } = this.ctx.query;
    const platforms = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('platformManage/platform_order_manage', {
      title: '平台账单明细',
      platforms,
      platform_id,
      date,
    });
  }

  /**
     * 获取平台上下分订单列表
     */
  async list() {
    const { platform_id, order_state, order_id, start_date, end_date, type, page, limit } = this.ctx.query;
    console.log('-------------');
    console.log(start_date, end_date);
    // const { platform_id, page, limit, order_time, one_day } = this.ctx.query;
    // if (start_date === '' || end_date === '') {
    //   start_date = moment().format('YYYY-MM-DD');
    //   end_date = start_date;
    // }
    const result = await this.service.platformOrder.findList(platform_id, order_state, order_id, type, start_date, end_date, parseInt(page), parseInt(limit));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  // 导出
  async export() {
    const { ctx } = this;
    let { platform_id, order_state, order_id, start_date, end_date, type, isA } = ctx.request.body;
    if (start_date === '' || end_date === '') {
      start_date = moment().format('YYYY-MM-DD');
      end_date = start_date;
    }
    const data = await this.service.platformOrder.findList(platform_id, order_state, order_id, type, start_date, end_date);
    if (isA) {
      ctx.body = data;
      return;
    }
    const TYPE = {
      0: '会员上分',
      1: '会员下分',
      2: '后台上分',
      3: '后台下分',
      4: '平台下分失败',
      5: '平台上分失败',
      6: '回滚平台分数失败',
      7: '回滚平台分数成功',
      8: '代理充值',
      9: '代理取款',
    };
    const headers = [];
    const condition = [
      { t: `类型:${TYPE[type] || '所有类型'}`, m1: 'A1', m2: 'A1' },
      { t: `处理类型:${order_state || ''}`, m1: 'B1', m2: 'B1' },
      { t: `平台:${platform_id}`, m1: 'C1', m2: 'C1' },
      { t: `开始时间:${start_date}`, m1: 'D1', m2: 'D1' },
      { t: `结束时间:${end_date}`, m1: 'E1', m2: 'E1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '时间', f: 'order_time', totalRow: true },
      { t: '订单号', f: 'order_id', totalRow: true },
      { t: '平台ID', f: 'platform_id', totalRow: true },
      { t: '交易类型', f: 'type', totalRow: true },
      { t: '交易金额', f: 'add_score', totalRow: true },
      { t: '账前金额', f: 'pre_score', totalRow: true },
      { t: '账后金额', f: 'current_score', totalRow: true },
      { t: '处理状态', f: 'order_state', totalRow: true },
    ]);
    const excelBody = data.map(element => {
      element = element.toJSON();
      element.type = TYPE[element.type] || '';
      element.pre_score = parseFloat(element.pre_score / 100).toFixed(2) || 0;
      element.add_score = parseFloat(element.add_score / -100).toFixed(2);
      element.current_score = parseFloat(element.current_score / 100).toFixed(2);
      switch (element.order_state) {
        case 1: element.order_state = '处理中'; break;
        case 2: element.order_state = '处理完成'; break;
        default: element.order_state = '';
      }
      return element;
    });
    const workbook = await this.service.exportExcel.generateExcel(headers, excelBody);
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('牌局查询') + '.xlsx');
    ctx.body = workbook;
  }

}

module.exports = PlatformOrderManageController;
