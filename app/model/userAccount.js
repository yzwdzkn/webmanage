'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserAccount = app.model.define('user_account',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      platform_id: {
        type: INTEGER,
      },
      username: {
        type: STRING(200),
      },
      agent_id: {
        type: INTEGER,
      },
      status: {
        type: STRING(100),
      },
      mark: {
        type: STRING(250),
      },
      is_upper_score: {
        type: INTEGER,
      },
      is_bet: {
        type: INTEGER,
      },
      lastlogintime: {
        type: DATE,
      },
      freezing_time: {
        type: DATE,
      },
      createdate: {
        type: DATE,
      },
      updatedate: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  UserAccount.associate = function() {
    app.model.UserAccount.belongsTo(app.model.AgentAccount, { foreignKey: 'agent_id' }); // 管理代理
    // app.model.UserAccount.hasOne(app.model.UserAccount, { as: 'UserAccount', foreignKey: 'id', sourceKey: 'pid' });
    // app.model.UserAccount.hasMany(app.model.UserAccount, { as: 'UserAccounts', foreignKey: 'pid', sourceKey: 'id' });
    app.model.UserAccount.hasOne(app.model.PlayerData, { as: 'PlayerData', foreignKey: 'username', sourceKey: 'username' }); // 玩家数据
    app.model.UserAccount.hasMany(app.model.UserLoginHall, { foreignKey: 'user_id', sourceKey: 'id' }); // 登录记录
    app.model.UserAccount.hasOne(app.model.UserKillRecord, { foreignKey: 'user_id' }); // 追杀
    app.model.UserAccount.hasMany(app.model.Orders, { foreignKey: 'user_id', sourceKey: 'id' }); // 关联订单
    app.model.UserAccount.belongsTo(app.model.PlatformInfo, { foreignKey: 'platform_id' });// 一对一

  };

  return UserAccount;
};
