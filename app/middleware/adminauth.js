/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-var */
'use strict';
const url = require('url');

module.exports = (options, app) => {
  return async function adminauth(ctx, next) {

    ctx.state.csrf = ctx.csrf; // 全局模板变量
    console.log('session: ', JSON.stringify(ctx.session.admin));
    // 获取请求地址
    const pathname = url.parse(ctx.request.url).pathname;

    if (ctx.session.admin) { // 判断是否登录

      ctx.state.admin = ctx.session.admin; // 全局变量
      let menu_ids = ctx.session.admin.menu_ids || '';
      // 获取权限列表
      const authMenus = await ctx.service.menu.findAuthList(ctx.session.admin.is_super, menu_ids);

      let currentMenuId = -1;
      let hasAuth = false;
      if (pathname == '/admin' || pathname == '/admin/editPassword') { // 地址等于 /admin 直接放过
        hasAuth = true;
      } else {
        if (ctx.session.admin.is_super == 1) { // 超级管理员不需验证
          hasAuth = true;
          for (let i = 0; i < authMenus.length; i++) {
            if (authMenus[i].type == 1 && authMenus[i].url == pathname) {
              currentMenuId = authMenus[i].id;
              break;
            }
          }
        } else {
          // 验证请求地址是否有权限
          for (let i = 0; i < authMenus.length; i++) {
            if (authMenus[i].url == pathname || authMenus[i].url == pathname.substring(0, authMenus[i].url.length)) {
              hasAuth = true;
              if (authMenus[i].type == 1) { // 类型为菜单的情况下
                currentMenuId = authMenus[i].id;
              }
              break;
            }
          }
        }
        // 查询菜单下的功能
        const childMenu = [];
        if (currentMenuId !== -1) {
          const childMenuResult = await ctx.service.menu.findChildMenuById(currentMenuId);
          menu_ids = menu_ids.split(',').map(item => +item); // 将字符串转数组
          for (let i = 0; i < childMenuResult.length; i++) {
            if (menu_ids.includes(childMenuResult[i].id) || ctx.session.admin.is_super == 1) { // 检查这个功能是否有权限
              childMenu.push(childMenuResult[i].url);
            }
          }
        }
        ctx.state.childMenu = childMenu;
      }
      if (hasAuth) {
        ctx.state.menuList = authMenus;
        await next();
      } else {
        ctx.body = {
          status: 101,
          msg: '您没有权限访问当前地址:' + ctx.request.url,
        };
      }

    } else {
      // 排除不需要做权限判断的页面
      if (pathname == '/admin/login' || pathname == '/admin/doLogin') {
        await next();
      } else {
        // 判断是否是 ajax 请求
        if (ctx.request.headers['x-requested-with'] != null && ctx.request.headers['x-requested-with'] == 'XMLHttpRequest') {
          ctx.body = {
            status: 102,
            // msg: '<script> alert("登录信息失效,请重新登录！"); setTimeout(function(){window.parent.window.location.href = "/login";},500) </script>',
            msg: '<script> window.parent.window.location.href = "/login"; </script>', // dq
          };
        } else {
          // ctx.body = '<script> alert("登录信息失效,请重新登录！"); setTimeout(function(){window.parent.window.location.href = "/login";},500) </script>';
          ctx.body = '<script> window.parent.window.location.href = "/login"; </script>';
          // ctx.redirect('/login'); // 重定向到登录页面 // dq
        }

      }
    }

  };
};
