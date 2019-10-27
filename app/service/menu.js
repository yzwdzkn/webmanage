/* eslint-disable jsdoc/check-param-names */
/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;
class MenuService extends Service {


  /**
     * 查询菜单列表
     */
  async findList(module_id) {
    return await this.ctx.model.Menu.findAll({
      where: {
        is_delete: 0,
        module_id,
      },
      order: [[ 'sort', 'ASC' ]],
      include: {
        model: this.ctx.model.Menu,
      },
    });
  }

  /**
     * 根据 id 获取菜单
     * @param {*} id
     */
  async findById(id) {
    return await this.ctx.model.Menu.findOne({
      where: {
        is_delete: 0,
        id,
      },
      include: {
        model: this.ctx.model.Menu,
      },
    });
  }

  /**
     * 查询树菜单
     */
  async findListTree(params = { is_delete: 0 }) {

    return await this.ctx.model.Menu.findAll({
      where: params,
      order: [[ 'sort', 'ASC' ]],
    });
  }

  /**
   * 查询代理菜单信息
   */
  async findAgentTree() {
    return await this.ctx.model.Menu.findAll({
      where: {
        is_delete: 0,
        defualt_agent: 1,
      },
      order: [[ 'sort', 'ASC' ]],
    });
  }

  /**
   * 保存代理或者站点的授权菜单
   * @param {*} type 0 操作代理菜单，1操作站点菜单
   * @param {*} menuIds
   */
  async updateAgentOrStationAuth(menuIds) {
    const Op = this.ctx.model.Sequelize.Op;
    const ids = menuIds.split(',').map(item => +item);
    let transaction;
    try {
      // egg-sequelize会将sequelize实例作为app.model对象
      transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
      await this.ctx.model.Menu.update(
        {
          defualt_agent: 0,
        }
        ,
        {
          where: {},
          transaction,
        }
      );

      const reuslt = await this.ctx.model.Menu.update(
        {
          defualt_agent: 1,
        },
        {
          where: {
            id: {
              [Op.in]: ids,
            },
          },
          transaction,
        }
      );
      await transaction.commit();
      return reuslt;
    } catch (err) {
      await transaction.rollback();
      return null;
    }

  }

  /**
     * 添加菜单
     * @param {*} params
     */
  async addMenu(params) {
    return await this.ctx.model.Menu.create({
      module_name: params.module_name,
      module_id: params.module_id,
      type: params.type,
      sort: params.sort,
      url: params.url,
      icon: params.icon,
      identify: params.identify,
      description: params.description,
      status: params.status,
      is_platform: params.is_platform,
      is_agent: params.is_agent,
      create_time: new Date(),
      update_time: new Date(),
    });
  }

  /**
   * 编辑菜单
   * @param {*} params
   */
  async editMenu(params) {
    return await this.ctx.model.Menu.update(
      {
        module_name: params.module_name,
        module_id: params.module_id,
        type: params.type,
        sort: params.sort,
        url: params.url,
        icon: params.icon,
        identify: params.identify,
        description: params.description,
        status: params.status,
        is_platform: params.is_platform,
        is_agent: params.is_agent,
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
     * 根据id删除菜单（软删除）
     * @param {*} id
     */
  async deleteMenu(id) {
    return await this.ctx.model.Menu.update({
      is_delete: 1,
    }, {
      where: {
        id: parseInt(id),
      },
    });
  }
  /**
     * 根据id删除菜单
     * @param {*} id
     */
  // async deleteMenu(id) {
  //   return await this.ctx.model.Menu.destroy({
  //     where: {
  //       id: parseInt(id),
  //     },
  //   });
  // }

  /**
     * 查询账户拥有的权限菜单
     * @param {*} menu_ids
     */
  async findAuthList(is_super, menu_ids) {
    const Op = this.ctx.model.Sequelize.Op;
    let idWhere;
    if (is_super == 0) { // 1是超级管理员 0 不是
      idWhere = {
        [Op.in]: menu_ids.split(','),
      };
    } else { // 超级管理员查询所有权限
      idWhere = {
        [Op.notIn]: [],
      };
    }

    return await this.ctx.model.Menu.findAll({
      where: {
        is_delete: 0,
        id: idWhere,
        status: 0,
      },
      order: [[ 'sort', 'ASC' ]],
      attributes: { // 查询排除下面的字段
        exclude: [ 'description', 'create_time', 'update_time' ],
      },
    });
  }

  /**
  * 根据菜单id获取它的子菜单
  * @param {*} menu_id
  */
  async findChildMenuById(menu_id) {
    return await this.ctx.model.Menu.findAll({
      where: {
        is_delete: 0,
        module_id: menu_id,
      },
      order: [[ 'sort', 'ASC' ]],
      attributes: { // 查询排除下面的字段
        exclude: [ 'description', 'create_time', 'update_time' ],
      },
    });
  }

}

module.exports = MenuService;
