/* eslint-disable eqeqeq */
'use strict';

const Controller = require('egg').Controller;
const { USER_KILL, OPERATION_TYPE_CREATE, OPERATION_TYPE_DELETE, SYSTEM } = require('../../../tools/constant');

class UserKillController extends Controller {
  async index() {
    const platformInfos = await this.ctx.service.platformInfo.findListByStatus(0);
    await this.ctx.render('riskManagement/user_kill', {
      title: '会员追杀',
      platformInfos,
    });
  }

  /**
  * 获取所有游戏的杀数列表
  */
  async list() {
    const { platform_id, agent_id, username, page, limit } = this.ctx.query;
    const data = await this.service.user.findUsernameAndPlayerData(platform_id, agent_id, username, page, limit);
    this.ctx.body = {
      data: data.result,
      msg: '',
      count: data.count,
      code: 0,
    };
  }

  /**
   * 保存追杀设置
   */
  async saveKill() {
    const { user_id, kill_status, kill_money, kill_remark, operator } = this.ctx.request.body;
    const params = this.ctx.request.body;
    params.id = user_id;
    let status;
    if (kill_status == 0) {
      status = OPERATION_TYPE_DELETE;
    } else {
      status = OPERATION_TYPE_CREATE;
    }

    const flag = await this.ctx.service.user.getUserKillRecord(user_id, kill_status, kill_money);
    if (flag) {
      this.ctx.body = {
        status: 0,
      };
      return;
    }

    await this.service.operationLog.saveOperationLog(status, params, SYSTEM, USER_KILL);
    const result = await this.service.user.playerKill(parseInt(user_id), kill_status, kill_money, kill_remark, operator);
    if (result.code == 0) {
      this.ctx.body = {
        status: 0,
      };
    } else {
      this.ctx.body = {
        status: result.code,
        msg: result.msg,

      };
    }
  }

  /**
   * 获取会员追杀信息
   */
  async getUserKill() {
    const user_id = this.ctx.query.user_id;
    const result = await this.service.user.getUserKill(user_id);
    this.ctx.body = {
      status: 0,
      kill: result,
    };
  }

  /**
 * 导出
 */
  async export() {
    const { ctx } = this;

    const { platform_id, username, agent_id, isA } = ctx.request.body;
    const data = await this.service.user.findUsernameAndPlayerData(platform_id, agent_id, username);
    const name = await this.service.platformInfo.findNickByPlatformId(platform_id);
    if (isA) {
      ctx.body = data;
    } else {
      const headers = [];
      const condition = [
        { t: `平台:${+platform_id ? platform_id + '--' + name.platform_name : '所有平台'}`, m1: 'A1', m2: 'A1' },
        { t: `玩家账号:${username || '所有用户'}`, m1: 'B1', m2: 'B1' },
      ];
      headers.push(condition);
      headers.push([
        { t: '玩家账号', f: 'username', totalRow: true },
        { t: '代理名称', f: 'platform_name', totalRow: true },
        { t: '总输赢', f: 'lost_win', totalRow: true },
        { t: '总杀数', f: 'all_killNumber', totalRow: true },
        { t: '今日输赢', f: 'today_lost_win', totalRow: true },
        { t: '今日杀数', f: 'today_killNumber', totalRow: true },
        { t: '状态', f: 'isOnline', totalRow: true },
        { t: '追杀状态', f: 'kill_status', totalRow: true },
        { t: '累计追杀金额', f: 'kill_gold', totalRow: true },
        { t: '本次追杀金额', f: 'kill_money', totalRow: true },
        { t: '剩余追杀金额', f: 'rest_kill_number', totalRow: true },
      ]);
      const workbook = await this.service.exportExcel.generateExcel(headers, data.result.map(element => {
      // element = element.toJSON();
        element.username;
        element.platform_name = element.platform_info ? element.platform_info.platform_id + '--' + element.platform_info.platform_name : '/';
        element.lost_win = element.lost_win / 100;
        element.all_killNumber = parseFloat(element.all_killNumber * 100).toFixed(2) + '%';
        element.today_lost_win = (element.today_lost_win / 100).toFixed(2);
        element.today_killNumber = parseFloat(element.today_killNumber * 100).toFixed(2) + '%';
        element.isOnline = element.isOnline ? '在线' : '离线'; // 游戏状态
        element.kill_status = element.user_kill_record != null && element.user_kill_record.status === 1 ? '追杀中' : '不追杀';// 追杀状态
        element.kill_gold = (element.kill_lost_gold / 100).toFixed(2);
        element.kill_money = element.user_kill_record ? (parseInt(element.user_kill_record.kill_money) / 100).toFixed(2) : '0.00';
        element.rest_kill_number = element.user_kill_record ? (parseInt(element.user_kill_record.rest_kill_number) / 100).toFixed(2) : '0.00';
        return element;
      }));
      ctx.set('Content-Type', 'application/vnd.openxmlformats');
      ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent('会员追杀') + '.xlsx');
      ctx.body = workbook;
    }

  }
}

module.exports = UserKillController;
