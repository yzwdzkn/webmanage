'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, TEXT, BIGINT } = app.Sequelize;
  const Orders = app.model.define('orders',
    {
      order_id: {
        type: STRING(50),
        primaryKey: true,
      },
      user_id: {
        type: INTEGER,
      },
      pre_score: {
        type: BIGINT,
      },
      score: {
        type: BIGINT,
      },
      current_score: {
        type: BIGINT,
      },
      deduct_gold: {
        type: BIGINT,
      },
      game_id: {
        type: INTEGER,
      },
      type: {
        type: INTEGER,
      },
      platform_id: {
        type: INTEGER,
      },
      agent_id: {
        type: INTEGER,
      },
      big_data: {
        type: TEXT,
      },
      status: {
        type: INTEGER,
      },
      order_state: {
        type: INTEGER,
      },
      create_time: {
        type: DATE,
      },
      update_time: {
        type: DATE,
      },
      create_operator: {
        type: STRING(200),
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  Orders.associate = function() {
    app.model.Orders.belongsTo(app.model.UserAccount, { foreignKey: 'user_id' });
    app.model.Orders.belongsTo(app.model.GameInfo, { foreignKey: 'game_id' });
    app.model.Orders.belongsTo(app.model.PlatformInfo, { foreignKey: 'platform_id' });
  };
  return Orders;
};
