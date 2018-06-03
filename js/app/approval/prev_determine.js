/* eslint-disable no-undef */
/**
 * Created by 서정석 on 2016/12/08.
 * 결재 처리
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app',
    'jquery-slimscroll', 'faloading'
], function ($, session, orgInfo, myFn, app, slimscroll) {
    "use strict";

    var obj_line = null,            // 결재선 obj
        obj_opinion = null,         // 의견 obj

        approval_action = location.pathname.split('/')[4],      // 결재 형태
        document_no = location.pathname.split('/')[5];          // 문서 번호

    // 페이지에 필요한 기초 데이터 처리
    (function () {
        function check_line(obj_line) {
            var status = false;
            $.each(obj_line, function () {
                if (session.user_code === this.user_code) {
                    if (this.draft_status === 1) {
                        alert('이미 결재가 된 문서입니다.');
                    }
                    status = true;
                }
            });

            // 회장님 검토 요청때문에 예외처리
            if (session.user_code === '831001' && status === false) {
                approval_action = 'ceo_check';
                status = true;
            }
            if (status === false) {
                alert('결재선에 포함되어 있지 않습니다.', 'close');
            }
        }

        $.ajax({
            async: false,
            url: '/approval/prev_approval_line/get_prev_determine',
            type: 'get',
            dataType: 'json',
            data: {
                document_no: document_no,
            },
            success: function (data, status, xhr) {
                obj_line = data.approval_line;
                obj_opinion = data.opinion;
                // 결재 여부 확인
                check_line(obj_line);
            }
        });

        if (obj_line === null) {
            alert('결재선이 존재하지 않습니다. <br> 확인해 보시기 바랍니다.', 'close');
            return;
        }
    }());


    // 결재선 처리 부분
    (function () {
        var $approval = $('.div-line');                             // 결재선 확인 table
        $.each(obj_line, function () {
            let str = (this.draft_status == '1') ? '결재' : '대기';
            let datetime = (this.sign_date != '0') ? this.sign_date : '대기';
            $approval.find('table tbody').append(' \
                <tr> \
                    <td>' + (parseInt(this.draft_line_seq) + 1) + '</td> \
                    <td>' + orgInfo.key_value[this.user_code] + '</td> \
                    <td>' + str + '</td> \
                    <td>' + datetime + '</td> \
                </tr> \
            ');

            if (this.user_code === session.user_code) {
                $approval.find('table tbody tr:last-child')
                    .css('background-color', '#0a96dc')
                    .css('color', '#FFFFFF');
            }
        });
    }());

    // 의견 처리 부분
    (function () {
        var $opinion = $('.div-opinion');                           // 의견 div

        // 생성 함수
        function opinion_insert(obj) {
            let img = '/approval/user_draft_hr/hr_s/' + obj.user_code + '.jpg';

            obj.content = obj.content.replace(/\n/g, "<br>");       // 행바꿈 변경
            $opinion.find('.chat').prepend(' \
                <div class="item"> \
                    <img src="' + img + '" alt="user image" class="online"> \
                    <p class="message"> \
                        <a class="name"> \
                            <small class="text-muted pull-right"><i class="fa fa-clock-o"></i> ' + obj.sign_date + '</small> \
                            ' + orgInfo.key_value[obj.user_code] + ' \
                            <button type="button" class="btn btn-xs btn-danger hidden" data-no="' + obj.no + '"> \
                                삭제 \
                            </button> \
                        </a> \
                        ' + obj.content + ' \
                    </p> \
                </div> \
            ');
            if (session.user_code === obj.user_code) {                // 삭제 버튼
                var $button = $opinion.find('.chat .item:first-child').find('button');
                $button.removeClass('hidden');
                opinion_delete($button);
            }
        };

        // 삭제 함수
        function opinion_delete(obj) {
            obj.on('click', function () {
                $.ajax({
                    async: false,
                    url: "/approval/prev_approval_line/delete_prev_opinion",
                    type: "post",
                    dataType: "json",
                    data: {
                        no: obj.data('no'),
                    },
                    success: function (data, status, xhr) {
                        if (data.status === true) {
                            obj.closest('.item').fadeOut(1000);
                            obj.closest('.item').remove();
                        }
                        alert(data.message);
                    }
                });
                opinion_size();
            });
        }

        // 의견 Box 사이즈 조절 및 개수 변경
        function opinion_size() {
            var obj_length = $('.slimScroll .item').length;
            var height = (obj_length > 0) ? '150px' : '0px';

            $('.slimScroll').slimScroll({
                height: height
            });

            var h4 = $opinion.parents('.box').find('h4');
            var documentFragment = $(document.createDocumentFragment());
            var span = $('' +
                '<span class="bg-orange" ' +
                '   style=" margin-left: 10px; padding: 0px 10px; background-color: #666411; color: #FFFFFF; border-radius: 15px;">' +
                '</span>');
            span.text('총 ' + obj_length + ' 건의 의견이 있습니다');
            documentFragment.append(span);

            h4.find('span').not(':eq(0)').remove();
            h4.append(documentFragment);
        }

        // 초기 생성
        $.each(obj_opinion, function (index) {
            let obj = {
                no: this.no,
                user_code: this.user_code,
                sign_date: this.sign_date,
                content: this.content,
            }
            opinion_insert(obj);
        });

        // 의견 입력 이벤트
        $opinion.find('.box-footer button').on('click', function () {
            let $textarea = $(this).parents('.input-group').children('textarea');

            $.ajax({
                async: false,
                url: "/approval/prev_approval_line/post_prev_opinion",
                type: "post",
                dataType: "json",
                data: {
                    document_no: document_no,
                    content: $textarea.val(),
                    mail_send: $('input[name|="send_able"]').is(':checked'),
                },
                success: function (data, status, xhr) {
                    let obj = {
                        no: data.no,
                        user_code: session.user_code,
                        sign_date: data.date,
                        content: $textarea.val(),
                    }
                    opinion_insert(obj);
                    alert('의견이 등록되었습니다.');
                    $textarea.val('')
                }
            });
            opinion_size();
        });

        opinion_size();
    }());

    /**
     * 하단 버튼 처리(결재: 1, 반송: 2, 보류: 3)
     */
    (function () {
        let $button = $('.div-button');                              // 버튼 영역
        let buttons = $button.find('button:not(.btn-default)');
        let password = $button.find('input');
        let btn_close = $button.find('.btn-default');

        $.each(buttons, function () {
            if ($(this).data('gubun') === approval_action) {
                $(this).removeClass('hidden');
            }
        });

        // 재무이사(전종일 상무) 회장님 결재 버튼 생성
        if(approval_action === 'ceo_check') {
            $('button[data-gubun="admission"]').removeClass('hidden');
        }

        // 재무이사(전종일 상무) 회장님 검토 버튼 생성
        if (session.user_code === '091022') {
            let index = Array.prototype.findIndex.call(obj_line, function (item) {
                return item.user_code === '091022';
            });

            if (obj_line[index].req_date === null) {
                $('button[data-gubun="check"]').removeClass('hidden');
            } else {
                if (obj_line[index].ceo_check === '1') {
                    $('input[type="password"]')
                        .attr('placeholder', obj_line[index].ceo_check_date + ' 회장님 검토 완료되었습니다.');
                } else {
                    $('button[data-gubun="admission"], button[data-gubun="agree"]').attr('disabled', true);
                    $('input[type="password"]')
                        .attr('placeholder', obj_line[index].req_date + ' 회장님께 검토요청한 사항입니다.');
                }
            }
        }

        function submit_password(e) {
            let form = $('form'),
                isValid = null,
                btn = e.toElement,
                action;

            isValid = form[0].checkValidity();
            if (isValid === false) {
                return;
            }
            e.preventDefault();

            // 회장님 검토 요청
            if ($(btn).data('gubun') === 'check') {
                action = 'check';
            } else {
                action = approval_action;
            }

            $.ajax({
                async: false,
                url: '/approval/prev_approval_line/post_prev_approval',
                type: 'post',
                dataType: 'json',
                data: {
                    approval_action: action,
                    document_no: document_no,
                    password: password.val(),
                },
                success: function (data, status, xhr) {
                    submit_approval(data);
                }
            });
        }

        /**
         * 결재 내역에 따라 다른 처리
         * @param data
         */
        function submit_approval(data) {
            password.val('');
            switch (data.status) {
                case 'opener_submit':       // 상신 처리
                    alert(data.message, 'close');
                    if (typeof opener.$ !== 'undefined') {     // todo 걷어내야할 곳
                        opener.$.get_draft_line();
                    } else {
                        opener.frames['iframe_main'].draft_document_form.submit();
                    }
                    break;
                case 'fail':
                    alert(data.message);
                    break;
                default:
                    alert(data.message, 'close');
                    opener.window.close();
                    if (opener.opener.location.pathname !== '/main') {
                        opener.opener.location.href = '/approval/draft.html?draft_id=1';
                    }
                    break;
            }
        }

        buttons.on('click', function (e) {
            submit_password(e);
        });

        // textbox 엔터 처리
        buttons.parent().prev().on('keydown', function (key) {
            if (key.keyCode == 13) {
                this.blur();
                if ($('button[data-gubun="admission"]').attr('disabled') !== 'disabled') {
                    submit_password(key);
                } else {
                    alert('회장님 검토 전 입니다.');
                }
            }
        });

        // 임원의 경우 의견 발송 버튼
        if (session.post_code <= '12') {
            $('input[name|="send_able"]').iCheck('check');
            $('.box-warning .box-footer .col-sm-4').removeClass('hidden');
        }

        btn_close.on('click', function () {
            window.close();
        });

        // 로딩 삭제
        $(".fa-loading-wrapper").remove();
    }());
});

