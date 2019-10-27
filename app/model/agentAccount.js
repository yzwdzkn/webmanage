'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const AgentAccount = app.model.define('agent_account', // 表名
    {
      id: {
        type: INTEGER, // 字段类型
        autoIncrement: true, // 自增
        primaryKey: true, // 主键
      },
      username: {
        type: STRING(200), // 字段类型
      },
      nickname: {
        type: STRING(200),
      },
      password: {
        type: STRING(200),
      },
      bonus_type: {
        type: INTEGER,
      },
      bonus_percent: {
        type: INTEGER,
      },
      coin_type: {
        type: STRING(50),
      },
      menu_ids: {
        type: STRING(500),
      },
      status: {
        type: INTEGER,
      },
      bonus_period: {
        type: INTEGER,
      },
      bonus_date: {
        type: INTEGER,
      },
      create_time: {
        type: DATE,
      },
      update_time: {
        type: DATE,
      },
      last_login_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  AgentAccount.associate = function() {
    app.model.AgentAccount.hasMany(app.model.UserAccount, { foreignKey: 'agent_id', sourceKey: 'id' });// 一对多
    // app.model.AgentAccount.hasMany(app.model.UserAgent, { foreignKey: 'agent_id', sourceKey: 'id' });// 一对多

  };

  return AgentAccount;
};
