/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
], function ($, session, myFn, app, moment) {
    'use strict';

    (function () {
        $('.treeview-menu a[href="' + location.pathname + '"]').parents('li').addClass('active');
    })();

    // todo $.each 대체
    $('.sidebar-menu .treeview').map(function (obj, i) {
        // console.log(obj, i);
    });
});
