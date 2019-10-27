/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
const util = require('util');
class GameInfoService extends Service {

  /**
     * 获取所以游戏信息
     */
  async findAllGame() {
    return await this.ctx.model.GameInfo.findAll();
  }

  /**
     * 获取所有游戏
     */
  async gameList() {
    return await this.ctx.model.GameInfo.findAll({
      where: {
        is_delete: 0,
      },
    });
  }

  /** 获取所有房间
     *
     */
  async roomList() {
    return await this.ctx.model.RoomInfo.findAll();
  }
  /**
     * 查询所有游戏+房间信息
     */
  async getGameList() {
    return await this.ctx.model.GameInfo.findAll({
      include: {
        model: this.ctx.model.RoomInfo,
      },
    });
  }

  /**
     * 获取所有房间信息+游戏信息
     * @param {*} game_id 游戏id
     * @param {*} matching_status 匹配状态
     */
  async getRoomList(game_id, matching_status) {
    const where = {};
    if (game_id != 0) {
      where.game_id = game_id;
    }
    if (matching_status != 0) {
      where.matching_status = matching_status;
    }
    return await this.ctx.model.RoomInfo.findAll({
      where,
      include: {
        model: this.ctx.model.GameInfo,
      },
    });
  }

  /**
     * 获取所有房间信息 + 游戏信息 + 下注点信息
     * @param {*} game_id 游戏id
     * @param {*} room_id 房间id
     */
  async getRoomListAndLimitBets(game_id, room_id) {
    const where = {};
    if (game_id != 0) {
      where.game_id = game_id;
    }
    if (room_id != 0) {
      where.room_id = room_id;
    }
    return await this.ctx.model.RoomInfo.findAll({
      order: [
        [ 'room_id', 'ASC' ], // 排序
      ],
      where,
      include: [ // 关联查询
        {
          model: this.ctx.model.RoomLimitBets,
        },
        {
          model: this.ctx.model.GameInfo,
        },

      ],
    });
  }

  /**
     * 根据房间id获取下注点信息
     * @param {*} room_id 房间id
     */
  async getLimitBetsById(room_id) {
    return await this.ctx.model.RoomLimitBets.findOne({
      where: {
        room_id,
      },
    });
  }

  /**
     * 根据id 查询游戏
     * @param {*} game_id 游戏id
     */
  async findGameById(game_id) {
    return await this.ctx.model.GameInfo.findOne({
      where: {
        game_id,
      },
    });
  }

  /**
     * 根据id 查询游戏
     * @param {*} game_sort 游戏id
     */
  async findGameSort(game_sort) {
    return await this.ctx.model.GameInfo.count({
      where: {
        game_sort,
      },
    });
  }

  /**
     * 根据id查询房间
     * @param {*} room_id 房间id
     */
  async findRoomById(room_id) {
    return await this.ctx.model.RoomInfo.findOne({
      where: {
        room_id,
      },
    });
  }

  /**
     * 根据游戏id查询房间
     * @param {*} game_id  游戏id
     */
  async findRoomByGameId(game_id) {
    return await this.ctx.model.RoomInfo.findAll({
      where: {
        game_id,
      },
    });
  }

  /**
     * 批量更新房间状态
     * @param {*} rooms [{id:1,status:0},{...}]
     */
  async updateRoomStatus(rooms) {
    let sql = 'UPDATE room_info SET status = CASE room_id';
    const ids = [];
    for (let i = 0; i < rooms.length; i++) {
      sql = sql + ' WHEN ' + rooms[i].id + ' THEN ' + +rooms[i].status;
      ids.push(rooms[i].id);
    }
    sql = sql + ' END WHERE room_id in (' + ids.join(',') + ')';
    console.log(sql);
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.UPDATE,
    });
  }

  /**
     * 设置游戏状态
     * @param {*} game_id 游戏id
     * @param {*} status  状态
     */
  async changeGameStatus(game_id, status) {
    // 更新游戏状态
    await this.ctx.model.GameInfo.update(
      {
        status,
      },
      {
        where: {
          game_id,
        },
      }
    );

    if (status == 0) { // 游戏关闭时把房间状态都设为关闭
      await this.ctx.model.RoomInfo.update(
        {
          status,
        },
        {
          where: {
            game_id,
          },
        }
      );
    }
  }

  /**
     * 添加游戏
     * @param {*} params 参数
     */
  async AddGame(params) {
    Object.assign(params, { status: 0, is_delete: 0, create_time: new Date() });
    return await this.ctx.model.GameInfo.create(params);
  }

  /**
     * 修改游戏
     * @param {*} params 参数
     */
  async editGame(params) {
    await this.ctx.model.GameInfo.update(
      params,
      {
        where: {
          game_id: params.game_id,
        },
      }
    );
  }

  /**
     * 根据id删除游戏(软删除把is_delete改为1)
     * @param {*} game_id 游戏id
     */
  async deleteGame(game_id) {
    return await this.ctx.model.GameInfo.update({
      is_delete: 1,
    }, {
      where: {
        game_id,
      },
    });
  }
  /**
     * 根据id删除游戏
     * @param {*} game_id 游戏id
     */
  // async deleteGame(game_id) {
  //   return await this.ctx.model.GameInfo.destroy({
  //     where: {
  //       game_id,
  //     },
  //   });
  // }

  /**
     * 添加房间
     * @param {*} game_id 游戏ID
     * @param {*} room_id 房间ID
     * @param {*} room_name 房间名称
     */
  async AddRoom(game_id, room_id, room_name) {
    return await this.ctx.model.RoomInfo.create({
      room_id,
      room_name,
      game_id,
      status: 0,
    });
  }

  /**
     * 修改房间
     * @param {*} room_id
     * @param {*} room_name
     */
  async editRoom(room_id, room_name) {
    await this.ctx.model.RoomInfo.update(
      {
        room_name,
      },
      {
        where: {
          room_id,
        },
      }
    );
  }

  /**
     * 根据id删除房间
     * @param {*} room_id
     */
  async deleteRoom(room_id) {
    return await this.ctx.model.RoomInfo.destroy({
      where: {
        room_id,
      },
    });
  }


  /**
     * 修改房间匹配状态
     * @param {*} room_id 房间ID
     * @param {*} matching_status 匹配状态 1.机器人  2. 玩家  3.机器人+玩家
     */
  async editMatchingStatus(room_id, matching_status) {
    await this.ctx.model.RoomInfo.update(
      {
        matching_status,
      },
      {
        where: {
          room_id,
        },
      }
    );
  }

  /**
     * 保存修改的房间下注点信息
     * @param {*} params
     */
  async saveLimitBets(params) {
    const sql = util.format('replace into room_limit_bets() values(%s,%s,%s,%s,%s,%s)',
      params.room_id,
      params.betting_point || null,
      params.bottom_injection || null,
      params.admittance || null,
      params.limit_injection || null,
      params.limit_win || null
    );
    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.INSERT,
    });

  }
}

module.exports = GameInfoService;
