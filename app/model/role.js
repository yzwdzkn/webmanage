'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const Role = app.model.define('role',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      name: {
        type: STRING(150),
      },
      description: {
        type: STRING(500),
      },
      type: {
        type: INTEGER,
      },
      status: {
        type: INTEGER,
      },
      menu_ids: {
        type: STRING(500),
      },
      create_time: {
        type: DATE,
      },
      update_time: {
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

  Role.associate = function() {
    app.model.Role.hasMany(app.model.Admin, { foreignKey: 'role_id', sourceKey: 'id' });// 一对多
  };

  return Role;
};
