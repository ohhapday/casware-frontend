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
        tab_name: '사물인식저울 CT100G-Vision',
        tab_content: 'https://player.vimeo.com/video/253725582?autoplay=1&color=60c758&title=0&byline=0&portrait=0',
        download: 'http://webhard.cas.co.kr/index.php/s/WYCAP6h9ipoLPsb/download',
    }, {
        tab_name: '체적관리시스템 CLIS-750',
        tab_content: 'https://player.vimeo.com/video/253725235?autoplay=1&color=60c758&title=0&byline=0&portrait=0',
        download: 'http://webhard.cas.co.kr/index.php/s/ZMCQNexO4k9dHA9/download',
    }, {
        tab_name: '서울 IC 플라스틱 필링머신',
        tab_content: 'https://player.vimeo.com/video/256715175?autoplay=1&color=60c758&title=0&byline=0&portrait=0',
        download: 'http://webhard.cas.co.kr/index.php/s/5rFmSpBsBp1bc8X/download',
    }, {
        tab_name: '강남화성 스틸캔 필링머신',
        tab_content: 'https://player.vimeo.com/video/253725131?autoplay=1&color=60c758&title=0&byline=0&portrait=0',
        download: 'http://webhard.cas.co.kr/index.php/s/lhL6P4fGmU2yXsP/download',
    }];

    let pop_html = `
        <div id="slide" class="well" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif">
            <div class="row">
                <div class="col-sm-12">    
                    <div class="nav-tabs-custom">
                        <ul class="nav nav-tabs">
                            <li class="hidden"><a href="#tab" data-toggle="tab"></a></li>                            
                        </ul>
                        <div class="tab-content">
                            <div class="tab-pane">
                                <div class="" style="text-align: center;">
                                    <iframe src="#" 
                                        width="800" height="450" frameborder="0" webkitallowfullscreen
                                        mozallowfullscreen allowfullscreen>                
                                    </iframe>
                                </div>
                                <div class="row">
                                    <div class="col-sm-12" style="text-align: center;">
                                        <button class="btn btn-success btn-lg">Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">    
                    <button class="slide_close standalone_open btn btn-warning">일주일 열지않음</button>
                    <button class="slide_close btn btn-default pull-right">Close</button>
                </div>
            </div>
        </div>
    `;

    let Popup = function () {
        this.contents = $.extend([], contents);
        this.contents = this.randomContents(this.contents);

        this.init();
        this.initEvent();
    };

    Popup.prototype = {
        init: function () {
            let autoopen = JSON.parse(localStorage.getItem('autoopen')) || {expired: ''};
            let now = moment(new Date());

            if (now.isAfter(moment(autoopen.expired)) === true || autoopen.expired === '') {
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
                    expired: moment().add(7, 'day').format('YYYY-MM-DD'),
                };

                localStorage.setItem('autoopen', JSON.stringify(autoopen));
                $('#slide iframe').attr('src', '');
            });

            // 탭클릭시 동영상 변환
            $('#slide .nav-tabs a').on('click', function () {
                let index = $('#slide .nav-tabs li:not(.hidden)').find('a').index($(this));
                $('#slide .tab-content iframe').attr('src', self.contents[index].tab_content);
            });

            // 다운로드
            $('.btn-success').off('click').on('click', function () {
                let tab = $('#slide .nav-tabs li:not(.hidden)'),
                    index = tab.index($('#slide .nav-tabs li.active'));
                window.open(self.contents[index].download);
            });
        },
        randomContents(contents) {
            contents.sort(function () {
                return .5 - Math.random();
            });
            return contents;
        }
    };

    // 중국 체크
    $.ajax({
        async: false,
        url: 'http://ipinfo.io',
        type: 'get',
        dataType: 'jsonp',
        success: function (data, status, xhr) {
            if (data.country !== 'CN') {
                // PC에서만 팝업
                navigator.userAgent.indexOf('Mobile') === -1 ? new Popup() : '';
            }
        },
        error: function (xhr) {

        },
        timeout: 1000,
    });
});

