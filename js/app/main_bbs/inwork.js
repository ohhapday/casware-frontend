/**
 * Created by 서정석 on 2017/01/04.
 * 출근현황
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'jquery-slimscroll', 'faloading', 'select2',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker',
], function ($, session, myFn, app, moment) {
    "use strict";

    let ajax_data,
        html = null,
        dept_filler = null,             // select에 사용할 부서 그룹
        datatable = null;

    // DataTable 생성 함수
    var create_table = function (datetime) {
        let dept = $('.modal-body .form-control:eq(1)').val() || '';
        let query;
        query = '?dept=' + dept + '&searchTxt=';

        datatable = $("#inwork_table").DataTable({
            scrollCollapse: true,
            paging: false,
            lengthChange: false,
            searching: false,
            ordering: true,
            info: true,
            autoWidth: true,
            processing: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
            },
            // serverSide: true,
            ajax: '/main/get_inwork/' + datetime + query,
            columns: [
                {data: '순서'},
                {data: '부서명'},
                {data: '성명'},
                {
                    data: '상태',
                    render: function (data, type, row, meta) {
                        let $return = '';
                        if (data === "지각") {
                            $return = '<div>' +
                                '<span style="padding: 0px 5px;" class="bg-yellow">' + data + '' +
                                '</span></div>';
                        } else {

                            if (row.사유) {
                                $return = '' +
                                    '<div class="p-title" style="width: 200px;" data-toggle="tooltip" ' +
                                    'data-placement="bottom" title="' + row.사유 + '">' + data + '</div>';
                            } else {
                                $return = '' +
                                    '<div class="p-title" style="width: 200px;">' + data + '</div>';
                            }
                        }

                        return $return;
                    }
                },
                {data: '출근시간'},
            ],
        });
    };

    // 출근부 처리
    (function (now_date) {
        $('#towork').on('click', function () {
            function update_datatable() {
                let date = $('.modal-body .form-control:eq(0)').val();
                let dept = $('.modal-body .form-control:eq(1)').val();
                let searchTxt = $('.modal-body .form-control:eq(2)').val();
                let query;

                query = '?dept=' + dept + '&searchTxt=' + searchTxt;
                datatable.ajax.url('/main/get_inwork/' + date + query).load();

                datatable.clear().draw();
            }

            // 초기 데이터 (당일) 생성
            (function () {
                if (html === null) {
                    $.ajax({
                        async: false,
                        url: "/dist/html/main/inwork.html",
                        type: "get",
                        dataType: "html",
                        success: function (data, status, xhr) {
                            html = $(data);
                        }
                    });

                    $('body').append(html);
                    $('#inwork_table').parent().slimScroll({
                        height: '300',
                    });
                }
            })();

            // Modal 이벤트 등록
            (function () {
                $('.modal-body input:eq(0)').val(now_date);

                $('.modal-body input:eq(0)').datetimepicker({
                    format: 'YYYY-MM-DD',
                    locale: 'ko',
                }).on('dp.change', function (e) {
                    update_datatable();
                });

                $('#inwork.modal').modal('show');
            })();

            // 부서 선택
            (function () {
                if (dept_filler === null) {
                    $.ajax({
                        async: false,
                        url: '/main/get_dept_filler',
                        type: 'get',
                        dataType: 'json',
                        success: function (data, status, xhr) {
                            dept_filler = data;
                        }
                    });

                    let $select2 = $('.modal select').select2({
                        data: dept_filler,
                        placeholder: '부서 선택',
                        allowClear: true,
                        // multiple: true,
                        closeOnSelect: false,
                        width: '100%',
                    });

                    if (session.dept_code !== "CAS0600") {
                        $select2.val(session.filler).trigger("change");
                    }

                    $('.modal select').on("change", function (e) {
                        $(this).select2('close');
                        update_datatable();
                    });
                }
            })();

            // 성명 검색
            $('.modal-body .form-control:eq(2)').on('keydown', function (key) {
                if (key.keyCode === 13) {
                    update_datatable();
                }
            });

            if (datatable === null) {
                create_table(now_date);     // 초기 datatable 생성
            }
        })
    })(moment().format('YYYY-MM-DD'));

});

