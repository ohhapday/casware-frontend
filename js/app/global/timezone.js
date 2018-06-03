/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/10/25.
 * 글로벌 커뮤니티 사이드바 메뉴
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment', 'moment-timezone',
], function ($, session, myFn, app, moment) {
    'use strict';

    let Timezone = function (UTC) {
        this.timeZone = UTC || Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.dateObj = [];
    };

    Timezone.prototype = {
        // 글로벌 timezone 처리
        getTimezone: function (datetime) {
            return moment(datetime).tz(this.timeZone);
        },
        setTimeZone: function (UTC) {
            this.timeZone = UTC;
        },
        // Object의 날짜 text를 변환
        getDateObj: function (obj) {
            let self = this;
            if (self.dateObj.length === 0) {
                $.each(obj, function () {
                    self.dateObj.push($(this).text());
                });
            }

            $.each(self.dateObj, function (i) {
                let chg = `<i>${self.getTimezone(this).format('YYYY-MM-DD HH:mm:ss')}</i>`;
                obj.eq(i).html(chg);
            });
        },
    };
    return Timezone;
});

