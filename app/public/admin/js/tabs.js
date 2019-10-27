
(function($) {

  $(function() {
    initWindowMenu();
  });

  function initWindowMenu() {
    // 给body绑定两个事件
    $('body')
    // 右键菜单显示
      .bind('contextmenu', contextMenuHandler)
    // 关闭右键菜单
      .on('click', function() {
        hideMenu();
      });
  }

  // function hideMenu() {
  //   $('#appMenu').css('display', 'none');
  // }

  /**
      * body元素的contextmenu事件执行函数
      */
  function contextMenuHandler(ev) {
    // 获取事件对象，需要兼容IE
    const e = ev || window.event;
    // 获取自定义的右键菜单
    const menu = $('#appMenu');
    // 获取事件源
    // e.srcElement，兼容IE、360、chrome
    // e.target，兼容Firefox
    src = $(e.srcElement || e.target);
    // 如果事件源对象是tab标签才显示右键菜单、绑定事件

    if (typeof (src.attr('lay-id')) !== 'undefined') { // tab标签上的一个属性
      // 取消默认的浏览器右键菜单
      e.preventDefault();
      // 根据事件对象中鼠标点击的位置，进行定位
      // 之后根据点击的标签进行事件绑定
      menu
        .css({ left: e.clientX + 'px', top: e.clientY + 'px', display: 'block' })
        .find('li').unbind('click')
        .bind('click', function() {
          // 判断关闭类型：关闭当前标签、关闭左侧标签、关闭右侧标签、关闭其他、关闭全部
          switch ($(this).attr('target')) {
            case 'current':
              return removeTabs(src);
            case 'prevAll':
              return removeTabs(src.prevAll());
            case 'nextAll':
              return removeTabs(src.nextAll());
            case 'other':
              return removeTabs(src.siblings());
            case 'all':
              return removeTabs(src.parent().children());
          }
        });
    } else {
      menu.css('display', 'none');
    }
  }

  /**
               * 批量删除tab选项卡
               */
  function removeTabs(items) {
    // 遍历需要关闭的标签对象，逐一进行关闭
    for (let i = 0; i < items.length; i++) {
      removeTab($(items[i]).attr('lay-id'));
    }
  }

  function removeTab(id) {
    element.tabDelete('tabs', id);
  }

})(jQuery);
