/**
 * Created by 서정석 on 2017/04/17.
 */

requirejs([
    // 'jquery', 'bootstrap', 'app', <-- 상단에 이미 선언되어 제거된 plugin
    'session', 'myFn', 'orgInfo', 'moment',
    'datatables.net', 'dataTables-bootstrap', 'dataTables-rowgroup',
    'datetimepicker',
], function (session, myFn, orgInfo, moment) {
    "use strict";

    let aData = {                   // ajax Data
        dataSet: null,
    };
    let table = null;                      // dataTables
    let now_date = moment();

    // 날짜 선택
    (function () {
        $('#target_date').datetimepicker({
            defaultDate: now_date,
            format: 'YYYY-MM',
            locale: 'ko',
            minDate: '2017-04',
        });
        $('#target_date').on('dp.change', function (e) {
            // $(location).attr('href', '/seal_doc/lists/' + e.date.format('YYYY/MM'));
            now_date = e.date;
            $.fn.rend_table();
        });

        // datepicker 처리
        $('#start_date').datetimepicker({
            defaultDate: moment(),
            format: 'YYYY-MM',
            locale: 'ko',
            minDate: '2017-04',
        });
        $('#end_date').datetimepicker({
            defaultDate: moment(),
            format: 'YYYY-MM',
            locale: 'ko',
            minDate: '2017-04',
            useCurrent: false,
        });

        $('#start_date').on("dp.change", function (e) {
            $('#end_date').data("DateTimePicker").minDate(e.date);
            $.fn.rend_table();
        });
        $('#end_date').on("dp.change", function (e) {
            $('#start_date').data("DateTimePicker").maxDate(e.date);
            $.fn.rend_table();
        });
    })();

    // 프린트 버튼 처리
    (function () {
        $('.btn-print').on('click', function () {
            print();
        });
    })();

    // dataTables 생성
    $.fn.rend_table = function () {
        if (table) {
            $('.my-table').empty();
            table.destroy();
        }

        (function () {
            $.ajax({
                async: false,
                url: "/seal_doc/get_list",
                type: "get",
                dataType: "json",
                data: {
                    sDate: $('#start_date').val(),
                    eDate: $('#end_date').val(),
                },
                success: function (data, status, xhr) {
                    aData.dataSet = data;
                    $('.fa-loading-wrapper').hide();
                }
            });
        })();

        $.fn.dataTable.ext.errMode = 'none';        // dataTable alert 삭제

        // 첨부파일 rendering
        let render_file = function (data, type, row, meta) {
            let filenm = (row.파일) ? row.파일[0].original_name : '&nbsp;';
            let href = '<a href="/seal_doc/file_download/' + row.문서번호 + '/' + row.세부번호 + '">' + filenm + '</a>';
            let style = 'width: 75%; float: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            return '' +
                '<div style="' + style + '">' + href + '</div>';
/*                '<div style="' + style + '">' + href + '</div>' +
                '<div style="width:15%; float: left;">' +
                '   <button type="button" class="btn btn-danger btn-xs">' +
                '       <i class="fa fa-file-pdf-o"></i>' +
                '   </button>' +
                '</div> ';
                */
        }

        // 처리완료 rendering
        let render_complete = function (data, type, row, meta) {
            let selected_1 = '', selected_2 = '';
            (row.완료여부 != 1) ? selected_1 = ' selected' : selected_2 = ' selected';
            let style = (row.완료여부 != 1) ? '' : 'background-color: #3c8dbc; color: #FFFFFF';
            return '' +
                '<select class="form-control" style="' + style + '">' +
                '   <option value="0"' + selected_1 + '>진행</option>' +
                '   <option value="1"' + selected_2 + '>완료</option>' +
                '   <option value=""></option>' +
                '   <option value=""></option>' +
                '   <option value="delete">삭제</option>' +
                '</select>';
        }

        let columns = [
            {data: '번호', width: '5%'},
            {data: '신청일자', width: '10%'},
            {
                data: '신청목적', width: '15%',
                render: function (data, type, row, meta) {
                    let href;
                    if (data === null) {
                        data = '';
                    } else {
                        href = '<a href="/approval/prev_draft/view/' + row.문서번호 + '/102" target="_blank">' + data + '</a>';
                    }
                    return '<div class="ellipsis" data-toggle="tooltip" data-placement="right" ' +
                        'title="' + data + '">' + href + '</div>';
                }
            },
            {
                data: '신청자', width: '10%',
                render: function (data, type, row, meta) {
                    return '<div class="ellipsis" data-toggle="tooltip" data-placement="right" ' +
                        'title="' + data + '">' + data + '</div>';
                }
            },
            {data: '제출처', width: '10%'},
            {
                data: '진행', width: '10%',
                render: function (data, type, row, meta) {
                    let text = '';
                    if(row.임원 !== null) {
                        text = '<br>' + row.임원 + '<br>' + row.결재일시;
                    }
                    return '<div class="ellipsis" data-toggle="tooltip" data-placement="right" ' +
                        'title="' + data + '">' + data + text + '</div>';
                }
            },
            {
                data: '법인명', width: '5%',
                render: function (data, type, row, meta) {
                    return '<div class="ellipsis">' + data + '</div>';
                }
            },
            {
                data: '문서명', width: '10%',
                render: function (data, type, row, meta) {
                    return '<div class="ellipsis" data-toggle="tooltip" data-placement="right" ' +
                        'title="' + data + ' ' + row.수량 + '">'
                        + data + ' ' + row.수량 + '</div>';
                }
            },
            {
                data: '날인내역', width: '10%',
                render: function (data, type, row, meta) {
                    return (data) ? '<div class="ellipsis">' + data + ' ' + row.날인 + '</div>' : '<div style="width: 100%; background-color: #CCC;">&nbsp;</div>';
                }
            },
/*            {
                width: '10%',
                render: render_file
            },*/
            {
                width: '10%',
                render: render_complete
            },
        ];

        table = $('.my-table').DataTable({
            /*
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            */
            data: aData.dataSet,
            paging: true,
            pageLength: 20,
            lengthMenu: [[10, 25, 50, 100, 200], [10, 25, 50, 100, 200]],
            lengthChange: true,
            searching: true,
            ordering: false,
            // order: [[1, "asc"]],
            info: false,
            // autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json',
            },
            // processing: true,
            columns: columns,
            rowsGroup: [
                0, 1, 2, 3, 4, 5
            ],
        });

        // dataTables 렌더링후 필요없는 부분 삭제
        table.on('draw.dt', function () {
            $('.dataTables_filter').addClass('hidden');
            $('.dataTables_paginate').addClass('hidden-print');
        });

        // dataTables 검색 처리
        (function () {
            $('.box-body .select-gubun').on('change', function () {
                table
                    .columns(8)
                    .search($(this).val())
                    .draw();
            });

            $('.box-body .select-company').on('change', function () {
                let regExSearch = $(this).val() + '$';

                table
                    .columns(6)
                    .search(regExSearch, true, false)
                    .draw();
            });
        })();

        // dataTables 이벤트 처리
        (function () {
            // 첨부파일
            $('.my-table tbody').on('click', 'td button', function () {
                let tr = $(this).closest('tr'),
                    row = table.row(tr),
                    doc_info = row.data();

                let status = 'scrollbars=1,width=550,height=400',
                    href = '/seal_doc/file_upload/' + doc_info.문서번호 + '/' + doc_info.세부번호;
                window.open(href, 'popup', status);
            });

            // 진행/완료
            $('.my-table tbody').on('change', 'td select', function () {
                let tr = $(this).closest('tr'),
                    row = table.row(tr),
                    doc_info = row.data(),
                    value = $(this).find('option:selected').val();

                if (value == "") return;

                $.ajax({
                    async: false,
                    url: '/seal_doc/put_completed',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        document_no: doc_info.문서번호,
                        index: doc_info.세부번호,
                        is_completed: value,
                    },
                    success: function (data, status, xhr) {
                        alert('처리완료');
                        $.fn.rend_table();
                    }
                });
            });
        })();
    };

    $.fn.rend_table();
});