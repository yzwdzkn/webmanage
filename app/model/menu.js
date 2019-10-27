'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const Menu = app.model.define('menu',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      module_name: {
        type: STRING(100),
      },
      module_id: {
        type: INTEGER,
      },
      type: {
        type: INTEGER,
      },
      sort: {
        type: INTEGER,
      },
      url: {
        type: STRING(255),
      },
      icon: {
        type: STRING(50),
      },
      identify: {
        type: STRING(100),
      },
      description: {
        type: STRING(500),
      },
      status: {
        type: INTEGER,
      },
      is_platform: {
        type: INTEGER,
      },
      is_agent: {
        type: INTEGER,
      },
      defualt_agent: {
        type: INTEGER,
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

  Menu.associate = function() {
    app.model.Menu.hasMany(app.model.Menu, { foreignKey: 'id', sourceKey: 'module_id', through: null });
    // app.model.Menu.belongsTo(app.model.Menu, {foreignKey:'module_id',targetKey: 'id' });
  };

  return Menu;
};
