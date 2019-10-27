'use strict';
/**
 * 提供给平台的api接口
 */
module.exports = app => {
  const verify = app.middleware.verify(app);
  app.router.get('/platformApi', verify, app.controller.api.platformServer.platformServer.index); // dq 10-16

};
