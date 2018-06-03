/* eslint-disable quotes */
/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/bbs/send_mail.js',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
], function ($, session, myFn, app, moment, MailBox) {
    'use strict';

    let Board_lists = (function () {
        let columns = [
            {
                data: 'title',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">
                            <a href="#">
                                ${data}
                            </a>
                        </div>
                    `;
                }
            },
            {
                data: 'user_name',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'insert_date',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${moment(data).format('YYYY-MM-DD')}</div>
                    `;
                }
            },
            {
                data: 'insert_date',
                render: function (data, type, row, meta) {
                    let txt = '';
                    if (row.bbs_idx !== '20') {         // iCT 뉴스 클리핑 제거
                        txt = `
                            <div class="margin: 0 auto;">
                                <button type="button" class="btn btn-xs btn-success btn_mail">
                                    <i class="fa fa-envelope-o"></i>
                                </button>
                            </div>
                        `;
                    }
                    return txt;
                }
            },
        ];

        let Board_lists = function (options) {
            this.myTable = null;
            this.data = null;

            this.options = {
                bbs_idx: 1,
                gubun: 'casware',
                objName: null
            };
            this.options = Object.assign(this.options, options);

            if (this.options.objName === null) {
                console.error('objName 누락');
                return;
            }

            this.init();
            this.initEvent();
        };

        Board_lists.prototype = {
            init: function () {
                this.tblInit();
            },
            initEvent: function () {
                this.tblEvent();
                this.btnEvent();
            },
            tblInit: function () {
                let self = this,
                    table = $(self.options.objName).find('table');

                this.myTable = table.DataTable({
                    ajax: {
                        url: '/agency/get_board',
                        data: {
                            bbs_idx: self.options.bbs_idx,
                        },
                        dataSrc: function (json) {
                            json.draw = json.lists.draw;
                            json.recordsTotal = json.lists.recordsTotal;
                            json.recordsFiltered = json.lists.recordsFiltered;
                            return json.lists.data;
                        }
                    },
                    rowId: 'idx',
                    processing: true,
                    serverSide: true,
                    paging: true,
                    pageingType: 'first_last_numbers',
                    pageLength: 5,
                    lengthMenu: [[10, 20, 25, 50], [10, 20, 25, 50]],
                    lengthChange: false,
                    searching: true,
                    searchDelay: 500,
                    ordering: false,
                    order: [[0, 'DESC']],
                    info: false,
                    autoWidth: false,
                    select: true,
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
                    },
                    columns: columns,
                });
            },
            tblEvent: function () {
                let self = this,
                    box = $(self.options.objName);

                this.myTable.on('draw.dt', function (e) {
                    box.find('.dataTables_paginate').parent().removeClass('col-sm-7').addClass('col-sm-12');
                    box.find('.dataTables_paginate').css('text-align', 'center');

                    self.clickTitle();
                    self.btnMail();
                });

                this.myTable.on('xhr', function () {
                    self.data = self.myTable.ajax.json();
                });
            },
            clickTitle: function () {
                let self = this,
                    box = $(self.options.objName);

                box.find('a').not('.paginate_button a').on('click', function () {
                    let data = self.myTable.row($(this).parents('tr')).data(),
                        href = `/main_contents/korea_agency/index?url=/bbs/view/${data.bbs_idx}/${data.idx}`;

                    // 카스웨어 DB를 쓰는 게시판 (iCT 뉴스)
                    if (self.options.gubun === 'casware') {
                        href = `/main_contents/korea_agency/index?url=/bbs/view/4/${data.idx}`;
                    }

                    window.open(href, '', '');
                });
            },
            btnMail: function () {
                let self = this,
                    box = $(self.options.objName),
                    mailBox;

                box.find('.btn-xs').on('click', function () {
                    let data = self.myTable.row($(this).parents('tr')).data();
                    mailBox = new MailBox(data);
                });
            },
            btnEvent: function () {
                let self = this,
                    box = $(self.options.objName);

                box.find('.fa-pencil').closest('button').on('click', function () {
                    let href = `/main_contents/korea_agency/index?url=/bbs/write/${self.options.bbs_idx}`;
                    window.open(href, '', '');
                });
            },
        };

        return Board_lists;
    })();

    let options = [
        {
            objName: '#gongji',
            gubun: 'agency',
            bbs_idx: 1
        },
        {
            objName: '#ict_news',
            gubun: 'casware',
            bbs_idx: 4
        },
        {
            objName: '#agency_news',
            gubun: 'agency',
            bbs_idx: 2
        },
        {
            objName: '#agency_suggest',
            gubun: 'agency',
            bbs_idx: 3
        },
    ];

    new Board_lists(options[0]);
    new Board_lists(options[1]);
    new Board_lists(options[2]);
    new Board_lists(options[3]);
});
