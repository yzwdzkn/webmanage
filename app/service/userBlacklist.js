'use strict';

const Service = require('egg').Service;

const libqqwry = require('lib-qqwry');
const qqwry = libqqwry(); // 初始化IP库解析器
qqwry.speed(); // 启用急速模式;

class UserBlacklistService extends Service {

  /**
   * 查询白名单列表
   * @param {*} ip
   * @param {*} page
   * @param {*} limit
   */
  async findList(ip, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    return await this.ctx.model.UserBlacklist.findAndCountAll({
      where: {
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
    return await this.ctx.model.UserBlacklist.findOne({
      where: {
        id,
      },
    });
  }

  /**
     * 根据 ip 获取白名单
     * @param {*} ip
     */
  async findByIp(ip) {
    return await this.ctx.model.UserBlacklist.findOne({
      where: {
        ip,
      },
    });
  }


  /**
     * 根据 username 获取白名单
     * @param {*} username
     */
  async findByUsername(username) {
    return await this.ctx.model.UserBlacklist.findOne({
      where: {
        username,
      },
    });
  }

  /**
     * 添加白名单
     * @param {*} params
     */
  async addUserBlacklist(params) {
    const ip1 = qqwry.searchIP(params.ip); // 根据ip查询所在区域
    return await this.ctx.model.UserBlacklist.create({
      ip: params.ip,
      region: ip1.Country,
      description: params.description,
      create_operator: params.create_operator,
      create_time: new Date(),
    });
  }

  /**
     * 修改白名单
     * @param {*} params
     */
  async editUserBlacklist(params) {
    const ip1 = qqwry.searchIP(params.ip); // 根据ip查询所在区域
    return await this.ctx.model.UserBlacklist.update(
      {
        ip: params.ip,
        region: ip1.Country,
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
     * 根据id删除白名单
     * @param {*} id
     */
  async deleteUserBlacklist(id) {
    return await this.ctx.model.UserBlacklist.destroy({
      where: {
        id: parseInt(id),
      },
    });
  }

  /**
     * 查询白名单的所有记录长度
     */
  async findCountAll() {
    return await this.ctx.model.UserBlacklist.count();
  }

}

module.exports = UserBlacklistService;
