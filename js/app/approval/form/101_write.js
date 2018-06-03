/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

// todo 해당 파일 전체 복사하여 비교해 가면서 신규 작성 요망

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    'ckeditor', 'jquery-slimscroll', 'faloading', 'datetimepicker'
], function ($, session, orgInfo, myFn, app, select2Search) {
    "use strict";

    // 문서 데이터
    let document_data = null;
    // [개발 참여인원] 라인에 대한 obj 미리 clone
    let $clone = $('.experter:eq(0)').clone();

    let approval_action = location.pathname.split('/')[3],      // 결재 형태
        document_no = location.pathname.split('/')[4];          // 문서 번호

    // 개발 참여인원에 대한 함수 집합
    let fnCalx = {
        init: function (obj) {
            this.obj = obj;
            this.change_name();
            this.initEvent();
        },
        index: 0,
        change_name: function () {
            let obj = this.obj;

            let index = $('.experter').index(obj);
            this.index = index;

            if (index !== 0) {
                obj.find('input[name="개발인력[0][업무내용]"]').attr('name', '개발인력[' + index + '][업무내용]');
                obj.find('select[name="개발인력[0][사번]"]').attr('name', '개발인력[' + index + '][사번]');
                obj.find('input[name="개발인력[0][평균시급]"]').attr('name', '개발인력[' + index + '][평균시급]');
                obj.find('input[name="개발인력[0][참여시간]"]').attr('name', '개발인력[' + index + '][참여시간]');
                obj.find('input[name="개발인력[0][인건비]"]').attr('name', '개발인력[' + index + '][인건비]');
            }
        },
        // 이벤트 초기화
        initEvent: function () {
            let obj = this.obj,
                self = this;
            let that = this;

            obj.find('select[name|="개발인력[' + this.index + '][사번]"]').select2Search({
                option: orgInfo.get_select2_options(),
                placeholder: '팀명 혹은 성명',
                selected: [],
            });

            // 삭제버튼
            obj.find('.btn-danger').on('click', function () {
                if ($('.experter').length !== 1) {
                    $(this).closest('tr').remove();
                    self.total_pay();
                } else {
                    alert('1명 이하입니다.');
                }
            });

            // 평균시급 추출
            obj.find('.select2').on('change', function (e) {
                var self = this;
                $.ajax({
                    url: "/in_trade/ajax_intertrade/user_pay",
                    type: "get",
                    dataType: "json",
                    data: {
                        user_code: $(self).val()
                    },
                    success: function (data, status, xhr) {
                        let pay = Number(data.pay);
                        $(self).closest('tr').find('input[name|="개발인력[' + that.index + '][평균시급]"]')
                            .val(pay.toLocaleString('en'));
                        fnCalx.pay(obj);
                    }
                });
            });

            // 참여시간 변경
            obj.find('input[name|="개발인력[' + this.index + '][참여시간]"]').on('change', function () {
                fnCalx.pay(obj);
            });

            this.pay();
        },
        // 개별 인건비 산출
        pay: function (obj2) {
            let obj = obj2 || this.obj;
            let aa = $(obj).find('input[name|="개발인력[' + this.index + '][평균시급]"]').val();
            let bb = $(obj).find('input[name|="개발인력[' + this.index + '][참여시간]"]').val();

            let 평균시급 = aa.replace(/,/g, ''),
                참여시간 = bb.replace(/,/g, '');

            let 인건비 = Number(평균시급 * 참여시간 / 10000);

            $(obj).find('input[name|="개발인력[' + this.index + '][인건비]"]').val(인건비.toFixed(1).toLocaleString('en'));

            this.total_pay();
        },
        // 총 인건비 산출
        total_pay: function () {
            let td = $('.experter').find('td:eq(5)');
            let 총인건비 = 0;

            $.each(td, function () {
                let aa = parseFloat($(this).find('input').val().replace(/,/g, ''));
                총인건비 += aa;
            });
            총인건비 = (총인건비).toFixed(1);
            $('input[name|="총인건비"]').val(총인건비.toLocaleString('en'));

            this.total();
        },
        // 총투자 합계
        total: function () {
            let 총인건비 = parseFloat($('input[name|="총인건비"]').val().replace(/,|만원/g, '')) || 0,
                직접투자비 = parseFloat($('input[name|="직접투자비"]').val().replace(/,|만원/g, '')) || 0,
                설비투자비 = parseFloat($('input[name|="설비투자비"]').val().replace(/,|만원/g, '')) || 0,
                경비 = parseFloat($('input[name|="경비"]').val().replace(/,|만원/g, '')) || 0,
                합계 = 총인건비 + 직접투자비 + 설비투자비 + 경비;

            $('input[name|="합계"]').val(합계.toLocaleString('en'));
        },
    };

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

    // 양식 처리
    (function () {
        // select2 처리
        let selected_user_code = (document_data.draft_value == null) ? session.user_code : document_data.draft_value.P_M
        $('select[name|="P.M"]').select2Search({
            option: orgInfo.get_select2_options(),
            placeholder: '팀명 혹은 성명',
            selected: [selected_user_code],
        });

        // iCheck 처리
        myFn.default_init.icheck();

        $('input[name|="개발방법"]').on('ifChecked', function (e) {
            if (e.target.value == "위탁개발") {
                $('input[name|="위탁사"]').attr('readonly', false)
                    .attr('required', true);
            } else {
                $('input[name|="위탁사"]').attr('readonly', true)
                    .attr('required', false);
            }
        });

        // datepicker 처리
        $('input[name|="개발시작일"]').datetimepicker({
            format: 'YYYY-MM-DD',
            locale: 'ko',
        });
        $('input[name|="개발종료일"]').datetimepicker({
            format: 'YYYY-MM-DD',
            locale: 'ko',
            useCurrent: false,
        });
        $('input[name|="개발시작일"]').on("dp.change", function (e) {
            $('input[name|="개발종료일"]').data("DateTimePicker").minDate(e.date);
        });
        $('input[name|="개발종료일"]').on("dp.change", function (e) {
            $('input[name|="개발시작일"]').data("DateTimePicker").maxDate(e.date);
        });
    })();

    // 총투자 예상금액 계산
    (function () {
        let $add_button = $('.experter').closest('table').find('.fa-plus-circle').parent();

        // 직접투자비, 설비투자비, 경비에 대한 event 등록
        let aaa = [
            $('input[name|="직접투자비"]'),
            $('input[name|="설비투자비"]'),
            $('input[name|="경비"]')
        ];

        $.each(aaa, function () {
            this.on('change', function () {
                $(this).val(parseFloat($(this).val()).toFixed(1));
                fnCalx.total();
            });
        });

        // 인원 추가
        $add_button.on('click', function () {
            let $clone2 = $clone.clone();

            $('.experter').parent().append($clone2);
            fnCalx.init($clone2);
        });

        fnCalx.init($('.experter:eq(0)'));

        let user_info = '[' + session.dept + '] ' + session.position + ' ' + session.user_name;
        $('input[name|="작성자"]').val(user_info);
    })();

    // 수정시 데이터 바인드 처리
    (function () {
        if (document_data.draft_value !== null) {            // 신규 입력시
            let $P_M_select2 = $('select[name|="P.M"]').select2();
            $P_M_select2.val(document_data.draft_value.P_M).trigger("change");

            let obj = $('input, select');
            $.each(document_data.draft_value, function (key, val) {
                $('input[name|="' + key + '"]:not(:radio)').val(val);
                $('textarea[name|="' + key + '"]').val(val);
            });

            $('input:radio[name="개발유형"]:radio[value="' + document_data.draft_value.개발유형 + '"]').iCheck('check');
            $('input:radio[name="의뢰유형"]:radio[value="' + document_data.draft_value.의뢰유형 + '"]').iCheck('check');
            $('input:radio[name="개발방법"]:radio[value="' + document_data.draft_value.개발방법 + '"]').iCheck('check');

            // 개발 참여인원 추가
            $.each(document_data.draft_value.개발인력, function (i, v) {
                let tr;

                if (i === 0) {
                    tr = $('.experter:eq(0)');
                } else {
                    let $clone2 = $clone.clone();
                    tr = $clone2;

                    $('.experter').parent().append($clone2);
                    fnCalx.init($clone2);
                }

                tr.find('input[name|="개발인력[' + i + '][업무내용]"]').val(v.업무내용);
                tr.find('select[name|="개발인력[' + i + '][사번]"]').val(v.사번).trigger("change");
                tr.find('input[name|="개발인력[' + i + '][평균시급]"]').val(v.평균시급);
                tr.find('input[name|="개발인력[' + i + '][참여시간]"]').val(v.참여시간);
                tr.find('input[name|="개발인력[' + i + '][인건비]"]').val(v.인건비);
            });
        }
    })();

    var data = {
        "작성자": "[경영정보팀] 과장 서정석",
        "개발유형": "변경",
        "개발명": "fdafafasfadsf",
        "P_M": "151036",
        "의뢰유형": "자체",
        "개발시작일": "2017-03-28",
        "개발종료일": "2017-04-29",
        "수익평가년수": "2",
        "과제개요": "fdafdafda",
        "개발목표": "fdafadfaf<br \/>\r\nfdafa<br \/>\r\nfdafdaf",
        "개발인력": [
            {
                "업무내용": "aaa",
                "사번": "131113",
                "평균시급": "125,145",
                "참여시간": "5",
                "인건비": "62.6"
            },
            {
                "업무내용": "bbb",
                "사번": "131079",
                "평균시급": "21,422",
                "참여시간": "10",
                "인건비": "21.4"
            }],
        "총인건비": "84.0",
        "직접투자비": "5.0",
        "설비투자비": "7.0",
        "경비": "6.0",
        "합계": "102",
        "개발방법": "공동개발",
        "위탁사": "",
        "예상판가": "1",
        "부품비": "2",
        "제조원가": "3"
    };
});

