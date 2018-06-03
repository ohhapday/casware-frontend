/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/06/12.
 * 전사 재고현황
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment', 'icheck'
], function ($, session, myFn, app, moment, icheck) {
    'use strict';

    let agent = navigator.userAgent.toLowerCase();

    if ((navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1)) {
        alert("경영정보팀에서 공지드립니다." +
            "<br><br>카스웨어는 웹표준을 준수하고자 단계별로 리뉴얼중에 있습니다." +
            "<br><br>현재 사용중인 브라우저는 비표준인 익스플로러 입니다." +
            "<br><br>표준 브라우저를 이용하여 카스웨어를 사용해 주시기 바랍니다." +
            "<br>(표준 브라우저 안내: 구글 크롬, 네이버 웨일, 파이어폭스 등)");
    }

    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });

    // 사원번호 불러오기
    (function () {
        let user_code = localStorage.getItem('user_code') || null;

        if (user_code !== null) {
            $('input[name="user_code"]').val(user_code);
        }
    })();

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        if ($('input[type="checkbox"]').prop('checked') === true) {
            localStorage.setItem('user_code', $('input[name="user_code"]').val());
        }

        this.submit();
    });
});

