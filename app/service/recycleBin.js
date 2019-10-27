'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const { ACCOUNT, SYSTEM } = require('../tools/constant');
class RecycleBinService extends Service {
  // async _getOldData(filed, params) {
  //   switch (filed.en) {
  //     case 'HorseLight':
  //       return await this.ctx.model.Horselight.findOne({ where: { id: params.id } });
  //     case 'Agent':
  //       return await this.ctx.model.AgentAccount.findOne({ where: { id: params.id } });
  //     case 'User':
  //       return await this.ctx.model.UserAccount.findOne({ where: { id: params.id } });
  //     case 'UserAgent':
  //       return await this.ctx.model.UserAgent.findOne({ where: { id: params.id } });
  //     case 'Share':
  //       return await this.ctx.model.AgentExtension.findOne({ where: { id: params.id } });
  //     case 'Game':
  //       return await this.ctx.model.GameInfo.findOne({ where: { game_id: params.id } });
  //     case 'UserMonitor':
  //       return await this.ctx.model.UserMonitor.findOne({ where: { id: params.id } });
  //     case 'RobotMonitor':
  //       return await this.ctx.model.RobotMonitor.findOne({ where: { id: params.id } });
  //     case 'UserKill':
  //       return await this.ctx.model.UserKillRecord.findOne({ where: { user_id: params.id } });
  //     case 'KillNumber':
  //       return await this.ctx.model.KillNumber.findOne({ where: { id: params.id } });
  //     case 'RoomKill':
  //       console.log('$$$$$$$$$$$$$$$: ', params);
  //       return await this.ctx.model.KillNumber.findOne({ where: { room_id: params.room_id } });
  //     default:
  //       break;
  //   }
  // }

  // async _getChangeList(filed, params) {
  //   const result = await this._getOldData(filed, params);
  //   delete params._csrf;
  //   delete params.room_name;
  //   delete params.action;
  //   let str = '';
  //   console.log('_getChangeList result: ', result);
  //   if (!result) {
  //     for (const row in params) {
  //       str += `${row},`;
  //     }
  //     return str.substr(0, str.length - 1);
  //   }

  //   for (const row in params) {
  //     if (params[row] != result[row]) {
  //       str += `${row},`;
  //     }
  //   }
  //   return str.substr(0, str.length - 1);
  // }

  /**
       * @param {*} params 操作参数 注意: 若为account  则params中需要带username 若为system,则需要带id
       * @param {*} aos 操作对象 account or system(aos)
       * @param {*} filed 操作的表
       */
  async saveRecycleBin(params, aos, filed) {
    let record_contents;
    if (aos === ACCOUNT) {
      record_contents = `${params.username || this.ctx.session.admin.username}删除${filed.ch} 账号 ${params.username}`; // 创建,删除时直接使用.
    } else if (aos === SYSTEM) {
      record_contents = `${params.username || this.ctx.session.admin.username}删除${filed.ch} ${params.id}`;
    }
    console.log(record_contents);
    return await this.ctx.model.RecycleBin.create({
      operator: params.username || this.ctx.session.admin.username,
      date: moment(),
      record_id: parseInt(params.id),
      record_contents,
      record_page: filed.en,
    });
  }

  /**
       * 获取操作日志列表
       * @param {} params
       * @param {*} page
       * @param {*} limit
       */
  async getList(params, page, limit = 10) {
    return await this.ctx.model.RecycleBin.findAndCountAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
      order: [
        [ 'date', 'DESC' ],
      ],
    });
  }

  async recover(table_name, id, self_id) {
    switch (table_name) {
      case 'HorseLight':
        await this.ctx.model.Horselight.update({
          is_delete: 0,
        }, {
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'GameInfo':
        await this.ctx.model.GameInfo.update({
          is_delete: 0,
        }, {
          where: {
            game_id: id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Admin':
        await this.ctx.model.Admin.update({
          is_delete: 0,
        }, {
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Role':
        await this.ctx.model.Role.update({
          is_delete: 0,
        }, {
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Menu':
        await this.ctx.model.Menu.update({
          is_delete: 0,
        }, {
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'AdminWhitelist':
        await this.ctx.model.AdminWhitelist.update({
          is_delete: 0,
        }, {
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });

      default:
        break;
    }
  }

  async shiftDelete(table_name, id, self_id) {
    switch (table_name) {
      case 'HorseLight':
        await this.ctx.model.Horselight.destroy({
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'GameInfo':
        await this.ctx.model.GameInfo.destroy({
          where: {
            game_id: id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Admin':
        // eslint-disable-next-line no-case-declarations
        const transaction = await this.ctx.model.transaction({ autonomist: true, isolationLevel: 'SERIALIZABLE' });
        try {
          await this.ctx.model.Admin.destroy({
            where: {
              id: parseInt(id),
            },
            transaction,
          });
          await this.service.accountMap.delete(id, 'Admin', transaction);
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw new Error(error.original.errno);
        }
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Role':
        await this.ctx.model.Role.destroy({
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'Menu':
        await this.ctx.model.Menu.destroy({
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      case 'AdminWhitelist':
        await this.ctx.model.AdminWhitelist.destroy({
          where: {
            id,
          },
        });
        return await this.ctx.model.RecycleBin.destroy({ where: {
          id: self_id,
        } });
      default:
        break;
    }
  }
}

module.exports = RecycleBinService;
