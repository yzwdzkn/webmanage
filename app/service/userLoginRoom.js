'use strict';

const Service = require('egg').Service;

/**
 * 会员进入房间 Server层
 */
class UserLoginRoomService extends Service {

  /**
   * 添加进入房间的操作
   * @param {*} params
   */
  async create(params) {
    return await this.ctx.model.UserLoginRoom.create({
      username: params.username,
      room_id: params.room_id,
      in_room_time: new Date(params.datetime * 1000),
    });
  }

  /**
   * 修改记录，添加退出房间的时间
   * @param {*} params
   */
  async update(params) {
    return await this.ctx.model.UserLoginRoom.update({
      out_room_time: new Date(params.datetime * 1000),
      interval: params.interval,
    }, {
      where: {
        id: params.id,
      },
    });
  }

  /**
   * 查询会员最后一次进入房间的记录
   * @param {*} username
   */
  async findUserLastLoginRecord(username) {
    return await this.ctx.model.UserLoginRoom.findOne({
      where: {
        username,
      },
      order: [[ 'in_room_time', 'DESC' ]],
    });
  }
}

module.exports = UserLoginRoomService;
