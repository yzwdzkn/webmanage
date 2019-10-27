'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const AccountMap = app.model.define('account_map',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      account_id: {
        type: INTEGER,
      },
      username: {
        type: STRING(100),
      },
      account_type: {
        type: STRING(50),
      },
    },
    {
      indexes: [{ unique: true, fields: [ 'username', 'account_id' ] }],
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  return AccountMap;
};
