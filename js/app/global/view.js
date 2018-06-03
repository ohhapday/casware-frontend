/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/global/control_sidebar.js',                         // 우측 메뉴바
    '/dist/js/app/global/timezone.js',                                // moment 타임존
    '/dist/js/app/bbs/view.js',
], function ($, session, myFn, app, moment, control_sidebar, Timezone) {
    'use strict';

    let tz = new Timezone();

    (function () {
        $('#btn_korea').on('click', function () {
            tz.setTimeZone('Asia/Seoul');
            tz.getDateObj($('.u-write_date'));
        });

        $('#btn_local').on('click', function () {
            tz.setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
            tz.getDateObj($('.u-write_date'));
        });

        $('#btn_america').on('click', function () {
            tz.setTimeZone('America/Los_Angeles');
            tz.getDateObj($('.u-write_date'));
        });

        $('#btn_russia').on('click', function () {
            tz.setTimeZone('Europe/Moscow');
            tz.getDateObj($('.u-write_date'));
        });
    })();

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

