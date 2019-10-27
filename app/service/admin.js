/* eslint-disable jsdoc/require-param */
'use strict';

const Service = require('egg').Service;
class AdminService extends Service {

  /**
     * 查询账户列表
     */
  async findList(username, page, limit, status) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      is_delete: 0,
      username: {
        [Op.like]: '%' + username + '%',
      },
      is_super: 0,
    };
    // if (type != -1) {
    //   where.type = type;
    // }
    if (status != -1) {
      where.status = status;
    }
    return await this.ctx.model.Admin.findAndCountAll({
      where,
      offset: (page - 1) * limit, // 每页起始位置
      limit,
      include: {
        model: this.ctx.model.Role,
      },
    });
  }

  /**
     * 根据 id 获取账户
     * @param {*} id
     */
  async findById(id) {
    return await this.ctx.model.Admin.findOne({
      where: {
        id,
      },
    });
  }


  /**
     * 根据 username 获取账户
     * @param {*} username
     */
  async findByUsername(username) {
    return await this.ctx.model.Admin.findOne({
      where: {
        username,
      },
    });
    // return await this.ctx.model.Admin.findOne({
    //   where: {
    //     username,
    //   },
    // });
  }

  /**
     * 添加账户
     * @param {*} params
     */
  async addAdmin(params) {
    const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      const addResult = await this.ctx.model.Admin.create({
        username: params.username,
        password: params.password,
        nickname: params.nickname,
        role_id: params.role_id,
        description: params.description,
        status: params.status,
        type: params.type,
        create_time: new Date(),
      }, { transaction });
      await this.service.accountMap.add(addResult.id, addResult.username, 'Admin', transaction);
      await transaction.commit();
      return addResult;

    } catch (error) {
      await transaction.rollback();
      throw new Error(error.original.errno);
    }
  }

  /**
     * 账户修改
     * @param {*} params
     */
  async editAdmin(params) {
    return await this.ctx.model.Admin.update(
      {
        role_id: params.role_id,
        nickname: params.nickname,
        description: params.description,
        status: params.status,
        type: params.type,
      },
      {
        where: {
          id: params.id,
        },
      }
    );
  }

  /**
     * 更新登录时间
     * @param {*} id
     */
  async updateLastLoginTime(id) {
    return await this.ctx.model.Admin.update(
      {
        last_login_time: new Date(),
      },
      {
        where: {
          id,
        },
      }
    );
  }

  async editPassword(id, newPassword) {
    return await this.ctx.model.Admin.update(
      {
        password: newPassword,
      },
      {
        where: {
          id,
        },
      }
    );
  }


  /**
     * 根据id删除账户(软删除)
     * @param {*} id
     */
  async deleteAdmin(id) {
    // const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      const result = await this.ctx.model.Admin.update({
        is_delete: 1,
      }, {
        where: {
          id: parseInt(id),
        },
        // transaction,
      });
      // await this.service.accountMap.delete(id, 'Admin', transaction);
      // await transaction.commit();
      return result;
    } catch (error) {
      // await transaction.rollback();
      throw new Error(error.original.errno);
    }
  }
  /**
     * 根据id删除账户
     * @param {*} id
     */
  // async deleteAdmin(id) {
  //   const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
  //   try {
  //     const result = await this.ctx.model.Admin.destroy({
  //       where: {
  //         id: parseInt(id),
  //       },
  //       transaction,
  //     });
  //     await this.service.accountMap.delete(id, 'Admin', transaction);
  //     await transaction.commit();
  //     return result;
  //   } catch (error) {
  //     await transaction.rollback();
  //     throw new Error(error.original.errno);
  //   }

  // }

  async findAll() {
    return await this.ctx.model.Admin.findAll({
      where: { is_delete: 0 },
    }
    );
  }
}

module.exports = AdminService;
