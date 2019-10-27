'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT, FLOAT } = app.Sequelize;
  const PlatformInfo = app.model.define('platform_info',
    {
      platform_id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      platform_name: {
        type: STRING(150),
      },
      rate: {
        type: FLOAT,
      },
      money: {
        type: BIGINT,
      },
      version: {
        type: STRING(50),
      },
      whiteip: {
        type: STRING(255),
      },
      des_key: {
        type: STRING(100),
      },
      md5_key: {
        type: STRING(100),
      },
      ofline_back_url: {
        type: STRING(255),
      },
      status: {
        type: INTEGER,
      },
      cooperation_type: {
        type: INTEGER,
      },
      description: {
        type: STRING(500),
      },
      coin_type: {
        type: STRING(50),
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

  PlatformInfo.associate = function() {
    app.model.PlatformInfo.hasMany(app.model.UserAccount, { foreignKey: 'platform_id', sourceKey: 'platform_id' });// 一对多
    app.model.PlatformInfo.hasMany(app.model.Orders, { foreignKey: 'platform_id', sourceKey: 'platform_id' });// 一对多
  };

  return PlatformInfo;
};
