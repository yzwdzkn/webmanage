'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const PlatformOrder = app.model.define('platform_order',
    {
      order_id: {
        type: STRING(50),
        primaryKey: true,
      },
      platform_id: {
        type: INTEGER,
      },
      game_id: {
        type: INTEGER,
      },
      pre_score: {
        type: BIGINT,
      },
      add_score: {
        type: BIGINT,
      },
      current_score: {
        type: BIGINT,
      },
      type: {
        type: INTEGER,
      },
      order_state: {
        type: INTEGER,
      },
      ip: {
        type: STRING(50),
      },
      order_time: {
        type: DATE,
      },
      create_operator: {
        type: STRING(50),
      },
      remark: {
        type: STRING(200),
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  PlatformOrder.associate = function() {
    app.model.PlatformOrder.hasOne(app.model.PlatformInfo, { foreignKey: 'platform_id', sourceKey: 'platform_id' });// 一对一
  };
  return PlatformOrder;
};
