/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const pump = require('mz-modules/pump');
const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, SYSTEM, SHARE, OPERATION_TYPE_DELETE } = require('../../../tools/constant');

class ShareManageController extends Controller {
  async index() {
    const agents = await this.ctx.service.agent.findAgentByStatus(0);
    await this.ctx.render('platformManage/share_manage', {
      title: '分享管理',
      agents,
    });
  }

  /**
   * 获取分享列表
   */
  async list() {
    const { page, limit } = this.ctx.query;
    console.log(this.ctx.session.admin);
    const params = {};
    if (this.ctx.session.admin.type == 2) {
      params.agent_id = this.ctx.session.admin.id;
    }
    const result = await this.service.share.findList(parseInt(page), parseInt(limit), params);
    console.log(result);
    // console.log(JSON.parse(JSON.stringify(result)));
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  /**
   * 根据id获取分享
   */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.share.findById(id);
    this.ctx.body = {
      status: 0,
      share: result,
    };
  }


  /**
   * 添加或者修改分享
   */
  async saveShare() {

    const parts = this.ctx.multipart({ autoFields: true });
    let files = {};
    let stream;
    while ((stream = await parts()) != null) {
      if (!stream.filename) {
        break;
      }
      const fieldname = stream.fieldname; // file表单的名字

      // 上传图片的目录
      const dir = await this.service.tools.getUploadFile(stream.filename);
      const target = dir.uploadDir;
      const writeStream = fs.createWriteStream(target);

      await pump(stream, writeStream);

      files = Object.assign(files, {
        [fieldname]: dir.saveDir,
      });
    }

    const params = Object.assign(files, parts.field);
    if (params.action == 0) { // 添加分享
      const result = await this.service.share.addShare(params);
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, result, SYSTEM, SHARE);
    } else if (params.action == 1) { // 修改分享
      delete params.action;
      await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, SHARE);
      await this.service.share.editShare(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }

  /**
   * 根据id删除公告
   */
  async deleteShare() {
    const id = this.ctx.request.body.id;
    const params = { id };
    await this.service.operationLog.saveOperationLog(OPERATION_TYPE_DELETE, params, SYSTEM, SHARE);
    await this.service.share.deleteShare(id);
    this.ctx.body = {
      status: 0,
    };
  }
  /**
   * 根据代理id 获取下面的站点
   */
  async findStationByAgent() {
    const agent_id = await this.ctx.query.agent_id;
    const stations = await this.ctx.service.station.findByAgentId(agent_id);
    this.ctx.body = {
      status: 0,
      stations,
    };
  }
}
module.exports = ShareManageController;
