'use strict';

const Service = require('egg').Service;

class AdvertisingService extends Service {
  /*
  查询广告
    */
  async findList(page, limit) {
    return await this.ctx.model.Advertising.findAndCountAll({
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
  }
  /*
   * 根据 id 获取公告
   * @param {*} id
   */
  async findById(id) {
    return await this.ctx.model.Advertising.findOne({
      where: {
        id,
      },
    });
  }
  /*
   * 添加公告
   * @param {*} params
   */
  async addAdvertising(params) {
    return await this.ctx.model.Advertising.create({
      title: params.title,
      content: params.content,
      img_url: params.file,
      skip_url: params.skip_url,
      show_count: params.show_count,
      type: params.type,
      status: params.status,
    });
  }

  /*
  * 修改公告
  * @param {*} params
  */
  async editAdvertising(params) {
    return await this.ctx.model.Advertising.update({
      title: params.title,
      content: params.content,
      img_url: params.file == 'undefined' ? params.img_url : params.file,
      skip_url: params.skip_url,
      show_count: params.show_count,
      type: params.type,
      status: params.status,
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
    return await this.ctx.model.Advertising.update(
      { status },
      { where: { id } }
    );
  }
  /*
  * 根据id删除公告
  * @param {*} id
  */
  async deleteAdvertising(id) {

    return await this.ctx.model.Advertising.destroy({
      where: {
        id: parseInt(id),
      },
    });
  }

}

module.exports = AdvertisingService;
