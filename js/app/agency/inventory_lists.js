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

    // ERP 데이터 가져오기
    let Erp_download = (function () {
        let Erp_download = function () {
            return {
                download: this.postData
            };
        };

        Erp_download.prototype = {
            ...Erp_download.prototype,
            postData: function (callback) {
                let self = this;
                $.ajax({
                    async: true, type: 'get', dataType: 'json',
                    url: '/agency/get_ERP_download',
                    success: function (data, status, xhr) {
                        if (data === true) {
                            alert('금일 현재 ERP 데이터 가져오기가 완료되었습니다.');

                            if (typeof callback === 'function') {
                                callback(self);
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

        return Erp_download;
    })();

    // 기본 이벤트 등록
    (function () {
        let putFavorite = function (data) {
            $.ajax({
                async: false, type: 'post', dataType: 'json',
                url: '/agency/put_favorite',
                data: data,
                success: function (data, status, xhr) {
                    favorite_lists.myTable.draw('page');
                    inventory_lists.myTable.draw('page');
                },
            });
        };

        // ERP 데이터 가져오기
        $('.fa-download').closest('button').off('click').on('click', function () {
            let erp_download = new Erp_download();
            erp_download.download(function () {
                favorite_lists.myTable.draw();
                inventory_lists.myTable.draw();
            });
        });

        // 즐겨찾기 추가
        $('.fa-eye').closest('button').off('click').on('click', function () {
            let checkbox = $('#box_order').find('input[type="checkbox"]:checked'),
                data = [];

            $.each(checkbox, function () {
                let prod_cd = $(this).closest('tr').find('td:eq(2)').text().trim();
                data.push(prod_cd);
            });

            putFavorite({
                action: 'add',
                prod_cd: data,
            });
        });

        // 즐겨찾기 삭제
        $('.fa-eye-slash').closest('button').off('click').on('click', function () {
            let checkbox = $('#box_favorite').find('input[type="checkbox"]:checked'),
                data = [];

            $.each(checkbox, function () {
                let prod_cd = $(this).closest('tr').find('td:eq(2)').text().trim();
                data.push(prod_cd);
            });

            putFavorite({
                action: 'delete',
                prod_cd: data,
            });
        });
    })();

    // 재고현황 List
    let Inventory_lists = (function () {
        let columns = [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return `
                        <input type="checkbox" name="" class="minimal" value=""/>
                    `;
                }
            },
            {
                data: 'prod_nm',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_cd',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_siz',
                render: function (data, type, row, meta) {
                    data = (data !== null) ? data : '';
                    return `
                        <div class="ellipsis">${data}</div>
                    `;
                }
            },
            {
                data: 'inven_dir',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_ea',
                render: function (data, type, row, meta) {
                    return `
                        <div class="ellipsis" style="text-align: center;">${data}</div>
                    `;
                }
            },
            {
                data: 'prod_ea_chg',
                render: function (data, type, row, meta) {
                    return `
                        <input type="number" class="form-control" value="${data}"
                            min="0"
                            style="width: 100%; height: 20px; text-align: right"/>
                    `;
                }
            },
        ];

        let Inventory_lists = function (options) {
            this.myTable = null;
            this.data = null;
            this.options = Object.assign({
                url: '/agency/get_inventory_lists',
                obj: '#box_order',
            }, options);
            this.box = $(options.obj);

            this.init();
        };

        Inventory_lists.prototype = {
            init: function () {
                this.tblInit();
                this.initEvent();
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
                        format: 'YYYY-MM-DD',
                        locale: 'ko',
                        // minDate: moment().format('YYYY-MM'),
                        widgetPositioning: {
                            horizontal: 'right',
                            vertical: 'bottom'
                        },
                    }).on('dp.change', function (e) {
                        console.log(self.myTable.draw());
                    });
                })();

                this.myTable = this.box.find('table').DataTable({
                    ajax: {
                        url: self.options.url,
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
                    pageLength: 15,
                    lengthMenu: [[10, 20, 25, 50], [10, 20, 25, 50]],
                    lengthChange: false,
                    searching: true,
                    searchDelay: 500,
                    ordering: true,
                    order: [[1, 'ASC']],
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
                    self.box.find('input[type="checkbox"]').iCheck({
                        checkboxClass: 'icheckbox_square-blue',
                        radioClass: 'iradio_square-blue'
                    });
                    box.parent().removeClass('col-sm-7').addClass('col-sm-12');
                    box.css('text-align', 'center');

                    self.valChange();
                });

                this.myTable.on('xhr', function () {
                    let json = self.myTable.ajax.json();
                    self.data = json;
                    $('.page_chk .num em').text(json.recordsTotal);

                    // ERP 데이터 가져오기 버튼 비활성화
                    if (json.recordsTotal === 0) {
                        $('.fa-download').closest('button').attr('disabled', false);
                    } else {
                        $('.fa-download').closest('button').attr('disabled', true);
                    }
                });
            },
            searchEvent: function () {
                let self = this,
                    box = this.box;

                box.find('input[name="s_txt"]').on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        self.myTable.draw();
                    }
                });

                box.find('select[name="order_status"]').on('change', function () {
                    self.myTable.draw();
                });
            },
            valChange: function () {
                let self = this;
                this.box.find('input[type="number"]').on('change', function (e) {
                    let index = $('input[type="number"]').index($(this)),
                        data = self.myTable.row($(this).parents('tr')).data();
                    let prod_cd = data.prod_cd,
                        inven_cd = data.inven_cd;

                    $('input[type="number"]').eq(index + 1).focus();

                    self.putEa({
                        yymmdd: $('input[name="s_year"]').val(),
                        prod_cd: prod_cd,
                        inven_cd: inven_cd,
                        value: $(this).val()
                    });
                });
            },
        };

        Inventory_lists.prototype = {
            ...Inventory_lists.prototype,
            putEa: function (data) {
                console.log(data);

                $.ajax({
                    async: true, type: 'post', dataType: 'json',
                    url: '/agency/put_ea',
                    data: {
                        yymmdd: data.yymmdd,
                        prod_cd: data.prod_cd,
                        inven_cd: data.inven_cd,
                        val: data.value,
                    },
                });
            }
        };

        return Inventory_lists;
    })();

    let favorite_lists = new Inventory_lists({
        url: '/agency/get_favorite_lists',
        obj: '#box_favorite',
    });

    let inventory_lists = new Inventory_lists({
        url: '/agency/get_inventory_lists',
        obj: '#box_order',
    });
});
