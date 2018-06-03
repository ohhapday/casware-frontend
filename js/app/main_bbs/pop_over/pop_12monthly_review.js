/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 출근현황
 */

define([
    'jquery', 'session', 'moment', 'bootstrap', 'icheck', 'jquery-popup-overlay',
], function ($, session, moment) {
    'use strict';

    let contents = [{
        tab_name: 'DEC. Monthly News',
        tab_content: 'https://player.vimeo.com/video/245843633?autoplay=1&color=60c758&title=0&byline=0&portrait=0',
    }];

    let pop_html = `
        <div id="slide" class="well">
            <div class="row">
                <div class="col-md-12">    
                    <div class="nav-tabs-custom">
                        <ul class="nav nav-tabs">
                            <li class="hidden"><a href="#tab" data-toggle="tab"></a></li>                            
                        </ul>
                        <div class="tab-content">
                            <div class="tab-pane">
                                <div class="">
                                    <iframe src="https://player.vimeo.com/video/245843633?autoplay=1&color=60c758&title=0&byline=0&portrait=0" 
                                        width="600" height="338" frameborder="0" webkitallowfullscreen
                                        mozallowfullscreen allowfullscreen>                
                                    </iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">    
                    <button class="slide_close standalone_open btn btn-warning">오늘 하루 열지않음</button>
                    <button class="slide_close btn btn-default pull-right">Close</button>
                </div>
            </div>
        </div>
    `;

    let Popup = function () {
        this.contents = $.extend({}, contents);

        this.init();
        this.initEvent();
    };

    Popup.prototype = {
        init: function () {
            let autoopen = JSON.parse(localStorage.getItem('autoopen')) || {expired: ''};
            let now = moment(new Date()).format('YYYY-MM-DD');

            if (moment(autoopen.expired).isSame(now) === false) {
                let html = $(pop_html).clone(true);

                $.each(this.contents, function () {
                    let li = $(html).find('.nav-tabs li.hidden').clone(true);
                    li.find('a').text(this.tab_name);

                    li.removeClass('hidden');
                    $(html).find('ul').append(li);
                });

                $(html).find('.nav-tabs li:not(.hidden)').eq(0).addClass('active');
                $(html).find('.tab-pane iframe').addClass('active').attr('src', this.contents[0].tab_content);
                $(html).find('.tab-pane').addClass('active');

                $('body').append(html);
                $('#slide').popup({
                    autoopen: true,
                    blur: false,
                });
            }
        },
        initEvent: function () {
            let self = this;

            $('#slide .btn-default').on('click', function () {
                $('#slide iframe').attr('src', '');
            });

            $('#slide .btn-warning').on('click', function () {
                let autoopen = {
                    expired: moment().format('YYYY-MM-DD'),
                };

                localStorage.setItem('autoopen', JSON.stringify(autoopen));
                $('#slide iframe').attr('src', '');
            });

            // 탭클릭시 동영상 변환
            $('#slide .nav-tabs a').on('click', function () {
                let index = $('#slide .nav-tabs li:not(.hidden)').find('a').index($(this));

                $('#slide .tab-content iframe').attr('src', self.contents[index].tab_content);
            });
        },
    };

    $.ajax({
        async: false,
        url: 'http://ipinfo.io',
        type: 'get',
        dataType: 'jsonp',
        success: function (data, status, xhr) {
            if (data.country !== 'CN') {
                new Popup();
            }
        },
        error: function(xhr) {

        },
        timeout: 1000,
    });
});

