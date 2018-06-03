/* eslint-disable indent */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'datetimepicker',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    (function () {
        $.ajax({
            async: true,
            type: 'GET',
            url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
            dataType: 'script',
            timeout: 1000,
        });
    })();

    let contents = (function () {
        let ajaxUrl = [{
            tabindex: 0,
            htmlUrl: '/dist/html/pray/tab_0.html',
            jsUrl: '/dist/js/app/pray/tab_0.js',
        }, {
            tabindex: 1,
            htmlUrl: '/dist/html/pray/tab_1.html',
            jsUrl: '/dist/js/app/pray/tab_1.js',
        }, {
            tabindex: 2,
            htmlUrl: '/dist/html/pray/tab_2.html',
            jsUrl: '/dist/js/app/pray/tab_2.js',
        }];

        let Contents = function () {
            this.options = {};

            this.init({
                tabindex: 0
            });
            this.initEvent();
        };

        Contents.prototype = {
            init(options) {
                this.options = ajaxUrl.find((data) => {
                    return data.tabindex === options.tabindex;
                });
                this.setContents();
            },
            initEvent() {
                $('ul.nav a').on('click', function (e) {
                    let tabindex = $('ul.nav a').index($(this));
                    contents.init({
                        tabindex: tabindex
                    });
                });
            },
            setContents() {
                let contents = $('.my-contents .my-content');
                let is_obj = contents.eq(this.options.tabindex).text();

                contents.addClass('hidden');

                if (!is_obj) {
                    this.getHtml()
                        .then((data) => {
                            contents.eq(this.options.tabindex).append(data);
                            contents.eq(this.options.tabindex).removeClass('hidden').animateCss('fadeIn');
                        })
                        .then(() => {
                            this.getJs();
                        });
                } else {
                    contents.eq(this.options.tabindex).removeClass('hidden').animateCss('fadeIn');
                }
            },
        };

        Contents.prototype = Object.assign(Contents.prototype, {
            getHtml() {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        async: true, type: 'get', dataType: 'html',
                        url: this.options.htmlUrl,
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                        error(request, status, error) {
                            reject({
                                request, status, error
                            });
                        }
                    });
                });
            },
            getJs() {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        async: true, type: 'get', dataType: 'script',
                        url: this.options.jsUrl,
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                        error(request, status, error) {
                            reject({
                                request, status, error
                            });
                        }
                    });
                });
            },
        });

        return new Contents();
    })();

    // 마무리 처리
    (function () {
        // 년월 선택

    })();
});

