'use strict';

const Controller = require('egg').Controller;

class AgentAuthController extends Controller {
  async index() {
    await this.ctx.render('systemSetting/agent_auth', {
      title: '代理和站点权限设置',
    });
  }

  /**
     * 获取菜单列表
     */
  async list() {
    const module_id = this.ctx.query.module_id || 0;
    const result = await this.service.menu.findList(module_id);
    this.ctx.body = {
      data: result,
      msg: '',
      count: result.length,
      code: 0,
    };
  }

  /**
     * 获取菜单树节点
     */
  async initTree() {
    const module_id = this.ctx.request.body.module_id;
    let agentTreeData = await this.service.menu.findAgentTree();
    agentTreeData = await this.service.tools.recombinationMenuTree(agentTreeData, module_id);
    this.ctx.body = {
      status: 0,
      agentTreeData,
    };
  }

  /**
     * 获取代理获取站点授权的菜单信息
     */
  async agentStationAuthMenu() {
    const result = await this.service.menu.findListTree({ is_agent: 1, status: 0 }); // 查询代理能拥有的菜单
    let treeAll = await this.service.tools.recombinationMenuTree(result, 0); // 将菜单重新组合
    const treeData = await this.service.menu.findAgentTree(); // 查询代理默认的菜单
    const ids = [];
    for (let i = 0; i < treeData.length; i++) {
      ids.push(treeData[i].id);
    }
    await this.service.tools.selectAuthorizationMenu(treeAll, ids); // 将拥有的菜单选中
    treeAll = [
      {
        id: 0,
        name: '顶级菜单',
        open: true,
        checked: (ids.length > 0),
        children: treeAll,
      },
    ];

    this.ctx.body = {
      status: 0,
      tree: treeAll,
    };
  }


  /**
     * 保存代理授权菜单
     */
  async saveAgentStationAuthMenu() {
    const { menuIds } = this.ctx.request.body;
    const result = await this.service.menu.updateAgentOrStationAuth(menuIds);
    if (result) {
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: 1,
      };
    }

  }

}

module.exports = AgentAuthController;
