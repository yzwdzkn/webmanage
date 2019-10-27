/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const { ACCOUNT, SYSTEM } = require('../tools/constant');
class OperationLogService extends Service {

  async _getOldData(filed, params) {
    switch (filed.en) {
      case 'HorseLight':
        return await this.ctx.model.Horselight.findOne({ where: { id: params.id } });
      case 'Agent':
        return await this.ctx.model.AgentAccount.findOne({ where: { id: params.id } });
      case 'User':
        return await this.ctx.model.UserAccount.findOne({ where: { id: params.id } });
      case 'UserAgent':
        return await this.ctx.model.UserAgent.findOne({ where: { id: params.id } });
      case 'Share':
        return await this.ctx.model.AgentExtension.findOne({ where: { id: params.id } });
      case 'Game':
        return await this.ctx.model.GameInfo.findOne({ where: { game_id: params.id } });
      case 'UserMonitor':
        return await this.ctx.model.UserMonitor.findOne({ where: { id: params.id } });
      case 'RobotMonitor':
        return await this.ctx.model.RobotMonitor.findOne({ where: { id: params.id } });
      case 'UserKill':
        return await this.ctx.model.UserKillRecord.findOne({ where: { user_id: params.id } });
      case 'KillNumber':
        return await this.ctx.model.KillNumber.findOne({ where: { id: params.id } });
      case 'RoomKill':
        console.log('$$$$$$$$$$$$$$$: ', params);
        return await this.ctx.model.KillNumber.findOne({ where: { room_id: params.room_id } });
      default:
        break;
    }
  }

  async _getChangeList(filed, params) {
    const result = await this._getOldData(filed, params);
    delete params._csrf;
    delete params.room_name;
    delete params.action;
    let str = '';
    console.log('_getChangeList result: ', result);
    if (!result) {
      for (const row in params) {
        str += `${row},`;
      }
      return str.substr(0, str.length - 1);
    }

    for (const row in params) {
      if (params[row] != result[row]) {
        str += `${row},`;
      }
    }
    return str.substr(0, str.length - 1);
  }

  /**
   * @param {*} operationType 操作类型 创建,修改,删除
   * @param {*} params 操作参数 注意: 若为account  则params中需要带username 若为system,则需要带id
   * @param {*} aos 操作对象 account or system(aos)
   * @param {*} filed 操作的表
   */
  async saveOperationLog(operationType, params, aos, filed) {
    let content;
    if (aos === ACCOUNT) {
      content = `${params.username || this.ctx.session.admin.username} ${operationType.name} ${filed.ch} 账号 ${params.username}`; // 创建,删除时直接使用.
    } else if (aos === SYSTEM) {
      content = `${params.username || this.ctx.session.admin.username} ${operationType.name} ${filed.ch} ${params.id}`;
    }
    if (operationType.index === 1) { // 修改时需要添加修改项
      const editStr = await this._getChangeList(filed, params);
      if (editStr === '') {
        return;
      }
      content += `的${editStr}`;
    }

    return await this.ctx.model.OperationLog.create({
      content,
      type: operationType.index,
      operator_name: params.username || this.ctx.session.admin.username,
      operated_name: params.username,
      create_time: moment(),
    });
  }

  /**
   * 获取操作日志列表
   * @param {} params
   * @param {*} page
   * @param {*} limit
   */
  async getList(params, page, limit = 10) {
    return await this.ctx.model.OperationLog.findAndCountAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
      order: [
        [ 'create_time', 'DESC' ],
      ],
    });
  }
}

module.exports = OperationLogService;
