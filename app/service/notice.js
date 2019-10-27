/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-param */
'use strict';

const Service = require('egg').Service;
class NoticeService extends Service {


  /**
     * 查询公告列表
     */
  async findList(game_id, title, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      title: {
        [Op.like]: '%' + title + '%',
      },
    };
    if (game_id != '0') {
      where.game_id = game_id;
    }
    return await this.ctx.model.Notice.findAndCountAll({
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
    return await this.ctx.model.Notice.findOne({
      where: {
        id,
      },
    });
  }
  /**
     * 添加公告
     * @param {*} params
     */
  async addNotice(params) {
    console.log('params', params);
    return await this.ctx.model.Notice.create({
      start_time: params.start_time,
      stop_time: params.stop_time,
      title: params.title,
      game_id: params.game,
      description: params.description,
      create_operator: params.create_operator,
      create_time: new Date(),
      state: params.state,
    });
  }

  /**
     * 修改公告
     * @param {*} params
     */
  async editNotice(params) {
    console.log('params', params);
    return await this.ctx.model.Notice.update({
      start_time: params.start_time,
      stop_time: params.stop_time,
      title: params.title,
      game_id: params.game,
      description: params.description,
      revise_operator: params.revise_operator,
      revise_time: new Date(),
      state: params.state,
    }, {
      where: {
        id: params.id,
      },
    });
  }
  /**
     * 根据id删除公告
     * @param {*} id
     */
  async deleteNotice(id) {

    return await this.ctx.model.Notice.destroy({
      where: {
        id: parseInt(id),
      },
    });
  }

}

module.exports = NoticeService;
