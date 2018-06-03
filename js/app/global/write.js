/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/global/control_sidebar.js',                         // 우측 메뉴바
    '/dist/js/app/bbs/write.js',
], function ($, session, myFn, app, moment, control_sidebar) {
    'use strict';

    // 우측 사이드바 토글
    (function () {
        let profile = null;
        $('.main-header .fa-bars').parent().on('click', function () {
            if ($('aside').hasClass('control-sidebar-open') !== false) {
                if (profile === null) {
                    profile = new control_sidebar.Profile();
                }
            }
        });
    })();
});

