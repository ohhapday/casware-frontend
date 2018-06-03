/* eslint-disable indent */
/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker'
], function ($, session, myFn, app, moment) {
    'use strict';

    let Order_detail = (function () {
        let Order_detail = function (idx) {
            this.idx = idx;
            this.box = $('#order_detail');
            this.data = {};

            this.init();
            this.initEvent();
        };

        Order_detail.prototype = {
            init: function () {
                this.data = this.getData(function (self) {
                    self.box.closest('.row').removeClass('hidden');
                    self.box.animateCss('bounceInRight');

                    self.box.css('-webkit-animation-duration', '0.7s');
                    self.box.find('.overlay').addClass('hidden');

                    self.setDetail();
                });
            },
            initEvent: function () {
                let self = this;
                this.box.find('.btn-box-tool').on('click', function () {
                    self.box.animateCss('bounceOutLeft', function () {
                        self.box.closest('.row').addClass('hidden');
                    });
                });

                this.postOrderNo();
                this.btnEvent();
            },
            setDetail: function () {
                let data = this.data,
                    box = this.box;

                console.log(data);

                box.find('.CUS_NAME').text(data.CUS_NAME);
                box.find('.insert_time').text(data.insert_time);
                box.find('.officer_name').text(data.officer_name);
                box.find('.officer_phone').text(data.officer_phone);
                box.find('.delivery').text(data.delivery);
                box.find('.order_date').text(data.order_date);
                box.find('.memo').html(data.memo.replace(/\n/g, '<br />'));

                box.find('.company').text(data.company);
                box.find('.order_name').text(data.order_name);
                box.find('.order_tel').text(data.order_tel);
                box.find('.order_zip').text(data.order_zip);
                box.find('.order_addr').text(data.order_addr);
                box.find('.order_addr_detail').text(data.order_addr_detail);

                // 출고의뢰서 번호 입력
                (function () {
                    let order_no = data.order_no || '61220-' + moment().format('YYYYMM') + '-';
                    box.find('input[name="order_no"]').val(order_no);
                })();

                // 주문 내역
                (function () {
                    let box = $('#order_item');

                    box.find('tbody tr:not(.hidden)').remove();
                    $.each(data.detail, function () {
                        let clone = box.find('tbody tr:eq(0)').clone(true);

                        clone.find('td:eq(0) div').text(this.order_model);
                        clone.find('td:eq(1) div').text(this.order_ea);
                        clone.find('td:eq(2) div input[name="order_change_ea"]').val(this.order_change_ea);

                        box.find('tbody').append(clone);
                        clone.removeClass('hidden');
                    });
                })();

                // 운송장 번호
                (function () {
                    let box = $('#delivery_item');

                    box.find('tbody tr:not(.hidden)').remove();

                    $.each(data.delivery_no, function () {
                        let clone = box.find('tbody tr:eq(0)').clone(true);

                        clone.find('td:eq(0) div').html(`
                            <a href="http://www.hanjin.co.kr/Delivery_html/inquiry/result_waybill.jsp?wbl_num=${this}" 
                                target="_blank">${this}
                            </a>
                        `);

                        box.find('tbody').append(clone);
                        clone.removeClass('hidden');
                    });
                })();
            },
            // 출고의뢰서 번호 입력
            postOrderNo: function () {
                let self = this;

                this.box.find('.btn_order_no').off('click').on('click', function () {
                    let order_no = self.box.find('input[name="order_no"]').val();
                    self.postData(order_no);
                });

                this.box.find('input[name="order_no"]').off('keyup').on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        let order_no = self.box.find('input[name="order_no"]').val();
                        self.postData(order_no);
                    }
                });
            },
            putChangeEa(obj) {

            },
            btnEvent() {
                let self = this;

                // 재고없음 처리
                this.box.find('.btn-noone').off('click').on('click', function () {
                    self.putData(3);
                });

                // 주문제작중 처리
                this.box.find('.btn-prod').off('click').on('click', function () {
                    self.putData(4);
                });

                // 주문취소 처리
                this.box.find('.btn-cancel').off('click').on('click', function () {
                    self.putData(5);
                });

                // 확정수량 변경
                this.box.find('.btn-chg-ea').off('click').on('click', function (e) {
                    let obj = $(e.currentTarget).closest('div').find('input[name="order_change_ea"]'),
                        idx = $('input[name="order_change_ea"]:not(:eq(0))').index(obj),
                        value = obj.val();
                    self.putChangeEa({
                        idx,
                        value
                    });
                });

                this.box.find('input[name="order_change_ea"]').off('keyup').on('keyup', function (e) {
                    let idx = $('input[name="order_change_ea"]:not(:eq(0))').index($(this)),
                        value = $(this).val();

                    if (e.keyCode === 13) {
                        self.putChangeEa({
                            idx,
                            value
                        });
                    }
                });
            }
        };

        Order_detail.prototype = {
            ...Order_detail.prototype,
            getData: function (callback) {
                let self = this;
                $.ajax({
                    async: true, type: 'get', dataType: 'json',
                    url: '/agency/get_order_detail',
                    data: {
                        idx: self.idx || 1,
                    },
                    success: function (data, status, xhr) {
                        self.data = Object.assign({}, data);
                        if (typeof callback === 'function') {
                            callback(self);
                        }
                    }
                });
            },
            postData: function (order_no) {
                let self = this;
                $.ajax({
                    async: false, type: 'post', dataType: 'json',
                    url: '/agency/post_order_no',
                    data: {
                        idx: self.idx || 1,
                        order_no: order_no,
                    },
                    success: function (data, status, xhr) {
                        if (data.success === true) {
                            contact_lists.myTable.draw('page');
                        } else {
                            alert('출고의뢰번호가 ERP에 존재하지 않습니다.<br>다시 확인해 주시기 바랍니다.');
                        }
                    }
                });
            },
            putData: function (order_status) {
                let self = this;
                $.ajax({
                    async: false, type: 'post', dataType: 'json',
                    url: '/agency/put_order_status',
                    data: {
                        idx: self.idx || 1,
                        order_status: order_status,
                    },
                    success: function (data, status, xhr) {
                        if (data.success === true) {
                            contact_lists.myTable.draw('page');
                        }
                    }
                });
            },
            putChangeEa(obj) {
                let self = this,
                    detail = this.data.detail[obj.idx];

                $.ajax({
                    async: false, type: 'post', dataType: 'json',
                    url: '/agency/put_change_ea',
                    data: {
                        idx: detail.idx || 1,
                        order_change_ea: obj.value,
                    },
                    success: function (data, status, xhr) {
                        if (data.success === true) {
                            alert('확정수량 변경 완료');
                        }
                    }
                });
            }
        };

        return Order_detail;
    })();

    let Contact_lists = (function () {
        let columns = [
            {
                data: 'idx',
            },
            {
                data: 'insert_time',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'CUS_NAME',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'officer_name',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'officer_phone',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'order_no',
                render: function (data, type, row, meta) {
                    let text = (data === null) ? '' : data;
                    return `
                        <div class="ellipsis" style="text-align: center;">${text}</div>
                    `;
                }
            },
            {
                data: 'order_status',
                render: function (data, type, row, meta) {
                    let text = '';

                    switch (data) {
                        case '0':
                            text = '접수';
                            break;
                        case '1':
                            text = '<span style="color: coral;">출고중</span>';
                            break;
                        case '2':
                            text = '<span style="color: mediumblue;">배송</span>';
                            break;
                        case '3':
                            text = '<span style="color: #e08e0b;">재고없음</span>';
                            break;
                        case '4':
                            text = '<span style="color: #605ca8;">주문제작중</span>';
                            break;
                        case '5':
                            text = '<span style="color: #9f9f9f;">주문취소</span>';
                            break;
                    }
                    return `
                        <div class="ellipsis" style="text-align: center;">${text}</div>
                    `;
                }
            },
        ];

        let Contact_lists = function (options) {
            this.myTable = null;
            this.data = null;

            this.options = {
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

        Contact_lists.prototype = {
            init: function () {
                this.tblInit();
            },
            initEvent: function () {
                this.tblEvent();
                this.searchEvent();
            },
            tblInit: function () {
                let self = this,
                    table = $(self.options.objName).find('table');

                (function () {
                    $('input[name="YM_date"]').datetimepicker({
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

                this.myTable = table.DataTable({
                    ajax: {
                        url: '/agency/get_contact_lists',
                        data: function (d) {
                            return $.extend({}, d, {
                                s_year: $('input[name="YM_date"]').val(),
                                s_txt: $('input[name="s_txt"]').val(),
                                order_status: $('select[name="order_status"]').val(),
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
                    box = $(self.options.objName);

                this.myTable.on('draw.dt', function (e) {
                    $('#box_order tbody tr').on('click', function () {
                        let idx = self.lineClick(this);
                        new Order_detail(idx);
                    });

                    box.find('.dataTables_paginate').parent().removeClass('col-sm-7').addClass('col-sm-12');
                    box.find('.dataTables_paginate').css('text-align', 'center');
                });

                this.myTable.on('xhr', function () {
                    self.data = self.myTable.ajax.json();
                });
            },
            lineClick: function (self) {
                let row = this.myTable.row(self),
                    data = row.data();

                $(self).siblings().removeClass('selected');
                $(self).addClass('selected');
                return data.idx;
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
            }
        };

        Contact_lists.prototype = {
            ...Contact_lists.prototype,
            postData: function () {

            },
        };

        return Contact_lists;
    })();

    let options = [
        {
            objName: '#box_order',
        },
    ];

    let contact_lists = new Contact_lists(options[0]);
});
