'use strict';

const Controller = require('egg').Controller;
// const moment = require('moment');
// const tools = require('../../../tools/tools');

class historyDataManageController extends Controller {
  async index() {
    await this.ctx.render('operateManage/history_data', {
      title: '历史数据',
    });
  }

  async initData() {
    try {
      const result = await this.ctx.service.historyData.initData();
      const day = [];
      const value = [];
      for (let i = 0; i < result.length; i++) {
        day.push(result[i].date);
        value.push(result[i].gold);
      }

      // const gamebetData = await this.ctx.service.historyData.gameBet();
      // const userActiveData = await this.ctx.service.historyData.userActive();
      //  await this.ctx.service.historyData.userRegisterCount();
      const [ gamebetData, userActiveData, userRegisterCount ] = await Promise.all([
        this.ctx.service.historyData.gameBet(),
        this.ctx.service.historyData.userActive(),
        this.ctx.service.historyData.userRegisterCount(),
      ]);

      this.ctx.body = {
        data: {
          day,
          value,
          gamebetData,
          userActiveData,
          userRegisterCount,
        },
        msg: '',
        code: 0 };
    } catch (error) {
      console.log(error);
      this.ctx.body = { data: '', msg: '', status: '' };
    }
  }
}

module.exports = historyDataManageController;
