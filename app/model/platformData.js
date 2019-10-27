'use strict';
module.exports = app => {
  const { INTEGER, DATE, BIGINT } = app.Sequelize;
  const PlatformData = app.model.define('platform_data',
    {
      create_time: {
        type: DATE,
        primaryKey: true,
      },
      platform: {
        type: INTEGER,
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
      status: {
        type: INTEGER,
      },
      rate: {
        type: INTEGER,
      },
      duration: {
        type: BIGINT,
      },
      insert_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  PlatformData.associate = function() {
    app.model.PlatformData.hasOne(app.model.PlatformInfo, { foreignKey: 'platform_id', sourceKey: 'platform', through: null });
  };

  return PlatformData;
};
