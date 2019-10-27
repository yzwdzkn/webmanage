'use strict';

const Controller = require('egg').Controller;

class AccountMapController extends Controller {
  async add(account_id, username, account_type, transaction) {
    return await this.ctx.model.AccountMap.create({
      account_id,
      username,
      account_type,
    }, { transaction });
  }

  async update(username, account_id, account_type, transaction) {
    return await this.ctx.model.AccountMap.update({ username }, { where: { account_id, account_type } }, { transaction });
  }

  async delete(account_id, account_type, transaction) {
    return await this.ctx.model.AccountMap.destroy({ where: { account_id, account_type } }, { transaction });
  }

  async getAccountType(username) {
    return await this.ctx.model.AccountMap.findOne({
      where: { username },
    });
  }

}

module.exports = AccountMapController;
