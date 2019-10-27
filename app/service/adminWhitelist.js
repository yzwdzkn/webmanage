'use strict';

const Service = require('egg').Service;
class AdminWhitelistService extends Service {

  /**
     * 查询白名单列表
     */
  async findList(ip, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.AdminWhitelist.findAndCountAll({
      where: {
        is_delete: 0,
        ip: {
          [Op.like]: '%' + ip + '%',
        },
      },
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
  }

  /**
     * 根据 id 获取白名单
     * @param {*} id
     */
  async findById(id) {
    return await this.ctx.model.AdminWhitelist.findOne({
      where: {
        is_delete: 0,
        id,
      },
    });
  }

  /**
     * 根据 ip 获取白名单
     * @param {*} ip
     */
  async findByIp(ip) {
    return await this.ctx.model.AdminWhitelist.findOne({
      where: {
        is_delete: 0,
        ip,
      },
    });
  }

  async findAll() {
    return await this.ctx.model.AdminWhitelist.findAll({
      where: {
        is_delete: 0,
      },
    });
  }


  /**
     * 根据 username 获取白名单
     * @param {*} username
     */
  async findByUsername(username) {
    return await this.ctx.model.AdminWhitelist.findOne({
      where: {
        is_delete: 0,
        username,
      },
    });
  }

  /**
     * 添加白名单
     * @param {*} params
     */
  async addWhitelist(params) {
    return await this.ctx.model.AdminWhitelist.create({
      ip: params.ip,
      description: params.description,
      create_operator: params.create_operator,
      create_time: new Date(),
    });
  }

  /**
     * 修改白名单
     * @param {*} params
     */
  async editWhitelist(params) {
    return await this.ctx.model.AdminWhitelist.update(
      {
        ip: params.ip,
        description: params.description,
      },
      {
        where: {
          id: params.id,
        },
      }
    );
  }
  /**
     * 根据id删除白名单(软删除)
     * @param {*} id
     */
  async deleteWhitelist(id) {
    return await this.ctx.model.AdminWhitelist.update({
      is_delete: 1,
    }, {
      where: {
        id: parseInt(id),
      },
    });
  }
  /**
     * 根据id删除白名单
     * @param {*} id
     */
  // async deleteWhitelist(id) {
  //   return await this.ctx.model.AdminWhitelist.destroy({
  //     where: {
  //       id: parseInt(id),
  //     },
  //   });
  // }

  /**
     * 查询白名单的所有记录长度
     */
  async findCountAll() {
    return await this.ctx.model.AdminWhitelist.count({
      where: {
        is_delete: 0,
      },
    });
  }

}

module.exports = AdminWhitelistService;
