/**
 * Created by 서정석 on 2016/12/27.
 * 게시판
 */

requirejs([
    'jquery', 'session', 'app', 'myFn',
    'jquery-slimscroll', 'faloading'
], function ($, session, app, myFn, slimscroll) {
    "use strict";

    var category_nm = location.pathname.split('/')[3];      // 카테고리명

    (function () {
        $('.box-primary .btn-primary').on('click', function () {
            window.location.href = '/marketing/write/' + category_nm;
        });
    }());

    $(".fa-loading-wrapper").remove();
});

