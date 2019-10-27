'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const AgentData = app.model.define('agent_data',
    {
      create_time: {
        type: DATE,
        primaryKey: true,
      },
      agent_id: {
        type: STRING(200),
        primaryKey: true,
      },
      total_games: {
        type: INTEGER,
      },
      bet_number: {
        type: INTEGER,
      },
      valid_bet: {
        type: BIGINT,
      },
      win_games: {
        type: INTEGER,
      },
      win_gold: {
        type: BIGINT,
      },
      lost_games: {
        type: INTEGER,
      },
      lost_gold: {
        type: BIGINT,
      },
      deduct_gold: {
        type: BIGINT,
      },
      duration: {
        type: BIGINT,
      },
      insert_time: {
        type: DATE,
      },
      rate: {
        type: INTEGER,
      },
      settlement: {
        type: INTEGER,
      },
      status: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  AgentData.associate = function() {
    app.model.AgentData.belongsTo(app.model.AgentAccount, { foreignKey: 'agent_id', targetKey: 'id' });// 一对一

  };

  return AgentData;
};
