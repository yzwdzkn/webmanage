/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-param */
'use strict';

const Service = require('egg').Service;
class HorselightService extends Service {


  /**
     * 查询公告列表
     */
  async findList(game_id, title, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      is_delete: 0,
      [Op.or]: [{ title: {
        [Op.like]: '%' + title + '%',
      } }, {
        description: {
          [Op.like]: '%' + title + '%',
        } }],

    };
    if (game_id != '0') {
      where.game_id = game_id;
    }
    return await this.ctx.model.Horselight.findAndCountAll({
      where,
      offset: (page - 1) * limit, // 每页起始位置
      limit,
      order: [[ 'create_time', 'DESC' ]],
      include: {
        model: this.ctx.model.GameInfo,
        attributes: [ 'game_name' ],
      },
    });
  }


  /**
     * 根据 id 获取公告
     * @param {*} id
     */
  async findById(id) {
    return await this.ctx.model.Horselight.findOne({
      where: {
        id,
      },
    });
  }

  /**
     * 添加公告
     * @param {*} params
     */
  async addHorselight(params) {
    return await this.ctx.model.Horselight.create({
      start_time: params.start_time,
      stop_time: params.stop_time,
      title: params.title,
      game_id: params.game,
      description: params.description,
      interval: params.interval,
      create_operator: params.create_operator,
      create_time: new Date(),
      status: 1,
    });
  }

  /**
     * 修改公告
     * @param {*} params
     */
  async editHorselight(params) {
    return await this.ctx.model.Horselight.update({
      start_time: params.start_time,
      stop_time: params.stop_time,
      title: params.title,
      game_id: params.game,
      interval: params.interval,
      description: params.description,
      revise_operator: params.revise_operator,
      revise_time: new Date(),
    }, {
      where: {
        id: params.id,
      },
    });
  }
  /*
   * 修改状态
   */
  async changeStatus(id, status) {
    return await this.ctx.model.Horselight.update(
      { status },
      { where: { id } }
    );
  }
  /**
     * 根据id删除公告(软删除)
     * @param {*} id
     */
  async deleteHorselight(id) {

    return await this.ctx.model.Horselight.update({
      is_delete: 1,
    }, {
      where: {
        id: parseInt(id),
      },
    });
  }
  /**
     * 根据id删除公告
     * @param {*} id
     */
  // async deleteHorselight(id) {

  //   return await this.ctx.model.Horselight.destroy({
  //     where: {
  //       id: parseInt(id),
  //     },
  //   });
  // }

}

module.exports = HorselightService;
