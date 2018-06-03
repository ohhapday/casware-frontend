/* eslint-disable indent */
/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker', 'icheck'
], function ($, session, myFn, app, moment) {
    'use strict';

    (function () {
        let columns = [
            {
                data: null,
                render: function (data, type, row, meta) {
                    let text = '';
                    if (row.SEND_MH === '택배' && row.PARCELNO !== null) {
                        text = '<input type="checkbox" name="" class="minimal" value=""/>';
                    } else {
                        text = '&nbsp;';
                    }
                    return text;
                }
            },
            {
                data: 'HOPDAT',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'CUSNAM',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'USEMAN',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'JPM_CD',
                render: function (data, type, row, meta) {
                    return `
                        <div class="" style="text-align: left">${row.USEADR + '' + (row.USEADR2 || '')}</div>
                    `;
                }
            },
            {
                data: 'JPMNAM',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'SEND_MH',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'PARCELNO',
                render: function (data, type, row, meta) {
                    let text = (data === null) ? '' : data.split(',');
                    let aaaa = '';

                    $.each(text, function () {
                        aaaa += `
                            <a href="http://www.hanjin.co.kr/Delivery_html/inquiry/result_waybill.jsp?wbl_num=${this}" 
                                target="_blank">
                                ${this}
                            </a>
                            <br>
                        `;
                    });

                    return `
                        <div class="ellipsis">${aaaa}</div>
                    `;
                }
            },
        ];

        let Delivery_lists = function () {
            this.myTable = null;
            this.data = null;

            this.init();
            this.initEvent();
        };

        Delivery_lists.prototype = {
            init: function () {
                this.tblInit();
            },
            initEvent: function () {
                this.tblEvent();
                this.searchEvent();
            },
            tblInit: function () {
                let self = this;
                // datetimepicker 처리
                (function () {
                    $('input[name="s_year"]').datetimepicker({
                        defaultDate: moment(),
                        format: 'YYYY-MM',
                        locale: 'ko',
                        widgetPositioning: {
                            horizontal: 'right',
                            vertical: 'bottom'
                        },
                    }).on('dp.change', function (e) {
                        console.log(self.myTable.draw());
                    });
                })();

                this.myTable = $('#lists_table').DataTable({
                    ajax: {
                        url: '/agency/get_delivery_lists',
                        data: function (d) {
                            return $.extend({}, d, {
                                s_year: $('input[name="s_year"]').val(),
                                s_txt: $('input[name="s_txt"]').val(),
                            });
                        }
                    },
                    rowId: 'idx',
                    processing: true,
                    serverSide: true,
                    paging: true,
                    pageingType: 'first_last_numbers',
                    pageLength: 20,
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
                    $('#box_order').find('input[type="checkbox"]').iCheck('uncheck');

                    $('#box_order').find('input[type="checkbox"]').iCheck({
                        checkboxClass: 'icheckbox_square-blue',
                        radioClass: 'iradio_square-blue'
                    });
                    box.parent().removeClass('col-sm-7').addClass('col-sm-12');
                    box.css('text-align', 'center');

                    self.btnEvent();
                });

                this.myTable.on('xhr', function () {
                    let json = self.myTable.ajax.json();
                    $('.page_chk .num em').text(json.recordsTotal);
                });
            },
            searchEvent: function () {
                let self = this,
                    box = $('#box_order');

                box.find('input[name="s_txt"]').on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        self.myTable.draw();
                    }
                });

                box.find('select[name="order_status"]').on('change', function () {
                    self.myTable.draw();
                });
            },
            btnEvent: function () {
                let self = this,
                    box = $('#box_order');

                // 전체선택/해제
                box.find('thead input[type="checkbox"]').on('ifChecked', function (e) {
                    box.find('input[type="checkbox"]').iCheck('check');
                });
                box.find('thead input[type="checkbox"]').on('ifUnchecked', function (e) {
                    box.find('input[type="checkbox"]').iCheck('uncheck');
                });

                // SNS 발송
                box.find('.fa-truck').closest('button').off('click').on('click', function () {
                    let json = self.myTable.ajax.json().data,
                        sendData = [],
                        chkbox = box.find('tbody tr input[type="checkbox"]'),
                        checked = box.find('tbody tr input[type="checkbox"]:checked');

                    $.each(checked, function () {
                        let index = chkbox.index(this);
                        sendData.push(json[index]);
                    });

                    if (sendData.length > 0) {
                        self.sendSns(sendData, function () {
                            box.find('input[type="checkbox"]').iCheck('uncheck');
                        });
                    }
                });
            },
        };

        Delivery_lists.prototype = {
            ...Delivery_lists.prototype,
            sendSns: function (data, callback) {
                $.ajax({
                    async: true, type: 'post', dataType: 'json',
                    url: '/agency/send_sms',
                    data: {
                        deliveryData: data
                    },
                    success: function (data, status, xhr) {
                        if (data.status === true) {
                            alert('SNS 발송');

                            if (typeof callback === 'function') {
                                callback();
                            }
                        }
                    },
                    beforeSend: function () {
                        $('#box_order .box').append(`
                            <div class="overlay">
                                <i class="fa fa-refresh fa-spin"></i>
                            </div>
                        `);
                    },
                    complete: function () {
                        $('#box_order .box').find('.overlay').remove();
                    }
                });
            },
        };

        new Delivery_lists();
    })();
});
