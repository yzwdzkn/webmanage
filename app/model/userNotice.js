'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserNotice = app.model.define('user_notice',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      start_time: {
        type: DATE,
      },
      title: {
        type: STRING(300),
      },
      user_id: {
        type: INTEGER,
      },
      description: {
        type: STRING(1000),
      },
      create_operator: {
        type: STRING(200),
      },
      create_time: {
        type: DATE,
      },
      is_delete: {
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

  UserNotice.associate = function() {
  };

  return UserNotice;
};
