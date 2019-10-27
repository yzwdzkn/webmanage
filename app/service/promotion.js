/* eslint-disable eqeqeq */
'use strict';

const Service = require('egg').Service;

class ShareService extends Service {

  async list(params, page, limit) {
    const sequelize = this.ctx.model.Sequelize;
    console.log('params: ', params);
    const { rows, count } = await this.ctx.model.PromotionStatistics.findAndCountAll({
      where: params,
      offset: (page - 1) * limit,
      limit,
    });
    const result = await this.ctx.model.PromotionStatistics.findAll(
      {
        where: params,
        attributes: [[ sequelize.fn('SUM', sequelize.col('android_activation')), 'android_activation' ],
          [ sequelize.fn('SUM', sequelize.col('android_download')), 'android_download' ],
          [ sequelize.fn('SUM', sequelize.col('ios_activation')), 'ios_activation' ],
          [ sequelize.fn('SUM', sequelize.col('ios_download')), 'ios_download' ],
        ],
      });
    const temp = JSON.parse(JSON.stringify(result[0]));
    temp.create_time = '总计';
    rows.unshift(temp);
    return { rows, count };
  }

  async exportList(params) {
    const sequelize = this.ctx.model.Sequelize;
    console.log('params: ', params);
    const rows = await this.ctx.model.PromotionStatistics.findAll({
      where: params,
    });
    let result = await this.ctx.model.PromotionStatistics.findAll(
      {
        where: params,
        attributes: [[ sequelize.fn('SUM', sequelize.col('android_activation')), 'android_activation' ],
          [ sequelize.fn('SUM', sequelize.col('android_download')), 'android_download' ],
          [ sequelize.fn('SUM', sequelize.col('ios_activation')), 'ios_activation' ],
          [ sequelize.fn('SUM', sequelize.col('ios_download')), 'ios_download' ],
        ],
      });
    result = result[0];
    let android_rate = this._getRate(result, 'android');
    let ios_rate = this._getRate(result, 'ios');

    if (!result.android_download) {
      android_rate = '-';
    } else {
      android_rate = (result.android_activation / result.android_download).toFixed(2);
    }

    if (!result.ios_download) {
      ios_rate = '-';
    } else {
      ios_rate = (result.ios_activation / result.ios_download).toFixed(2);
    }

    const template = [
      [ '时间', '安卓激活', '安卓下载', '安卓转换率', 'ios激活', 'ios下载', 'ios转换率' ],
      [ '总计', result.android_activation, result.android_download,
        android_rate,
        result.ios_activation, result.ios_download,
        ios_rate,
      ],
    ];
    for (const row of rows) {
      const ios_rate = this._getRate(row, 'ios');
      const andriod_rate = this._getRate(row, 'andriod');

      const filed = [ row.create_time, row.android_activation, row.android_download, andriod_rate,
        row.ios_activation, row.ios_download, ios_rate,
      ];
      template.push(filed);
    }
    return template;
  }

  _getRate(result, type) {
    if (type === 'andriod') {
      let android_rate;
      if (!result.android_download) {
        android_rate = '-';
      } else {
        android_rate = (result.android_activation / result.android_download).toFixed(2);
      }
      return android_rate;
    }

    if (type === 'ios') {
      let ios_rate;
      if (!result.ios_download) {
        ios_rate = '-';
      } else {
        ios_rate = (result.ios_activation / result.ios_download).toFixed(2);
      }
      return ios_rate;
    }
    return '-';
  }
}


module.exports = ShareService
;
