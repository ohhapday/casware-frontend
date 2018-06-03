/**
 * Created by 서정석 on 2018/01/18.
 * 탑메뉴 부분
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
], function ($, session, myFn, app, moment) {
    'use strict';

    // TOP 메뉴 처리
    (function () {
        let navbarHeight = $('.navbar').height();

        $(window).scroll(function () {
            // let navbarColor = "62,195,246";
            let navbarColor = '23,89,156';
            let smallLogoHeight = $('.small-logo').height();
            let bigLogoHeight = $('.big-logo').height();

            let smallLogoEndPos = 0;
            let smallSpeed = (smallLogoHeight / bigLogoHeight);

            let ySmall = ($(window).scrollTop() * smallSpeed);

            let smallPadding = navbarHeight - ySmall;
            if (smallPadding > navbarHeight) {
                smallPadding = navbarHeight;
            }
            if (smallPadding < smallLogoEndPos) {
                smallPadding = smallLogoEndPos;
            }
            if (smallPadding < 0) {
                smallPadding = 0;
            }

            $('.small-logo-container ').css({'padding-top': smallPadding});

            let navOpacity = ySmall / smallLogoHeight;
            if (navOpacity > 1) {
                navOpacity = 1;
            }
            if (navOpacity < 0) {
                navOpacity = 0;
            }
            let navBackColor = 'rgba(' + navbarColor + ',' + navOpacity + ')';
            $('.navbar').css({'background-color': navBackColor});

            let shadowOpacity = navOpacity * 0.4;
            if (ySmall > 1) {
                $('.navbar').css({'box-shadow': '0 2px 3px rgba(0,0,0,' + shadowOpacity + ')'});
            } else {
                $('.navbar').css({'box-shadow': 'none'});
            }
        });
    })();

    /**
     * Korea Agency 메뉴 표시
     *  - 임원/대리점팀/지역사업본부장
     */
    (function () {
        let status = false;
        if (session.post_code <= '12') {
            status = true;
        }
        if (session.dept_code === 'CAS0914' ||
            session.dept_code === 'CAS1112' ||
            session.dept_code === session.user_note.dept_code_info) {
            status = true;
        }
        if (session.filler.substr(0, 2) === 'ab') {          // 국내영업관리부
            status = true;
        }

        if (status) {
            $('a[href="/main_contents/korea_agency/index"]').closest('li').removeClass('hidden');
        }
    })();
});