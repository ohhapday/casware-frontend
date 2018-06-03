/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/10/25.
 * 글로벌 커뮤니티 사이드바 메뉴
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/global/timezone.js',                                // moment 타임존
], function ($, session, myFn, app, moment, Timezone) {
    'use strict';

    // 멤버 프로파일
    let Profile = (function () {
        let Profile = function () {
            this.data = Object.assign({}, this.get_data());
            this.tz = new Timezone('Asia/Seoul');

            this.init();
            this.initEvent();
        };

        Profile.prototype = {
            init: function () {
                this.setList();
            },
            initEvent: function () {

            },
            setList: function () {
                let tab = $('#control-sidebar-home-tab');
                let img_path = '/approval/user_draft_hr/hr_s/';
                let self = this;

                $.each(this.data, function () {
                    let clone = tab.find('li.hidden').clone(true);
                    let connect_date = this.connect_date || '';

                    if(connect_date !== '') {
                        clone.find('h4').text(`${this.code_name} ${this.user_name}`);

                        clone.find('p').text(`${self.tz.getTimezone(connect_date).format('YYYY-MM-DD HH:mm:ss')}`);

                        clone.find('img').attr('src', img_path + this.user_code + '.jpg');
                        clone.find('img').error(function () {
                            $(this).attr('src', img_path + 'sample.jpg');
                        });

                        $('ul.control-sidebar-menu').append(clone);
                        clone.removeClass('hidden');
                    }
                });
            },
        };

        Profile.prototype.get_data = function () {
            let returnData;
            $.ajax({
                async: false,
                url: '/comm/get_global_member2',
                type: 'get',
                dataType: 'json',
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        return Profile;
    })();

    return {
        Profile: Profile,
    };
});

