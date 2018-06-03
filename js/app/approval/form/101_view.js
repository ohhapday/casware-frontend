/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    'ckeditor', 'jquery-slimscroll', 'faloading',
], function ($, session, orgInfo, myFn, app, select2Search) {
    "use strict";

    // 문서 데이터
    let document_data = null;
    // [개발 참여인원] 라인에 대한 obj 미리 clone
    let $clone = $('.experter:eq(0)').clone();

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
                document_data = data;
            }
        })
    })();

    // 데이터 바인드 처리
    (function () {
        if (document_data !== null) {
            $.each(document_data.draft_value, function (key, val) {
                let div = $('.' + key);
                div.html(val);
            });

            $('.관리번호').html(document_data.document_number);
            $('.P_M').html(document_data.draft_value.P_M.성명);
            $('.개발기간').html(document_data.draft_value.개발시작일 + ' ~ ' + document_data.draft_value.개발종료일);
            if(document_data.draft_value.개발방법==="위탁개발") {
                $('.위탁사').parent().removeClass('hidden');
            }

            // 개발 참여인원 추가
            $.each(document_data.draft_value.개발인력, function (i, v) {
                let tr;

                if (i === 0) {
                    tr = $('.experter:eq(0)');
                } else {
                    let $clone2 = $clone.clone();
                    tr = $clone2;

                    $('.experter').parent().append($clone2);
                }

                tr.find('td:eq(0) div').text(v.업무내용);
                tr.find('td:eq(1) div').text(v.성명);
                tr.find('td:eq(2) div').text(v.평균시급.toLocaleString('en'));
                tr.find('td:eq(3) div').text(v.참여시간.toLocaleString('en'));
                tr.find('td:eq(4) div').text(v.인건비.toLocaleString('en'));
            });
        } else {
            alert("문서정보가 존재하지 않습니다.", "close");
        }
    })();
});

