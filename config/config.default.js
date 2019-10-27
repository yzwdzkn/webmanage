/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint valid-jsdoc: "off" */

'use strict';
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1554885692868_2360';

  // add your middleware config here
  config.middleware = [ 'compress', 'adminauth' ];

  config.compress = {
    threshold: 2048, // 它支持指定只有当 body 大于配置的 threshold 时才进行 gzip 压缩 2048B
  };

  config.adminauth = {
    match: '/admin',
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.disableTimer = false; // 是否关闭定时器
  config.MQ = true; // 是否启动消息队列
  config.statisticMQ = true; // 统计数据消息队列

  config.tokenSecret = 'tokenYYYYYY';// 生成token的签名
  config.tokenTimeOut = 120; // 秒 token 超时时间
  config.gameServerURl = 'http://192.168.1.61:8051/';// 游戏服务器地址
  config.forwordUrl = 'http://127.0.0.1:5001/forward/'; // 前端机URL地址
  config.server_version = '';

  config.uploadDir = 'app/public/admin/upload'; // 图片上传路径

  config.cluster = {
    listen: {
      port: 7005, // 开放端口
      hostname: '0.0.0.0',
    },
  };

  // 配置csrf 忽略的路由
  config.security = {
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url == '/gameServer' || ctx.request.url == '/clientServer' || ctx.request.url == '/gameRecordServer' || ctx.request.url == '/gameRecordServer/mergeRecordHandle' || ctx.request.url == '/statistics') {
          return true;
        }
        return false;
      },
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };


  config.sequelize = {
    dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
    database: 'a', // 数据库名
    host: '192.168.0.66',
    port: '3306',
    username: 'root', // 账号
    password: '123456', // 密码
    timezone: '+08:00', // 保存为本地时区,mysql保存时会自动保存为UTC格式
    dialectOptions: {
      dateStrings: true,
      typeCast(field, next) {
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
    logging(sql) { // 是否输出sql日志
      // console.log(sql);
    },

  };

  config.session = {
    key: 'SESSION_ID', // 设置 Session cookies 里面的 key
    maxAge: 1000 * 60 * 10, // 10 分钟
    httpOnly: true,
    encrypt: true,
    renew: true, // 每次刷新页面，Session 都会被延期。
  };

  // 配置 ejs 模板引擎
  config.view = {
    mapping: {
      '.html': 'ejs',
    },
  };

  // 设置跨域
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ '*' ],
    secretKey: 'kkmanage', // token key
    expiresIn: 60 * 60 * 24, // token expires time
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '10MB',
    jsonLimit: '10MB',
    strict: true,
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
  };

  config.onerror = {
    all(err, ctx) {
      ctx.body = JSON.stringify(err);
      ctx.status = 500;
    },
  };

  config.extension = {
    password: '123456',
    link: 'http://www.baidu.com',
  };

  return {
    ...config,
    ...userConfig,
  };
};
