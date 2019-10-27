'use strict';

const Service = require('egg').Service;
class RoleService extends Service {


  /**
   * 查询角色列表
   * @param {*} type
   */
  async findList(page, limit) {
    console.log('lllllll');
    // const Op = this.ctx.model.Sequelize.Op;
    const where = {
      is_delete: 0,
      // name: {
      //   [Op.like]: '%' + name + '%',
      // },
    };
    // if (type != -1) {
    //   where.type = type;
    // }
    // if (status != -1) {
    //   where.status = status;
    // }
    return await this.ctx.model.Role.findAndCountAll({
      where,
      offset: (page - 1) * limit, // 每页起始位置
      limit,
    });
  }

  /**
   * 根据type查询正常的角色列表
   * @param {*} type
   */
  async findRoles(type) {
    return await this.ctx.model.Role.findAll({
      where: {
        type,
        status: 0,
      },
      attributes: [ 'id', 'name' ],
    });
  }


  /**
     * 根据 id 获取角色
     * @param {*} id
     */
  async findById(id) {
    return await this.ctx.model.Role.findOne({
      where: {
        id,
      },
    });
  }

  /**
     * 添加角色
     * @param {*} params
     */
  async addRole(params) {
    return await this.ctx.model.Role.create({
      name: params.name,
      description: params.description,
      status: params.status,
      type: params.type,
      create_time: new Date(),
      update_time: new Date(),
    });
  }

  /**
     * 修改角色
     * @param {*} params
     */
  async editRole(params) {
    return await this.ctx.model.Role.update(
      {
        name: params.name,
        description: params.description,
        status: params.status,
        type: params.type,
        update_time: new Date(),
      },
      {
        where: {
          id: params.id,
        },
      }
    );
  }

  /**
     * 更改授权菜单
     * @param {*} id 角色id
     * @param {*} menuIds 授权菜单id集合
     */
  async updateRoleAuthorizationMenu(id, menuIds) {
    return await this.ctx.model.Role.update(
      {
        menu_ids: menuIds,
        update_time: new Date(),
      },
      {
        where: {
          id,
        },
      }
    );
  }

  /**
     * 根据id删除角色(软删除)
     * @param {*} id
     */
  async deleteRole(id) {
    return await this.ctx.model.Role.update({
      is_delete: 1,
    }, {
      where: {
        id: parseInt(id),
      },
    });
  }
  /**
     * 根据id删除角色
     * @param {*} id
     */
  // async deleteRole(id) {
  //   return await this.ctx.model.Role.destroy({
  //     where: {
  //       id: parseInt(id),
  //     },
  //   });
  // }

}

module.exports = RoleService;
