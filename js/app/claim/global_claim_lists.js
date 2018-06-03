/* eslint-disable no-undef,no-unused-vars,quotes,indent */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/claim/global_claim_authority.js',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker'
], function ($, session, myFn, app, moment, Authority) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

    let params = {
        dir: window.location.pathname.split('/')[1] || null,
        mode: window.location.pathname.split('/')[2] || null,
        idx: window.location.pathname.split('/')[3] || null,
    };

    // 테이블 생성
    (function () {
        let columns = [
            {data: 'idx', width: '5%'},
            {
                data: '', width: '20%',
                render: function (data, type, row, meta) {
                    let html = `
                        <div class="ellipsis">                            
                            [${row.dept_name}] ${row.user_name} 
                        </div>
                    `;

                    if (row.cmt_cnt !== '0') {
                        html = html.replace('hidden', '');
                    }
                    return html;
                }
            },
            {
                data: 'nation_name', width: '20%',
                render: function (data, type, row, meta) {
                    let html = `
                        <div class="ellipsis" style="max-width: 350px;">                            
                            <a href="/${params.dir}/view/${row.idx}">
                                ${data}
                            </a>
                            <span class="hidden" style="float: right;">
                                <small class="label badge bg-yellow">${row.cnt !== '0' ? row.cnt : ''}</small>
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
                data: 'prod_model', width: '25%',
            },
            {
                data: 'prod_site', width: '15%',
                render: function (data, type, row, meta) {
                    let aa = '';
                    switch (data) {
                        case '1':
                            aa = 'China(JiaShan)';
                            break;
                        case '2':
                            aa = 'Korea(YangJu)';
                            break;
                        case '3':
                            aa = 'OEM';
                            break;
                    }
                    return `<div class="ellipsis" style="max-width: 120px;">${aa}</div>`;
                }
            },
            {
                data: 'occur_date', width: '15%',
                render: function (data, type, row, meta) {
                    let date = moment(data).format('YYYY-MM-DD');
                    return `<div class="ellipsis" style="max-width: 80px;">${date}</div>`;
                }
            },
        ];

        let auth = new Authority({
            user_code: session.user_code,
        });

        let myTable = $('#bbs_lists_table').DataTable({
            ajax: {
                url: '/global_claim/get_lists',
                data: function (d) {
                    return $.extend({}, d, {
                        admin_status: auth.viewStatus,
                    });
                }
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
            order: [[0, 'desc']],
            info: true,
            autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
            },
            columns: columns,
        });

        myTable.on('search.dt', function () {
            $('.dataTables_filter input').off().on('keypress keyup', function (e) {
                if (e.keyCode !== 13) return;
                myTable.search($(this).val()).draw();
            });
        });

        myTable.on('init.dt', function (e) {
            $('.dataTables_filter input').attr('placeholder', 'Enter at least 2 characters');
        });
    })();

    (function () {
        $('.fa-pencil').parent().on('click', function () {
            location.href = '/global_claim/write';
        });
    })();
});

