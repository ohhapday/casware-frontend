/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/global/control_sidebar.js',                         // 우측 메뉴바
    '/dist/js/app/global/timezone.js',                         // 우측 메뉴바
    'datatables.net', 'dataTables-bootstrap',
], function ($, session, myFn, app, moment, control_sidebar, Timezone) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

    let tz = new Timezone();

    let defaults = {
        gubun: window.location.pathname.split('/')[1],
        bbs_idx: window.location.pathname.split('/')[3],
        idx: window.location.pathname.split('/')[4] || null,
    };

    (function () {
        let Bbs_info = function () {
            this.data = this.get_data();
            this.init();
            this.initEvent();
        };

        Bbs_info.prototype = {
            init: function () {
                $('.bbs-name').text(this.data.bbs_name);
            },
            initEvent: function(){
                $('#btn_korea').on('click', function () {
                    tz.setTimeZone('Asia/Seoul');
                    tz.getDateObj($('.u-date'));
                });

                $('#btn_local').on('click', function () {
                    tz.setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                    tz.getDateObj($('.u-date'));
                });

                $('#btn_america').on('click', function () {
                    tz.setTimeZone('America/Los_Angeles');
                    tz.getDateObj($('.u-date'));
                });

                $('#btn_russia').on('click', function () {
                    tz.setTimeZone('Europe/Moscow');
                    tz.getDateObj($('.u-date'));
                });

                $('.fa-pencil').parent().on('click', function () {
                    $(window.location).attr('href', '/bbs/write/' + defaults.bbs_idx);
                });
            },
            get_data: function () {
                let returnData = {};
                $.ajax({
                    async: false,
                    url: '/bbs/get_bbs_info',
                    type: 'get',
                    dataType: 'json',
                    data: {
                        bbs_idx: defaults.bbs_idx
                    },
                    success: function (data) {
                        returnData = Object.assign.call({}, data);
                    }
                });
                return returnData;
            }
        };

        new Bbs_info();
    })();

    // 테이블 생성
    (function () {
        let columns = [
            {
                data: 'idx', width: '100%',
                render: function (data, type, row, meta) {
                    let html = `
                        <div>
                            <div class="box-line" style="float: left; border-bottom: 0">
                                <a href="/${defaults.gubun}/view/${row.bbs_idx}/${row.idx}">
                                    <h5>
                                        <span>${row.title}</span>
                                        <span class="badge bg-yellow pull-right hidden" style="color: white;">${row.cmt_cnt}</span>
                                    </h5></a>
                                <p>
                                    <span class="u-name">[${row.post_name}] ${row.user_name}</span>
                                    <span class="u-date"><i>${tz.getTimezone(row.insert_date).format('YYYY-MM-DD HH:mm:ss')}</i></span>
                                </p>
                            </div>
                            <div class="div-hit">
                                <div>HIT: ${row.hit_cnt}</div>
                                <div>LIKE: ${row.vote_cnt}</div>
                            </div>                        
                        </div>
                    `;

                    if (row.cmt_cnt !== '0') {
                        html = html.replace('hidden', '');
                    }
                    return html;
                }
            },
        ];
        $('#bbs_lists_table').DataTable({
            ajax: {
                url: '/bbs/get_lists',
                data: {
                    bbs_idx: defaults.bbs_idx,
                },
            },
            processing: true,
            serverSide: true,
            paging: true,
            pageLength: 20,
            lengthMenu: [[10, 20, 25, 50], [10, 20, 25, 50]],
            lengthChange: true,
            searching: true,
            searchDelay: 500,
            // ordering: true,
            order: [[0, 'desc']],
            // info: true,
            autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
            },
            columns: columns,
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

