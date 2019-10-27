'use strict';

const Controller = require('egg').Controller;

class UserAccountChangeController extends Controller {
  async index() {
    const platforms = await this.ctx.service.platformInfo.findPlatformByStatus(0);
    await this.ctx.render('userManage/user_account_change', {
      title: '会员账单明细',
      platforms,
    });
  }
  async list() {
    const params = this.ctx.query;
    const result = await this.service.orders.findList(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  async findUserMassageList() {
    const params = this.ctx.query;
    const result = await this.service.user.findAll(params);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }

  async export() {
    const { ctx } = this;
    const params = ctx.request.body;
    const TYPE = {
      1: '游戏上分',
      '-1': '游戏下分',
      2: '游戏赢分',
      '-2': '游戏输分',
      // 3: '登录上分',
      // '-3': '登录下分',
      4: '代理给会员上分',
      '-4': '代理给会员下分',
    };

    const STATUS = {
      '-1': '处理中',
      0: '成功',
      1: '失败',
      2: '会员下分失败',
      3: '平台上分失败',
      4: '平台下分失败',
    };

    const ORDER_STATUS = {
      1: '订单创建',
      2: '订单完成',
      3: '确定完成',
    };
    const name = await this.service.platformInfo.findNickByPlatformId(params.platform_id);
    const headers = [];
    const condition = [
      { t: `平台:${+params.platform_id ? params.platform_id + '--' + name.platform_name : '所有平台'}`, m1: 'A1', m2: 'A1' },
      { t: `类型:${TYPE[params.type] || '所有类型'}`, m1: 'B1', m2: 'B1' },
      { t: `状态:${STATUS[params.state] || '所有状态'}`, m1: 'C1', m2: 'C1' },
      { t: `处理状态:${ORDER_STATUS[params.order_state] || '所有状态'}`, m1: 'D1', m2: 'D1' },
      { t: `开始时间:${params.start_time || ''}`, m1: 'E1', m2: 'E1' },
      { t: `结束时间:${params.end_time || ''}`, m1: 'F1', m2: 'F1' },
    ];
    headers.push(condition);
    headers.push([
      { t: '订单号', f: 'order_id', totalRow: true },
      // { t: '会员ID', f: 'user_id', totalRow: true },
      { t: '会员账号', f: 'username', totalRow: true },
      { t: '平台名称', f: 'platform_id', totalRow: true },
      { t: '账单类型', f: 'type', totalRow: true },
      { t: '游戏', f: 'game_id', totalRow: true },
      { t: '账单金额', f: 'score', totalRow: true },
      { t: '帐前金额', f: 'pre_score', totalRow: true },
      { t: '账后金额', f: 'current_score', totalRow: true },
      { t: '抽水', f: 'deduct_gold', totalRow: true },
      { t: '账单时间', f: 'create_time', totalRow: true },
      { t: '状态', f: 'status', totalRow: true },
      { t: '处理状态', f: 'order_state', totalRow: true },
      { t: '操作人员', f: 'create_operator', totalRow: true },
    ]);
    const data = await this.service.orders.findList(params);
    const workbook = await this.service.exportExcel.generateExcel(headers, data.map(element => {
      element = element.toJSON();
      element.username = element.user_account && element.user_account.username || '';
      element.type = TYPE[element.type];
      element.platform_id = element.platform_info != null ? element.platform_info.platform_id + '--' + element.platform_info.platform_name : '/';
      element.game_id = element.game_info != null ? element.game_info.game_name : '/';
      element.score = (parseInt(element.pre_score) > (parseInt(element.current_score)) ? element.score / -100 : element.score / 100).toFixed(2);
      element.pre_score = element.pre_score / 100;
      element.current_score = element.current_score / 100;
      element.status = STATUS[element.status];
      element.deduct_gold = ((element.deduct_gold || 0) / 100).toFixed(2);
      switch (element.order_state) {
        case 1: element.order_state = '订单创建！'; break;
        case 2: element.order_state = '订单完成'; break;
        case 3: element.order_state = '确定完成'; break;
        default: element.order_state = '/';
      }
      return element;
    }));
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('会员账单明细') + '.xlsx');
    ctx.body = workbook;
  }
}

module.exports = UserAccountChangeController;
