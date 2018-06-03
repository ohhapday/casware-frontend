/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    '/dist/js/app/approval/jubsu_line.js',
    'ckeditor', 'jquery-slimscroll', 'faloading', 'datetimepicker'
], function ($, session, orgInfo, myFn, app, select2Search,
             Jubsu_line) {
    "use strict";

    // 문서 데이터
    let doc_data = null;

    let approval_action = location.pathname.split('/')[3],      // 결재 형태
        document_no = location.pathname.split('/')[4];          // 문서 번호

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

    // 데이터 바인드 처리
    (function () {
        if (typeof(doc_data) === 'object') {
            let $base_table = $('.my-table:eq(2)');
            let $apply_table = $('.my-table:eq(3)');

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

            $('.제출처').text(doc_data.draft_value.제출처);
            $('.신청목적').text(doc_data.draft_value.신청목적);
            $('.사용용도').html(doc_data.draft_value.사용용도);

            $.each(doc_data.draft_value.신청문서, function (i) {
                let $clone = $apply_table.find('tbody tr:eq(0)').clone(true);
                if (i !== 0) {
                    $apply_table.find('tbody').append($clone.clone(true));
                }

                let $tr = $apply_table.find('tbody tr:eq(' + i + ')');

                $tr.find('.법인명').text(this.법인명);
                $tr.find('.문서명').text(this.문서명);
                $tr.find('.수량').text(this.수량);

                if (this.날인내역 !== undefined) {
                    $tr.find('.날인').text(this.날인);
                    $tr.find('.날인내역').text(this.날인내역);

                    $tr.find('.날인').parent().css('background-color', '#FFFFFF');
                    $tr.find('.날인내역').parent().css('background-color', '#FFFFFF');
                } else {
                    $tr.find('.날인').text('-');
                    $tr.find('.날인내역').text('-');

                    $tr.find('.날인').parent().css('background-color', 'grey');
                    $tr.find('.날인내역').parent().css('background-color', 'grey');
                }
            });
        }
    })();

    // 접수라인 추가
    (function () {
        let aa = new Jubsu_line(document_no);

        $('.사용용도').append(aa.html);
    })();
});

