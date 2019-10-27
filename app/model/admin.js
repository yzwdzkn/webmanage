'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const Admin = app.model.define('admin',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      username: {
        type: STRING(100),
      },
      password: {
        type: STRING(100),
      },
      nickname: {
        type: STRING(100),
      },
      description: {
        type: STRING(500),
      },
      role_id: {
        type: INTEGER,
      },
      status: {
        type: INTEGER,
      },
      is_super: {
        type: INTEGER,
      },
      type: {
        type: INTEGER,
      },
      create_time: {
        type: DATE,
      },
      last_login_time: {
        type: DATE,
      },
      is_delete: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  Admin.associate = function() {
    app.model.Admin.belongsTo(app.model.Role, { foreignKey: 'role_id' });
  };

  return Admin;
};
