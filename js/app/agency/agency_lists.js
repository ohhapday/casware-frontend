/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
], function ($, session, myFn, app, moment) {
    'use strict';

    let Agency_detail = (function () {
        let Agency_detail = function (cus_cd) {
            this.cus_cd = cus_cd;
            this.box = $('#agency_detail');
            this.data = Object.assign({}, this.get_data());

            this.init();
            this.initEvent();
        };

        Agency_detail.prototype = {
            init: function () {
                this.setDetail();

                this.box.removeClass('hidden');
                this.box.animateCss('fadeInDown');

                this.box.css('-webkit-animation-duration', '0.7s');
                this.box.find('.overlay').addClass('hidden');
            },
            initEvent: function () {
                let self = this;
                this.box.find('.btn-box-tool').on('click', function () {
                    self.box.animateCss('bounceOutLeft', function () {
                        self.box.addClass('hidden');
                    });
                });
            },
            setDetail: function () {
                let data = this.data;

                this.box.find('.box-title')
                    .text(`${data.CUSNAM}`);
                this.box.find('.SAP_NO').text(data.SAP_NO);
                this.box.find('.CUS_CD').text(data.CUS_CD);
                this.box.find('.SAUP_GUB').text(data.SAUP_GUB);
                this.box.find('.PWD_CD').text(data.PWD_CD);
                this.box.find('.TAE').text(data.TAE);
                this.box.find('.MOK').text(data.MOK);
                this.box.find('.ADR').html(`${data.ZIP_NO} ${data.ADR1} ${(data.ADR2 === null) ? '' : data.ADR2}`);
                this.box.find('.CONTACT_NAME').text(data.CONTACT_NAME);
                this.box.find('.CONTACT_MOBILE').text(data.CONTACT_MOBILE);
                this.box.find('.CR_EMAIL').text(data.CR_EMAIL);
                this.box.find('.BANK').text(`
                    ${(data.BANKCD === null) ? '' : data.BANKCD}
                    ${(data.KWNO === null) ? '' : data.KWNO}
                    ${(data.YEAGUMJU === null) ? '' : data.YEAGUMJU}
                `);
            },
        };

        Agency_detail.prototype = Object.assign(Agency_detail.prototype, {
            get_data: function () {
                let returnData = {};
                $.ajax({
                    url: '/agency/get_agency_detail',
                    type: 'get', dataType: 'json', async: false,
                    data: {
                        CUS_CD: this.cus_cd
                    },
                    success: function (data) {
                        returnData = Object.assign.call({}, data);
                    }
                });
                return returnData;
            },
        });

        return Agency_detail;
    })();

    // 대리점 리스트
    let Agency_lists = (function () {
        let columns = [
            {
                data: 'INCEN_GUB1', width: '7%',
                render: function (data, type, row, meta) {
                    return '';
                }
            },
            {
                data: 'INCENNAM', width: '7%',
                render: function (data, type, row, meta) {
                    return `<div class="ellipsis" style="max-width: 50px;">${data}</div>`;
                }
            },
            {
                data: 'CUS_CD',
            },
            {
                data: 'CUSNAM',
                render: function (data, type, row, meta) {
                    return `<div class="ellipsis">${data}</div>`;
                }
            },
            {data: 'CHRNAM',},
            {data: 'SAP_NO',},
            {data: 'TEL_NO',},
            {data: 'FAX_NO',},
            {data: 'CR_MOBILE',},
        ];

        let Agency_lists = function () {
            this.myTable = null;
            this.data = null;

            this.init();
            this.initEvent();
        };

        Agency_lists.prototype = {
            init: function () {
                let self = this;

                this.myTable = $('#lists_table').DataTable({
                    ajax: {
                        url: '/agency/get_agency_lists',
                        data: {
                            bbs_idx: 11,
                        },
                        dataSrc: function (json) {
                            self.data = json;
                            return json.data;
                        }
                    },
                    processing: true,
                    serverSide: true,
                    paging: true,
                    pageLength: 10,
                    lengthMenu: [[10, 20, 25, 50], [10, 20, 25, 50]],
                    lengthChange: true,
                    searching: true,
                    searchDelay: 500,
                    ordering: true,
                    order: [[0, 'ASC']],
                    info: true,
                    autoWidth: false,
                    select: true,
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
                    },
                    columns: columns,
                });
            },
            initEvent: function () {
                let self = this;

                this.myTable.on('init.dt', function (e) {
                    $('.dataTables_filter input').attr('placeholder', '2글자이상');
                });

                this.myTable.on('draw.dt', function (e) {
                    $('#lists_table tbody tr').on('click', function () {
                        let cus_cd = self.lineClick(this);
                        new Agency_detail(cus_cd);
                    });
                });

                this.myTable.on('search.dt', function () {
                    $('.dataTables_filter input').off().on('keyup', function (e) {
                        if ($(this).val().length !== 1) {
                            this.search($(this).val()).draw();
                        }
                    });
                });

                this.myTable.on('xhr', function () {
                    let json = self.myTable.ajax.json();
                    console.log(json);
                });
            },
            lineClick: function (self) {
                $(self).siblings().removeClass('selected');
                $(self).addClass('selected');
                return $(self).children('td:eq(2)').text();
            },
        };

        return Agency_lists;
    })();

    new Agency_lists;
});
