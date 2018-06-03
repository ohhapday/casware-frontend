/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    'ckeditor', 'jquery-slimscroll', 'faloading', 'datetimepicker'
], function ($, session, orgInfo, myFn, app, select2Search) {
    "use strict";

    // 문서 데이터
    let doc_data = null;

    let approval_action = location.pathname.split('/')[3],      // 결재 형태
        document_no = location.pathname.split('/')[4];          // 문서 번호

    // 문서 신청서 처리
    var apply = (function () {
        let tr_add_table = $('.my-table:eq(3)');

        // 라인 삭제 버튼 처리
        (function () {
            $('.fa-minus-square').parent().on('click', function () {
                if (tr_add_table.find('tbody tr').length !== 1) {
                    $(this).closest('tr').remove();
                } else {
                    alert('삭제할 수 없습니다.');
                }
            });
        })();

        // 날인 입력칸 활성화
        (function () {
            $('select[name*="[문서명]"]').on('change', function () {
                let gubun = $(this).find('option:selected').parent().attr('label');
                let $tr = $(this).closest('tr');
                if (gubun === "문서 신청") {
                    $tr.find('input[name*="[날인]"]').attr('disabled', true);
                    $tr.find('select[name*="[날인내역]"]').attr('disabled', true);
                    $tr.find('input[name*="[날인]"]').attr('required', false);
                    $tr.find('select[name*="[날인내역]"]').attr('required', false);
                } else {
                    $tr.find('input[name*="[날인]"]').attr('disabled', false);
                    $tr.find('select[name*="[날인내역]"]').attr('disabled', false);
                    $tr.find('input[name*="[날인]"]').attr('required', true);
                    $tr.find('select[name*="[날인내역]"]').attr('required', true);

                    alert('신청하실 사용인감계는 반드시 첨부하시기 바랍니다.');
                }
            });
        })();

        /**
         * tr 추가 함수
         * @param obj (Clone된 tr)
         * @returns {*}
         */
        function tr_add(obj) {
            let input = obj.find('select, input')
            $.each(input, function () {
                let obj_name = $(this).attr('name'),
                    first_pos = obj_name.indexOf('['),
                    last_pos = obj_name.indexOf(']'),
                    index = tr_add_table.find('tbody tr').length;

                let text = obj_name.substring(0, first_pos + 1) + index + obj_name.substring(last_pos);
                $(this).attr('name', text);
            });
            return obj;
        }

        // 라인 추가 버튼 처리
        (function () {
            let $clone = tr_add_table.find('tbody tr:eq(0)').clone(true);
            $('.fa-plus-circle').parent().on('click', function () {
                $clone = tr_add($clone);
                tr_add_table.find('tbody').append($clone.clone(true));
            });
        })();

        return {
            tr_add_table: tr_add_table,
            tr_add: tr_add,
        }
    })();

    // get 문서 데이터
    (function () {
        $.ajax({
            async: false,
            url: "/approval/prev_draft/get_document_data",
            type: "get",
            dataType: "json",
            data: {
                document_no: document_no
            },
            success: function (data, status, xhr) {
                doc_data = data;
            }
        })
    })();

    // 수정시 데이터 바인드 처리
    (function () {
        let $base_table = $('.my-table:eq(2)');

        let document_number = doc_data.document_number,
            draft_date = doc_data.draft_date,
            user_name,
            dept_name;

        if (typeof(doc_data.draft_user_code) !== 'undefined') {
            // let user_info = orgInfo.get_user_name(doc_data.draft_user_code);
            user_name = doc_data.user_name;
            dept_name = doc_data.dept_name;
        }

        $base_table.find('tbody td:eq(1)').text(document_number);
        $base_table.find('tbody td:eq(3)').text(draft_date);
        $base_table.find('tbody td:eq(5)').text(dept_name);
        $base_table.find('tbody td:eq(7)').text(user_name);

        if (doc_data.draft_value !== null) {
            $('input[name="제출처"]').val(doc_data.draft_value.제출처);
            $('input[name="신청목적"]').val(doc_data.draft_value.신청목적);
            $('textarea[name="사용용도"]').val(doc_data.draft_value.사용용도);

            // 신청문서 Bind
            $.each(doc_data.draft_value.신청문서, function (i, v) {
                let tr_add_table = apply.tr_add_table;
                let $clone = tr_add_table.find('tbody tr:eq(0)').clone(true);
                let $tr = null;

                if (i !== 0) {
                    $clone = apply.tr_add($clone);
                    tr_add_table.find('tbody').append($clone.clone(true));
                }

                $tr = tr_add_table.find('tbody tr:eq(' + i + ')');

                $tr.find('select[name*="법인명"]').val(this.법인명);
                $tr.find('select[name*="문서명"]').val(this.문서명);
                $tr.find('input[name*="수량"]').val(this.수량);

                if (this.날인내역) {
                    $tr.find('input[name*="날인"]').val(this.날인);
                    $tr.find('input[name*="[날인]"]').attr('required', true);
                    $tr.find('input[name*="[날인]"]').attr('disabled', false);

                    $tr.find('select[name*="날인내역"]').val(this.날인내역);
                    $tr.find('select[name*="[날인내역]"]').attr('required', true);
                    $tr.find('select[name*="[날인내역]"]').attr('disabled', false);
                }
            });
        }
    })();
});

