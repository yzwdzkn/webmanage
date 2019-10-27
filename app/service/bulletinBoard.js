'use strict';

const Service = require('egg').Service;

class AdvertisingService extends Service {
  /*
  查询广告
    */
  async findList(page, limit) {
    return await this.ctx.model.BulletinBoard.findAndCountAll({
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
  }
  /*
   * 根据 id 获取公告
   * @param {*} id
   */
  async findById(id) {
    return await this.ctx.model.BulletinBoard.findOne({
      where: {
        id,
      },
    });
  }
  /*
   * 添加公告
   * @param {*} params
   */
  async addBulletinBoard(params) {
    console.log(params);
    return await this.ctx.model.BulletinBoard.create({
      title: params.title,
      img_url: params.file,
      start_time: params.start_time,
      stop_time: params.stop_time,
      create_time: new Date(),
      create_operator: params.create_operator,
      type: params.type,
    });
  }

  /*
  * 修改公告
  * @param {*} params
  */
  async editBulletinBoard(params) {
    console.log(params);
    return await this.ctx.model.BulletinBoard.update({
      title: params.title,
      img_url: params.file == 'undefined' ? params.img_url : params.file,
      start_time: params.start_time,
      stop_time: params.stop_time,
      create_time: new Date(),
      create_operator: params.create_operator,
      type: params.type,
    }, {
      where: {
        id: params.id,
      },
    });
  }
  /*
  * 根据id删除公告
  * @param {*} id
  */
  async deleteBulletinBoard(id) {

    return await this.ctx.model.BulletinBoard.destroy({
      where: {
        id: parseInt(id),
      },
    });
  }

}

module.exports = AdvertisingService;
