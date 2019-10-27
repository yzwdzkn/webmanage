'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserLoginHall = app.model.define('user_login_hall',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      user_id: {
        type: INTEGER,
      },
      username: {
        type: STRING(200),
      },
      platform_id: {
        type: INTEGER,
      },
      ip: {
        type: STRING(100),
      },
      region: {
        type: STRING(100),
      },
      login_time: {
        type: DATE,
      },
      logout_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  UserLoginHall.associate = function() {
    app.model.UserLoginHall.belongsTo(app.model.UserAccount, { foreignKey: 'user_id' });
  };
  return UserLoginHall;
};
