/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;

class GameRoomService extends Service {

  async create(params) {
    console.log(params);
    return await this.ctx.model.RoomInfo.create({
      room_id: params.room_id,
      game_id: params.game_id,
      room_name: params.room_name,
      status: params.status,
      matching_status: params.matching_status,
      // admittance: params.admittance,
    });
  }

  async list(game_id, page, limit) {
    let where = '';
    if (game_id != '0') {
      where = ` where a.game_id = ${game_id}`;
    }

    const s_limit = (page - 1) * limit;
    const sql = `select a.*, b.game_name from room_info a left join game_info b on a.game_id = b.game_id ${where} order by game_id DESC limit ${s_limit},${limit}`;
    const sql_count = `select count(*) as count from room_info as a ${where}`;

    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const count = await this.app.model.query(sql_count, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    console.log(rows, count);
    return { rows, count: count[0].count };
  }

  async getRoomById(room_id) {
    const sql = `select a.*, b.game_name from room_info a  left join game_info b on a.game_id = b.game_id where a.room_id=${room_id}`;
    const result = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    console.log('##############: ', result);
    return result[0];
  }

  async editRoom(params) {
    await this.ctx.model.RoomInfo.update(
      {
        game_id: params.game_id,
        room_name: params.room_name,
        status: params.status,
        matching_status: params.matching_status,
        // admittance: params.admittance,
      },
      { where: { room_id: params.room_id } }
    );
  }
  /** ************************************************************************************************************
   * 以下为B端的请求
   */


  async listB(game_id, page, limit) {
    let where = '';
    if (game_id != '0') {
      where = ` where a.game_id = ${game_id}`;
    }

    const s_limit = (page - 1) * limit;
    const sql = `select a.*, b.game_name from room_info a left join game_info b on a.game_id = b.game_id ${where} GROUP BY game_id order by game_id DESC limit ${s_limit},${limit}`;
    // const sql_count = `select count(*) as count from room_info as a ${where}`;
    const sql_count = 'select  count(DISTINCT game_id) as count from game_info as a';

    let rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    rows = [ ...rows ];
    const count = await this.app.model.query(sql_count, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    for (let i = 0; i < rows.length; i++) {
      const rows1 = await this.service.gameRoom.roomListB(rows[i].game_id);

      // console.log(rows1.rows);
      const gameList = [];
      for (let j = 0; j < rows1.rows.length; j++) {
        if (rows1.rows[j].status == 1) {
          gameList.push(`<span style="color:green">${rows1.rows[j].room_id}</span>`);
        } else if (rows1.rows[j].status == 2) {
          gameList.push(`<span style="color:red">${rows1.rows[j].room_id}</span>`);
        } else if (rows1.rows[j].status == 3) {
          gameList.push(`<span style="color:gray">${rows1.rows[j].room_id}</span>`);
        }

      }
      rows[i].gameList = gameList;
    }
    return { rows, count: count[0].count };
  }

  async roomListB(game_id) {

    const sql = `select a.*, b.game_name from room_info a left join game_info b on a.game_id = b.game_id where a.game_id = ${game_id} `;

    const rows = await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return { rows };
  }
  async editRoomB(params) {
    return await this.ctx.model.RoomInfo.update(
      {
        status: params.status,
      },
      { where: { room_id: params.room_id } }
    );
  }
}

module.exports = GameRoomService;
