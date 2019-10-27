'use strict';
// const statusCode = require('../tools/statusCode');
const Controller = require('egg').Controller;

class ErrorManage extends Controller {
  constructor(ctx) {
    super(ctx);
    this.errorMsg = {
      1062: '账户或者id值重复',
    };
  }

  errorMessage(error) {
    let msg = this.errorMsg[error.message];
    if (msg === undefined) msg = '内部错误';
    return { msg, status: error.message };
  }
}

module.exports = ErrorManage
;
