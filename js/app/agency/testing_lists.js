/* eslint-disable indent */
/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker', 'icheck',
    // 'file-upload',
], function ($, session, myFn, app, moment) {
    'use strict';

    $.ajax({
        async: false,
        type: 'GET',
        url: '/dist/js/common/fileUpload.js',
        dataType: 'script',
    });


    let Testing_lists = (function () {
        let columns = [
            {
                data: 'idx',
            },
            {
                data: 'prod_date',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_model',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_num',
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
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'files_insert_date',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${(!!data) ? data : ''}</div>
                    `;
                }
            },
            {
                data: '',
                render: function (data, type, row, meta) {
                    let hidden = !!row.original_filename ? 'hidden' : '';
                    return `
                        <div class="${hidden}">
                            <button type="button" class="btn btn-primary btn-sm" title="수정">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm" title="삭제">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                    `;
                }
            },
        ];

        let Testing_lists = function () {
            this.myTable = null;
            this.data = null;

            this.init();
            this.initEvent();
        };

        Testing_lists.prototype = {
            init: function () {
                this.tblInit();
            },
            initEvent: function () {
                this.tblEvent();
            },
            tblInit: function () {
                let self = this;
                // datetimepicker 처리
                (function () {
                    $('input[name="s_year"]').datetimepicker({
                        defaultDate: moment(),
                        format: 'YYYY-MM',
                        locale: 'ko',
                        // minDate: moment().format('YYYY-MM'),
                        widgetPositioning: {
                            horizontal: 'right',
                            vertical: 'bottom'
                        },
                    }).on('dp.change', function (e) {
                        self.myTable.draw();
                    });
                })();

                this.myTable = $('#lists_table').DataTable({
                    ajax: {
                        url: '/agency/get_testing_lists',
                        data: function (d) {
                            return $.extend({}, d, {
                                s_year: $('input[name="s_year"]').val()
                            });
                        }
                    },
                    rowId: 'idx',
                    processing: true,
                    serverSide: true,
                    paging: true,
                    pageingType: 'first_last_numbers',
                    pageLength: 10,
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
                    box = $('.dataTables_paginate');

                this.myTable.on('draw.dt', function (e) {
                    box.parent().removeClass('col-sm-7').addClass('col-sm-12');
                    box.css('text-align', 'center');


                    self.myTable.column(0, {search: 'applied', order: 'applied'})
                        .nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });

                    self.btnEvent();
                });

                this.myTable.on('xhr', function () {
                    self.data = self.myTable.ajax.json();
                    $('.page_chk .num em').text(self.data.recordsTotal);
                });
            },
            btnEvent() {
                let self = this,
                    obj = $('#lists_table');
                obj.find('button').on('click', function (e) {
                    if ($(e.currentTarget).hasClass('btn-primary')) {
                        let index = obj.find('.btn-primary').index($(this)),
                            data = self.data.data[index];

                        $('.area_inp input[name="idx"]').val(data.idx);
                        $('.area_inp input[name="prod_date"]').val(data.prod_date);
                        $('.area_inp input[name="prod_model"]').val(data.prod_model);
                        $('.area_inp input[name="prod_num"]').val(data.prod_num);
                    } else {
                        let index = obj.find('.btn-danger').index($(this)),
                            data = self.data.data[index];
                        self.deleteData(data.idx);
                    }
                });
            },
        };

        Testing_lists.prototype = Object.assign(Testing_lists.prototype, {
            deleteData(idx) {
                let self = this;
                $.ajax({
                    async: false, type: 'post', dataType: 'json',
                    url: '/testing/delete_report',
                    data: {
                        idx,
                    },
                    success: function (data, status, xhr) {
                        alert('검정확인서가 취소 되었습니다.');
                        self.myTable.draw('page');
                    }
                });
            },
        });

        return new Testing_lists();
    })();

    // 검정확인서 입력
    (function () {
        let Testing_req = function () {
            this.init();
            this.initEvent();
        };

        Testing_req.prototype = {
            init() {
                $('.area_inp input[name="prod_date"]').datetimepicker({
                    defaultDate: moment(),
                    format: 'YYYY-MM-DD',
                    locale: 'ko',
                    widgetPositioning: {
                        horizontal: 'right',
                        vertical: 'bottom'
                    },
                });
            },
            initEvent() {
                let self = this,
                    form = $('.area_inp form');

                form.find('button').on('click', function (e) {
                    if (form[0].checkValidity() === false) {
                        return;
                    }
                    e.preventDefault();

                    self.postData();
                    self.reset();
                });
            },
            reset() {
                let form = $('.area_inp form');
                form[0].reset();
            }
        };

        Testing_req.prototype = Object.assign(Testing_req.prototype, {
            postData() {
                let self = this,
                    form = $('.area_inp form');

                $.ajax({
                    async: false, type: 'post', dataType: 'json',
                    url: '/testing/post_report',
                    data: {
                        idx: form.find('input[name="idx"]').val(),
                        prod_date: form.find('input[name="prod_date"]').val(),
                        prod_model: form.find('input[name="prod_model"]').val(),
                        prod_num: form.find('input[name="prod_num"]').val(),
                    },
                    success: function (data, status, xhr) {
                        alert('검정확인서가 요청 되었습니다.');
                        Testing_lists.myTable.draw('page');
                    }
                });
            },
        });

        new Testing_req();
    })();


    /*
        $('.fileinput-area').fileUpload({
            domain: '',
            url: '/common/uploadfile_handle/up_file',
            filePath: `userfile/${session.user_code}/`,
            // url: '/common/uploadfile_handle/up_file?path=userfile/' + session.user_code + '/',
            deletable_file: [{
                deleteUrl: '',
                article_idx: '5276',
                bbs_idx: '14',
                capacity: '88589',
                conversion_filename: '95256_x.jpg',
                filepath: '/userfile/151036/14/',
                idx: '1342',
                is_deleted: '0',
                is_wysiwyg: '0',
                mime: 'image/jpeg',
                original_filename: '95256_x.jpg',
                sequence: null,
                user_code: '151036',
            }, {
                deleteUrl: '',
                article_idx: '5276',
                bbs_idx: '14',
                capacity: '314484',
                conversion_filename: 'TEST.pdf',
                filepath: '/userfile/151036/14/',
                idx: '1343',
                is_deleted: '0',
                is_wysiwyg: '0',
                mime: 'application/pdf',
                original_filename: 'TEST.pdf',
                sequence: null,
                user_code: '151036',
            }],
        });
        */
});
