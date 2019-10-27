'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // admin 后台管理系统的接口
  require('./routes/admin/dataManage')(app); // 数据管理
  require('./routes/admin/operateManage')(app); // 运营管理
  require('./routes/admin/gameManage')(app); // 游戏管理
  require('./routes/admin/platformManage')(app); // 平台管理
  require('./routes/admin/systemSetting')(app); // 系统设置
  // require('./routes/admin/billManage')(app); // 账单管理
  require('./routes/admin/riskManagement')(app); // 风控管理
  require('./routes/admin/userManage')(app); // 会员管理
  require('./routes/admin/gameDataManage')(app); // 游戏数据
  require('./routes/BTerminal')(app); // B端路由
  // api 接口

  require('./routes/api/gameServer')(app); // 和服务端通信的接口

  require('./routes/api/platformServer')(app); // 处理客户端发送的请求


  // 其他请求
  router.redirect('/', '/admin', 302); // 重定向到主页
  router.get('/admin', controller.home.index); // 主界面
  router.get('/login', controller.home.login); // 登录界面
  router.get('/logout', controller.home.logout); // 退出登录
  router.post('/doLogin', controller.home.doLogin); // 登录请求
  router.post('/admin/editPassword', controller.home.editPassword); // 修改密码
  router.get('/verifCode', controller.home.generateVerifCode); // 获取验证码

  router.get('/welcome', controller.home.welcome); // 欢迎页

  router.get('/test', controller.home.test); // 欢迎页
};
