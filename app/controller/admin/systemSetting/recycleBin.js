'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const sequelize = require('sequelize');

const { SYSTEM, OPERATION_TYPE_RECOVER, HORSE_LIGHT, GAME_INFO, ADMINT, ROLE, MENU, ADMIN_WHITELIST } = require('../../../tools/constant');
class RecycleBinController extends Controller {
  async index() {
    await this.ctx.render('systemSetting/recycle_bin', {
      title: '回收站',
    });
  }

  async list() {
    let { record_id, record_page, start_time, end_time, page, limit } = this.ctx.request.query;
    const params = {};
    const Op = this.ctx.model.Sequelize.Op;
    if (start_time == '') {
      start_time = moment(Date.now() - (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss');
    }
    if (end_time == '') {
      end_time = moment(Date.now() + (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss');
    }
    // console.log(moment(Date.now() - (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss'));
    // console.log(moment(Date.now() + (3600 * 1000)).format('YYYY-MM-DD HH:mm:ss'));
    if (record_page) {
      params.record_page = record_page;
    }
    if (record_id) {
      params.record_id = record_id;
    }
    if (start_time && end_time) {
      params.date = {
        [Op.gte]: start_time,
        [Op.lte]: end_time,
      };
    } else if (start_time) {
      params.date = {
        [Op.gte]: start_time,
      };
    } else if (end_time) {
      params.date = {
        [Op.lte]: end_time,
      };
    }

    const { rows, count } = await this.ctx.service.recycleBin.getList(params, parseInt(page), parseInt(limit));
    this.ctx.body = { data: rows, count, code: 0, status: 0, msg: '' };
  }
  async recover() {
    const { table_name, id, self_id } = this.ctx.request.body;
    const result = await this.ctx.service.recycleBin.recover(table_name, id, self_id);
    const params = { id };
    switch (table_name) {
      case 'HorseLight':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, HORSE_LIGHT);
        break;
      case 'GameInfo':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, GAME_INFO);
        break;
      case 'Admin':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, ADMINT);
        break;
      case 'Role':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, ROLE);
        break;
      case 'Menu':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, MENU);
        break;
      case 'AdminWhitelist':
        await this.service.operationLog.saveOperationLog(OPERATION_TYPE_RECOVER, params, SYSTEM, ADMIN_WHITELIST);
        break;

      default:
        break;
    }
    console.log(result);
    this.ctx.body = {
      code: 0,
    };
  }
  async shiftDelete() {
    const { table_name, id, self_id } = this.ctx.request.body;
    const result = await this.ctx.service.recycleBin.shiftDelete(table_name, id, self_id);
    console.log(result);
    this.ctx.body = {
      code: 0,
    };
  }
  // 清空回收站
  async deleteAll() {
    const { ctx } = this;
    const res = [];
    res.push(ctx.model.Horselight.destroy({
      where: {
        is_delete: 1,
      },
    }));

    res.push(ctx.model.GameInfo.destroy({
      where: {
        is_delete: 1,
      },
    }));

    res.push(ctx.model.Role.destroy({
      where: {
        is_delete: 1,
      },
    }));

    res.push(ctx.model.Menu.destroy({
      where: {
        is_delete: 1,
      },
    }));

    res.push(ctx.model.AdminWhitelist.destroy({
      where: {
        is_delete: 1,
      },
    }));
    const ne = sequelize.Op.ne;
    res.push(ctx.model.RecycleBin.destroy({
      where: {
        id: {
          [ne]: 0,
        },
      },
    }));
    const res2 = await Promise.all(res);
    let count = 0;
    res2.forEach(key => {
      count += key;
    });
    ctx.body = {
      code: 0,
      count,
    };
  }
}

module.exports = RecycleBinController;
