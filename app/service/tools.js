/* eslint-disable jsdoc/check-param-names */
/* eslint-disable jsdoc/require-param */
/* eslint-disable prefer-const */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
'use strict';

const Service = require('egg').Service;
const request = require('request');
const moment = require('moment');
const schedule = require('node-schedule');
const sd = require('silly-datetime');
const path = require('path');
const qs = require('querystring');
const crypto = require('crypto');
const mkdirp = require('mz-modules/mkdirp');
const code = require('../tools/statusCode');

const timers = {}; // 定时器列表
class ToolsService extends Service {


  /**
     * 钱转游戏币
     * @param {*} money
     */
  async moneyToGold(money) {
    return parseFloat(money * 100).toFixed(0);
  }

  /**
     * 金币转钱
     * @param {*} money
     */
  async goldToMoney(money) {
    return parseFloat((money / 100).toFixed(2));
  }

  /**
     * 响应数据消息
     */
  async resEnd(resultData, data) {
    if (data) {
      this.ctx.logger.info('收到：' + JSON.stringify(data) + ' 响应:' + JSON.stringify(resultData));
    } else {
      this.ctx.logger.info('响应： status:' + JSON.stringify(resultData));
    }
    this.ctx.body = JSON.stringify(resultData);
  }

  /**
     * 生成token
     */
  async createToken(data, timeout) {
    const payload = {
      data,
      created: parseInt(Date.now() / 1000), // token生成的时间的，单位秒
      exp: parseInt(timeout) || this.app.config.tokenTimeOut || 120, // token有效期
    };

    // payload信息
    const base64Str = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');

    const hash = crypto.createHmac('sha256', this.app.config.tokenSecret);
    hash.update(base64Str);
    const signature = hash.digest('base64');
    return base64Str + '.' + signature;
  }

  async checkToken(token, data) {
    const resDecode = await this.decodeToken(token);
    if (!resDecode) {
      return false;
    }
    if (data != resDecode.payload.data) {
      return false;
    }
    // 是否过期
    const expState = !((parseInt(Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp));
    if (resDecode.signature === resDecode.checkSignature && expState) {
      return true;
    }
    return false;
  }

  async decodeToken(token) {
    const decArr = token.split('.');
    if (decArr.length < 2) {
      // token不合法
      return false;
    }

    let payload = {};
    // 将payload json字符串 解析为对象
    try {
      payload = JSON.parse(Buffer.from(decArr[0], 'base64').toString('utf8'));
    } catch (e) {
      return false;
    }

    const hash = crypto.createHmac('sha256', this.app.config.tokenSecret);
    hash.update(decArr[0]);
    const checkSignature = hash.digest('base64');
    return {
      payload,
      signature: decArr[1],
      checkSignature,
    };
  }

  async desEncode(desKey, data) {
    const cipherChunks = [];
    const cipher = crypto.createCipheriv('aes-128-ecb', desKey, '');
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
    cipherChunks.push(cipher.final('base64'));

    return cipherChunks.join('');
  }

  /**
     * 判断玩家庄闲
     * @param {*} gameName
     * @param {*} cardValue
     * @param {*} chairId
     */
  async getBanker(gameName, cardValue, chairId) {
    let result = '';
    if (gameName == '炸金花'
              || gameName == '龙虎'
              || gameName == '21点'
              || gameName == '十三水'
              || gameName == '百家乐') { return '闲'; }

    const bankerId = cardValue.substr(cardValue.length - 1);
    if (bankerId == chairId) {
      result = gameName == '斗地主' ? '地主' : '庄';
    } else {
      result = gameName == '斗地主' ? '农民' : '闲';
    }
    return result;
  }

  /**
     * 初始金额处理
     * @param {*} gameName
     * @param {*} curScore
     * @param {*} TakeScore
     */
  async getInitialScore(gameName, curScore, TakeScore) {
    if (gameName == '德州扑克') { return curScore + TakeScore; }
    return TakeScore;
  }

  /**
   * 生成加密ak 校验
   * 生成规则：将所有其他参数构成的js对象，按参数名排序后转成JSON格式
   * （若有参数值为Object格式，也要同样处理），设为x，平台授权密钥设为y，那么ak = MD5( x + “:” + y )
   */
  async createEncryptionAk(data, md5Key) {
    data = this._sortObjectKeys(data);
    console.log('生成ak：', JSON.stringify(data) + ':' + md5Key);
    const ak = crypto.createHash('md5').update(JSON.stringify(data) + ':' + md5Key).digest('hex');
    return ak;
  }

  /**
  * 将json对象里的参数进行排序
  * @param {*} obj
  */
  _sortObjectKeys(obj) {
    const tmp = {};
    Object.keys(obj).sort().forEach(function(k) {
      if (obj[k] instanceof Object && Object.prototype.toString.call(obj[k]) != '[object Array]') {
        tmp[k] = this._sortObjectKeys(obj[k]);
      } else {
        tmp[k] = obj[k];
      }
    });
    return tmp;
  }

  /**
     * 发送get请求到服务器
     */
  async sendServerGetRequest(url, time = 10000) {
    try {
      return await new Promise((resolve, reject) => {
        request({ url, timeout: time }, function(error, response, responseData) {
          if (error || response.statusCode != 200 || responseData == '') {
            reject(new Error());
          } else {
            resolve(responseData);
          }

        });
      }).then(data => {
        if (data) {
          return JSON.parse(data);
        }
        return {};
      });
    } catch (e) {
      return {};
    }
  }

  /**
     * 定时执行任务
     * @param {*} schedule_id 定时器id
     * @param {*} date 执行时间
     * @param {*} params 方法的参数
     * @param {*} fun 要执行的函数
     */
  async scheduleSendRequest(schedule_id, date, params, fun) {
    if (timers[schedule_id]) {
      timers[schedule_id].cancel(); // 取消之前设置的定时
    }
    const timer = schedule.scheduleJob(date, function() {
      fun(params);
      timers[schedule_id].cancel();
      delete timers[schedule_id];
    });
    timers[schedule_id] = timer; // 将新的定时添加到列表
  }

  /**
     * 根据传过来的id将菜单重新组合
     * @param {*} dataArr 对象数组
     * @param {*} module_id 父类id
     */
  async recombinationMenuTree(dataArr, module_id, treeData = []) {
    for (let i = 0; i < dataArr.length; i++) {
      if (dataArr[i].module_id == module_id) {
        const item = {
          id: dataArr[i].id,
          pid: dataArr[i].module_id,
          name: dataArr[i].module_name,
          open: true,
        };

        const children = await this.recombinationMenuTree(dataArr, item.id); // 继续遍历自己的子菜单
        if (children.length > 0) { // 检查是否存在子菜单
          item.children = children;
        }
        treeData.push(item);
      }
    }
    return treeData;
  }

  /**
     * 选中授权的菜单
     * @param {*} treeData
     * @param {*} menuIds
     */
  async selectAuthorizationMenu(treeData, menuIds) {
    for (let i = 0; i < treeData.length; i++) {
      if (menuIds.indexOf(treeData[i].id) != -1) { // 判断是否有权限，有的话选中这个菜单节点
        treeData[i].checked = true;
      }
      if (treeData[i].children) {
        await this.selectAuthorizationMenu(treeData[i].children, menuIds);
      }
    }
  }

  /**
     * 生成菜单HTML
     * @param {*} authMenus
     * @param {*} module_id
     * @param {*} htmlStr
     */
  async generateMenuHtml(authMenus, module_id, htmlStr = '') {
    for (let i = 0; i < authMenus.length; i++) {
      if (authMenus[i].module_id == module_id) {

        if (authMenus[i].type == 0) {
          htmlStr += `<li class="treeview">
                  <a href="javascript:void(0)">${authMenus[i].icon ? '<i class="' + authMenus[i].icon + '"></i>' : ''} <span>${authMenus[i].module_name}</span> <i class="fa fa-angle-right"></i></a>
                  <ul class="treeview-menu child-menu">
                  `;
          htmlStr += await this.generateMenuHtml(authMenus, authMenus[i].id);// 继续遍历自己的子菜单
          htmlStr += '</ul></li>';

        } else {
          htmlStr += `<li><a href="javascript:;" class="amenu" data-href="${authMenus[i].url}" data-id="${authMenus[i].id}">${authMenus[i].icon ? '<i class="' + authMenus[i].icon + '"></i>' : ''}${authMenus[i].module_name}</a></li>`;
        }

      }
    }
    return htmlStr;
  }

  /**
     * 检查IP白名单是否可用
     * @param {*} ip
     */
  async checkAdminWhitelist(ip) {
    const whitelistCount = await this.service.adminWhitelist.findCountAll(); // 查看是否存在有白名单,没有的话就默认所有都能登录
    let flag = true;
    if (whitelistCount > 0) {
      flag = false;
      // const result = await this.service.adminWhitelist.findByIp(ip); //
      const rows = await this.service.adminWhitelist.findAll();
      for (let row of rows) {
        let reg = new RegExp(row.ip);
        if (reg.test(ip)) {
          flag = true;
          break;
        }
      }
      return flag;
    }
    return flag;
  }

  /**
   * 验证参数不为空
   * @param  {...any} data
   */
  async verifParamsIsNull(...data) {
    let params = [ ...data ];
    for (let i = 0; i < params.length; i++) {
      if (params[i] === null || params[i] === undefined || params[i] === '') {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取文件上传目录
   * @param {*} filename
   */
  async getUploadFile(filename) {
    // 1、获取当前日期     20180920
    let day = sd.format(new Date(), 'YYYYMMDD');
    // 2、创建图片保存的路径
    let dir = path.join(this.config.uploadDir, day);
    await mkdirp(dir); // 不存在就创建目录
    let date = Date.now(); /* 毫秒数*/
    // 返回图片保存的路径
    let uploadDir = path.join(dir, date + path.extname(filename));
    // app\public\admin\upload\20190914\1536895331444.png
    return {
      uploadDir,
      saveDir: this.ctx.origin + uploadDir.slice(3).replace(/\\/g, '/'),
    };
  }


  /**
   * 用户名截取
   */
  async usernameIntercept(usernameStr, platform) {
    let pm = usernameStr.substring(usernameStr.lastIndexOf('@') + 1, usernameStr.length);
    if (pm !== String(platform)) {
      return usernameStr;
    }
    return usernameStr.substring(0, usernameStr.lastIndexOf('@'));
  }

  /**
   * 判断是否是正整数
   */
  async isPositiveNumber(number) {
    let regPos = /^\d+(\.\d+)?$/;
    if (regPos.test(number)) return true;
    return false;
  }

  /**
   * 随机生成字符串
   * @param {*} length 长度
   */
  async generateRandomStr(length) {
    length = length || 32;
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }

  /**
   * 定时回调下分
   * @param {*} key_name
   */
  async setTimeOutCallbackLowerScore(key_name) {
    setTimeout(async () => {
      let redisData = await this.app.redis.get(key_name);
      if (redisData) { // 判断 secret_key 的状态
        redisData = JSON.parse(redisData);
        let platform = redisData.platform;
        let username = redisData.username;
        const url = this.app.config.gameServerURl + 'getPlayersByAccounts?' + qs.stringify({ accounts: `${username}@${platform}` });
        const playerData = await this.sendServerGetRequest(url, 30000);
        let player = playerData.players[`${username}@${platform}`];

        const platformInfo = await this.service.platformInfo.findById(redisData.platform);
        if (player && player.isOnline == false && player.gold != 1 && platformInfo && platformInfo.ofline_back_url && platformInfo.ofline_back_url.indexOf('http') != -1 && username) {
          const timestamp = moment().utcOffset(8).unix() * 1000;
          const data = {
            platform,
            timestamp,
            param: await this.service.tools.desEncode(platformInfo.des_key, JSON.stringify({ username, money: player.gold ? (parseInt(player.gold) / 100).toFixed(2) : '0' })),
            key: crypto.createHash('md5').update(platform + timestamp + platformInfo.md5_key).digest('hex'),
          };
          const url = platformInfo.ofline_back_url + '?' + qs.stringify(data);
          this.app.logger.info('secret_key 超时下分:  account: ' + username + ' url: ' + url);
          request({ url, timeout: 60000 }, (error, response, data) => {
            console.log('响应:', data);
            if (!error) {
              this.app.logger.info('statusCode: ' + response.statusCode + ' account: ' + username + ' data: ' + data);
            } else {
              this.app.logger.info('[error]-', error);
            }
          });

        }
        this.app.redis.del(key_name);
      }

    }, (this.app.config.tokenTimeOut || 120) * 1000); // this.app.config.tokenTimeOut || 120
  }

}

module.exports = ToolsService;

