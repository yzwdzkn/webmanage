'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const qs = require('querystring');
const pump = require('mz-modules/pump');
// const { OPERATION_TYPE_CREATE, OPERATION_TYPE_UPDATE, SYSTEM, SHARE } = require('../../../tools/constant');

class AdvertisingController extends Controller {
  async index() {
    await this.ctx.render('platformManage/advertising', {
      title: '广告管理',
    });
  }
  /**
     * 获取广告列表
     */
  async list() {
    const { page, limit } = this.ctx.query;
    const result = await this.service.advertising.findList(parseInt(page), parseInt(limit));
    console.log('hh', result);
    this.ctx.body = {
      data: result.rows,
      msg: '',
      count: result.count,
      code: 0,
    };
  }
  /**
     * 根据id获取广告
     */
  async get() {
    const id = this.ctx.request.body.id;
    const result = await this.service.advertising.findById(id);
    this.ctx.body = {
      status: 0,
      advertising: result,
    };
  }
  /**
     * 添加或者修改广告
     */
  async saveAdvertising() {

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
      await this.service.advertising.addAdvertising(params);
    //   await this.service.operationLog.saveOperationLog(OPERATION_TYPE_CREATE, result, SYSTEM, SHARE);
    } else if (params.action == 1) { // 修改分享
    //   delete params.action;
      //   await this.service.operationLog.saveOperationLog(OPERATION_TYPE_UPDATE, params, SYSTEM, SHARE);
      await this.service.advertising.editAdvertising(params);
    }
    this.ctx.body = {
      status: 0,
    };
  }
  /**
   * 修改用户状态
   */
  async AdvertisingStatus() {
    try {
      const { id, status } = this.ctx.request.body;
      const user = await this.ctx.service.advertising.findById(id);
      const url = this.app.config.gameServerURl + 'updatePlayerStatus?' + qs.stringify({ account: user.username, status, agent: this.app.config.defualtPlatformId });
      await this.service.tools.sendServerGetRequest(url, 10000); // 更新服务器会员状态
      await this.ctx.service.advertising.changeStatus(id, status); // 更新数据库会员状态
      this.ctx.body = { data: '', msg: '修改成功', count: 1, status: 0 };

    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '',
      };
    }
  }

  /**
         * 根据id删除广告
         */
  async deleteAdvertising() {
    const id = this.ctx.request.body.id;
    await this.service.advertising.deleteAdvertising(id);
    this.ctx.body = {
      status: 0,
    };
  }

}

module.exports = AdvertisingController;
