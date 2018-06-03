/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker', 'jquery-slimscroll', 'faloading',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

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
            initEvent: function () {
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
            {data: 'idx', width: '5%'},
            {
                data: 'title', width: '50%',
                render: function (data, type, row, meta) {
                    let html = `
                        <div class="ellipsis" style="max-width: 350px;">                            
                            <a href="/${defaults.gubun}/view/${row.bbs_idx}/${row.idx}">
                                ${data}
                            </a>
                            <span class="hidden">
                                <small class="label badge bg-yellow">${row.cmt_cnt}</small>
                            </span>
                        </div>
                    `;

                    if (row.cmt_cnt !== '0') {
                        html = html.replace('hidden', '');
                    }
                    return html;
                }
            },
            {
                data: 'user_name', width: '15%',
                render: function (data, type, row, meta) {
                    return `<div class="ellipsis" style="max-width: 90px;">[${row.post_name}] ${data}</div>`;
                }
            },
            {data: 'hit_cnt', width: '7%'},
            {data: 'vote_cnt', width: '7%'},
            {
                data: 'insert_date', width: '16%',
                render: function (data, type, row, meta) {
                    let date = moment(data).format('YYYY-MM-DD');
                    return `<div class="ellipsis" style="max-width: 80px;">${date}</div>`;
                }
            },
        ];
        let myTable = $('#bbs_lists_table').DataTable({
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
            ordering: true,
            order: [[5, 'desc']],
            info: true,
            autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
            },
            columns: columns,
        });

        myTable.on('search.dt', function () {
            $('.dataTables_filter input').off().on('keypress keyup', function (e) {
                if ($(this).val().length < 2 && e.keyCode !== 13) return;
                myTable.search($(this).val()).draw();
            });
        });

        myTable.on('init.dt', function (e) {
            $('.dataTables_filter input').attr('placeholder', 'Enter at least 2 characters');
        });
    })();
});

