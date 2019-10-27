/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-param */
'use strict';

const Service = require('egg').Service;
const ERR = require('../tools/statusCode');
class PlatformInfoService extends Service {

  /**
     * 查询平台账户列表
     */
  async findList(platform_id, platform_name, orderField, orderType, page, limit) {
    const Sequelize = this.ctx.model.Sequelize;
    const Op = Sequelize.Op;
    let sql = `SELECT (select IFNULL(sum(add_score),0) from platform_order where platform_id = a.platform_id and type =2 ) as score,
    (select IFNULL(sum(add_score),0) from platform_order where platform_id = a.platform_id and type =3 ) as lower_score  
    FROM platform_info a where 1 `;
    if (platform_id) {
      sql += ` and platform_id=${platform_id}`;
    }
    sql += ` LIMIT ${(page - 1) * limit},${limit};`;
    console.log('sql: ', sql);
    const where = {
      platform_name: {
        [Op.like]: '%' + platform_name + '%',
      },
    };
    if (platform_id !== '') {
      where.platform_id = platform_id;
    }
    const order = [];
    if (orderField && orderType) {
      order.push([ orderField, orderType ]);
    }

    return await Promise.all([
      (
        this.ctx.model.PlatformInfo.findAll({
          where,
          offset: (page - 1) * limit, // 每页起始位置
          limit,
          include: [
            {
              model: this.ctx.model.UserAccount,
              required: false, // inner join方式
              attributes: [[ Sequelize.fn('count', Sequelize.col('user_accounts.platform_id')), 'username_number' ]],
            },
          ],
          order,
          group: 'platform_info.platform_id',
          subQuery: false, // 不让在子查询里分页，全局处理
        })
      ), (
        this.ctx.model.PlatformInfo.count({
          where,
        })
      ), (
        this.app.model.query(sql, {
          type: this.app.Sequelize.QueryTypes.SELECT,
        })
      ),
    ]);
  }
  /**
     * 获取平台上下分详情
     */
  async findByPlatformId(platform_id, page, limit) {
    const Op = this.ctx.model.Sequelize.Op;
    const where = {
      platform_id,
      type: {
        [Op.in]: [ 2, 3 ],
      },
    };
    return await this.ctx.model.PlatformOrder.findAndCountAll({
      where,
      offset: (page - 1) * limit, // 每页起始位置
      order: [[ 'order_time', 'desc' ]],
      limit,
    });
  }
  /**
     * 通过id获取平台昵称
     */
  async findNickByPlatformId(platform_id) {
    const where = {
      platform_id,
    };
    return await this.ctx.model.PlatformInfo.findOne({
      where,
      attributes: [ 'platform_name' ],
    });
  }


  /**
   * 根据状态查询平台
   * @param {*} status
   */
  async findListByStatus(status) {
    return await this.ctx.model.PlatformInfo.findAll({
      where: {
        status,
      },
    });
  }

  /**
     * 添加平台
     * @param {*} params
     */
  async addPlatform(params) {
    console.log('params:', params);
    return await this.ctx.model.PlatformInfo.create({
      platform_id: params.platform_id,
      platform_name: params.platform_name,
      version: params.version,
      md5_key: params.md5_key,
      des_key: params.des_key,
      coin_type: params.coin_type,
      ofline_back_url: params.ofline_back_url,
      whiteip: params.whiteip,
      status: params.status,
      description: params.description,
      cooperation_type: params.cooperation_type,
      rate: params.rate,
      money: 0,
      createdate: new Date(),
    });
  }

  /**
     * 修改平台
     */
  async editPlatform(params) {
    return await this.ctx.model.PlatformInfo.update(
      {
        platform_name: params.platform_name,
        version: params.version,
        md5_key: params.md5_key,
        des_key: params.des_key,
        coin_type: params.coin_type,
        ofline_back_url: params.ofline_back_url,
        whiteip: params.whiteip,
        status: params.status,
        cooperation_type: params.cooperation_type,
        description: params.description,
        rate: params.rate,
        updatedate: new Date(),
      },
      {
        where: {
          platform_id: params.platform_id,
        },
      }
    );
  }


  /**
     * 根据id查询平台信息
     * @param {*} platform_id
     */
  async findById(platform_id) {
    return await this.ctx.model.PlatformInfo.findOne({
      where: {
        platform_id,
      },
    });
  }


  async updatePlatformMoney(platform_id, money) {
    return await this.ctx.model.PlatformInfo.update(
      {
        money,
        updatedate: new Date(),
      },
      {
        where: {
          platform_id,
        },
      }
    );
  }

  /**
   * 更新平台分数
   * @param {*} platform_id
   * @param {*} money
   * @param {*} type 0 平台下分 1 平台上分
   */
  async updatePlatformMoneyToUser(platform_id, money, type) {
    // const Sequelize = this.ctx.model.Sequelize;
    const transaction = await this.ctx.model.transaction({ autocommit: true, isolationLevel: 'SERIALIZABLE' });
    try {
      const platformResult = await this.ctx.model.PlatformInfo.findOne(
        {
          where: {
            platform_id,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        }
      );

      let newMoney = 0;
      if (type == 0) {
        if (platformResult.money < money) {
          await transaction.rollback(); // dq 10-16
          return {
            errorcode: ERR.CODE_518.code, // 平台分数不足
          };
        }
        newMoney = parseInt(platformResult.money) - parseInt(money);
      } else {
        newMoney = parseInt(platformResult.money) + parseInt(money);
      }

      await this.ctx.model.PlatformInfo.update(
        {
          money: newMoney,
        },
        {
          where: {
            platform_id,
          },
          transaction,
        }
      );
      await transaction.commit();
      return {
        errorcode: 0,
        platformPreMoney: platformResult.money,
        platformCurMoney: newMoney,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        errorcode: ERR.CODE_18.code, // dq 10-16
      };
    }
  }
  // 根据状态查平台
  async findPlatformByStatus(status) {
    return await this.ctx.model.PlatformInfo.findAll({
      where: {
        status,
      },
    });
  }
  // 批量更新版本号
  async editVersion(params) {
    const Op = this.ctx.model.Sequelize.Op;
    if (params.platform_id.indexOf(',') >= 0) {
      const idArr = params.platform_id.split(',');
      params.platform_id = { [Op.in]: idArr };
    } else if (params.platform_id.indexOf('-') >= 0) {
      const idArr = params.platform_id.split('-');
      console.log(idArr[0], idArr[1]);
      params.platform_id = { [Op.between]: [ idArr[0], idArr[1] ] };
    }
    return await this.ctx.model.PlatformInfo.update({
      version: params.version,
    },
    {
      where: {
        platform_id: params.platform_id,
      },
    }
    );
  }
}

module.exports = PlatformInfoService;
