/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  /**
   * 查询订单状态
   * @param {*} orderid
   * 0 订单完成
   * 13 回滚代理分数失败
   * 14 回滚代理分数成功
   * 2 会员下分失败
   * 3 代理上分失败
   */
  async getOrder(orderid) {
    const manageSystem = this.app.mysql.get('manageSystem');
    return await manageSystem.select('orders', { where: { order_id: orderid } });

  }

  /**
   * 添加订单
   * @param {*} order_id 订单号
   * @param {*} username 用户名
   * @param {*} money 分数
   * @param {*} status 状态 0成功 1 失败 2 会员下分失败 3 代理上分失败
   * @param {*} type 0 上分 1 下分
   * @param {*} big_data 订单账变数据
   * @param {*} platform_id 平台id
   */
  async addOrder(order_id, username, money, status, type, big_data, platform_id) {
    const manageSystem = this.app.mysql.get('manageSystem');
    if (status == 0) {
      const data = JSON.parse(big_data);
      let pre_score = 0;
      if (type == 0) {
        pre_score = data.platformCurMoney + parseInt(money);
      } else {
        pre_score = data.platformCurMoney - parseInt(money);
      }
      // 将订单添加到平台订单数据中
      await this.service.platformOrder.savePlatfromOrder(platform_id, pre_score, money, data.platformCurMoney, (type == 0) ? 2 : 3, '-', username);
    }
    return await manageSystem.insert('orders', { order_id, username, money, status, type, big_data, platform_id });
  }

  async getOrderList(platform_id, startTime, entTime) {
    const manageSystem = this.app.mysql.get('manageSystem');
    return await manageSystem.query('SELECT * from orders where platform_id = ? and createdate BETWEEN ? and ?', [ platform_id, startTime, entTime ]);
  }
}

module.exports = OrderService;
