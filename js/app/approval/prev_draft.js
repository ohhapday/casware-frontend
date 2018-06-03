/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 * 해당 결재서류 관련 작업은 프로토 타입이므로 17_insert, 17_view로 Fix시켜서 작업함
 * 추후에 고민 필요
 */

window.requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    'ckeditor', 'jquery-slimscroll', 'faloading',
], function ($, session) {
    'use strict';

    var agent = navigator.userAgent.toLowerCase();

    if ((navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf('msie') != -1)) {
        alert('경영정보팀에서 공지드립니다.' +
            '<br><br>카스웨어는 웹표준을 준수하고자 단계별로 리뉴얼중에 있습니다.' +
            '<br><br>현재 사용중인 브라우저는 비표준인 익스플로러입니다.' +
            '<br><br>표준 브라우저를 이용하여 카스웨어를 사용해 주시기 바랍니다.' +
            '<br>(표준 브라우저 안내: 구글 크롬, 파이어폭스 등)');
    }

    let approval_action = location.pathname.split('/')[3],      // 결재 형태
        document_no = location.pathname.split('/')[4],          // 문서 번호
        form_no = location.pathname.split('/')[5];              // 양식 번호
    let obj_line = null,            // 결재선 obj
        agree_dept = null,          // 합의부서 obj
        agree_line = null,          // 합의라인 obj
        draft_ceo = null;           // 회장님 검토 요청

    let btn_결재선 = $('.btn-group:eq(0) button:eq(0)'),
        btn_의견 = $('.btn-group:eq(0) button:eq(1)'),
        btn_첨부 = $('.btn-group:eq(0) button:eq(2)'),
        btn_저장 = $('.btn-group:eq(0) button:eq(3)'),
        btn_인쇄 = $('.btn-group:eq(0) button:eq(4)');

    let btn_상신 = $('.btn-group:eq(1) button:eq(0)'),
        btn_결재 = $('.btn-group:eq(1) button:eq(1)'),
        btn_보류 = $('.btn-group:eq(1) button:eq(2)'),
        btn_반송 = $('.btn-group:eq(1) button:eq(3)');

    let btn_합의선 = $('.btn-group:eq(2) button:eq(0)'),
        btn_접수 = $('.btn-group:eq(2) button:eq(1)');

    let btn_합의결재 = $('.btn-group:eq(3) button:eq(0)'),
        btn_합의반송 = $('.btn-group:eq(3) button:eq(1)');

    /**
     * 문서 양식 loading
     */
    (function () {
        let html = '/dist/html/approval/form/' + form_no + '_' + approval_action + '.html';        // js파일
        let js = '/dist/js/app/approval/form/' + form_no + '_' + approval_action + '.js';        // js파일

        // html
        $.ajax({
            async: false,
            url: html,
            type: 'get',
            dataType: 'html',
            success: function (data) {
                $('#document_form').html(data);
            }
        });

        // js
        $.ajax({
            async: false,
            url: js,
            dataType: 'script',
        });
    })();

    /**
     * 버튼 이벤트 등록
     */
    (function () {
        //상단 버튼 처리
        btn_결재선.on('click', function () {
            let status = 'scrollbars=1,width=700,height=520';
            window.open('/approval/prev_approval_line/prev_draft_line/' + document_no, 'popup', status);
        });

        btn_의견.on('click', function () {
            let status = 'width=450,height=390,top=' + 1 + ',left=' + (screen.width - 750) / 2 + ',scrollbars=no,toolbar=no,status=no';
            window.open('/approval/draft_opinion_list.html?document_no=4&insert_no=' + document_no, 'popup', status);
        });

        btn_첨부.on('click', function () {
            let status = 'scrollbars=1,width=550,height=400';
            window.open('/approval/prev_file_upload?document_no=4&insert_no=' + document_no, '', status);
        });

        btn_인쇄.on('click', function () {
            $('#document_form').slimScroll({
                height: '100%'
            });

            window.print();
        });

        btn_상신.on('click', function (e) {
            let form = $('form'),
                isValid = null;

            isValid = form[0].checkValidity();
            if (false === isValid) {
                return;
            }

            if (approval_action === 'view') {
                e.preventDefault();
            }

            let status = 'scrollbars=1,width=700,height=650';
            window.open('/approval/prev_approval_line/prev_determine/product/' + document_no, 'popup', status);
        });

        btn_결재.on('click', function () {
            let status = 'scrollbars=1,width=700,height=650';
            let url = '/approval/prev_approval_line/prev_determine/admission/' + document_no;
            window.open(url, 'popup', status);
        });

        btn_보류.on('click', function () {
            let status = 'scrollbars=1,width=700,height=650';
            let url = '/approval/prev_approval_line/prev_determine/holdoff/' + document_no;
            window.open(url, 'popup', status);
        });

        btn_반송.on('click', function () {
            let status = 'scrollbars=1,width=700,height=650';
            let url = '/approval/prev_approval_line/prev_determine/sendback/' + document_no;
            window.open(url, 'popup', status);
        });

        btn_합의선.on('click', function () {
            let status = 'scrollbars=1,width=660,height=430';
            let url = '/approval/new_jubsu_line_select.html?document_no=&insert_no=' + document_no + '&disable=yes';
            window.open(url, 'popup', status);
        });

        btn_접수.on('click', function () {
            let status = 'scrollbars=1,width=430,height=470';
            let url = '/approval/jubsu_success.html?action=jubsu&document_no=&insert_no=' + document_no + '&view_no=' + document_no;
            window.open(url, 'popup', status);
        });

        btn_합의결재.on('click', function () {
            let status = 'scrollbars=1,width=700,height=650';
            let url = '/approval/prev_approval_line/prev_determine/agree/' + document_no;
            window.open(url, 'popup', status);
        });

        btn_합의반송.on('click', function () {
            let status = 'scrollbars=1,width=700,height=650';
            let url = '/approval/prev_approval_line/prev_determine/sendback/' + document_no;
            window.open(url, 'popup', status);
        });

        // 창크기 변경
        window.resizeTo(1000, 800);

        // 로딩 삭제
        $('.fa-loading-wrapper').remove();
    })();

    // 결재선 처리
    ($.get_draft_line = function () {
        $('#draft-line-table').find('tr:eq(1) td').html('');
        $('#draft-line-table').find('tr:eq(2) td').html('');
        $('#draft-line-table').find('tr:eq(3) td').html('');

        $.ajax({
            async: false,
            url: '/approval/prev_draft/get_draft_line',
            type: 'get',
            dataType: 'json',
            data: {
                document_no: document_no
            },
            success: function (data) {
                obj_line = data.draft_line;
                agree_dept = data.agree_dept;
                agree_line = data.agree_line;
                draft_ceo = data.draft_ceo;
            }
        });

        $.each(obj_line, function (i) {
            let sign_img = null,
                img_path = null;

            if (this.draft_status === '1') {
                if (i === 0) {          // 결재 서류 작성자는 본인 사진
                    img_path = '/approval/user_draft_hr/hr_s/' + this.draft_member_no + '.jpg';
                    sign_img = '<img src="' + img_path + '" style="width: 45px; height: 60px;">';

                    $('#draft-line-table').find('tr:eq(2) td:eq(' + this.draft_line_seq + ')').html($(sign_img));
                    $('#draft-line-table').find('tr:eq(2) td:eq(' + this.draft_line_seq + ') img').error(function () {
                        $(this).attr('src', '/approval/user_draft_hr/hr_s/sample.jpg');
                    });
                } else {                // 결재 사인
                    img_path = '/approval/user_draft_sign/' + this.draft_member_no + '.bmp';
                    sign_img = '<img src="' + img_path + '" style="width: 45px; height: 60px;">';

                    $('#draft-line-table').find('tr:eq(2) td:eq(' + this.draft_line_seq + ')').html($(sign_img));
                    $('#draft-line-table').find('tr:eq(2) td:eq(' + this.draft_line_seq + ') img').error(function () {
                        $(this).closest('td').text('결재');
                    });
                }
            }

            $('#draft-line-table').find('tr:eq(1) td:eq(' + this.draft_line_seq + ')').html(this.user_name);
            $('#draft-line-table').find('tr:eq(3) td:eq(' + this.draft_line_seq + ')').html(this.sign_date);
        });

        // 액션에 따른 버튼 생성 / js 처리
        (function (action) {
            if (action === 'write') {
                btn_결재선.removeClass('hidden');
                btn_의견.removeClass('hidden');
                btn_첨부.removeClass('hidden');
                btn_저장.removeClass('hidden');
                btn_상신.removeClass('hidden');
            } else {
                // 결재선에 따른 버튼 생성
                (function () {
                    let index = obj_line.findIndex(function (item) {
                        return item.draft_status === '0';
                    });

                    if (index > -1) {
                        if (obj_line[index].draft_member_no === session.user_code) {
                            btn_첨부.removeClass('hidden');
                            if (index === 0) {           // 상신일 경우
                                btn_상신.removeClass('hidden');
                            } else {
                                btn_결재.removeClass('hidden');
                                // btn_보류.removeClass('hidden');        // 보류기능 삭제
                                btn_반송.removeClass('hidden');
                            }
                        } else {
                            btn_상신.addClass('hidden');
                        }
                    }

                    // 회장님 검토 요청 문서 확인
                    if(draft_ceo !== null) {
                        btn_결재.removeClass('hidden');
                        btn_반송.removeClass('hidden');
                    }
                })();

                // 접수부서일 경우 버튼 생성
                (function () {
                    let index = agree_dept.findIndex(function (item) {
                        return item.user_code === session.user_code;
                    });

                    if (index > -1) {
                        btn_합의선.removeClass('hidden');
                        btn_접수.removeClass('hidden');
                    }
                })();

                // 합의선일 경우 버튼 생성
                (function () {
                    let index = agree_line.findIndex(function (item) {
                        return item.draft_status === '0';
                    });

                    if (index > -1) {
                        if (agree_line[index].user_code === session.user_code) {
                            btn_합의결재.removeClass('hidden');
                            btn_합의반송.removeClass('hidden');
                        }
                    }
                })();
            }
        })(approval_action);

        // 작성자 본인의 결재 [완료]시에 view 페이지로 변경
        try {
            if (approval_action === 'write' && obj_line[0].draft_status === '1') {
                $(location).attr('href', '/approval/prev_draft/view/' + document_no + '/' + form_no);
            }
        } catch (e) {
            window.console.log(e);
        }
    })();


    // 첨부파일 loading
    ($.get_doc_files = function () {
        let doc_files = null;
        let html = '<div><a><div class="col-sm-8"><i class="fa fa-text-o"></i> <span></span></div></a>' +
            '<div class="col-sm-4 text-right"></div></div>';
        let ext = {
            word: ['doc', 'docx'],
            powerpoint: ['ppt', 'pptx'],
            excel: ['xls', 'xlsx', 'csv'],
            archive: ['zip', 'rar'],
            picture: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'psd'],
            video: ['mp4', 'wmv', 'avi'],
            pdf: ['pdf'],
            text: ['hwp', 'txt'],
        };

        $.ajax({
            async: false,
            url: '/approval/prev_draft/get_doc_files',
            type: 'get',
            dataType: 'json',
            data: {
                document_no: document_no
            },
            success: function (data) {
                doc_files = data;
            }
        });

        function fn_ext(filename) {
            let extention = filename.split('.').pop().toLowerCase();
            let returnData = null;
            $.each(ext, function (key, value) {
                if ($.inArray(extention, value) > -1) {
                    returnData = key;
                    return;
                }
            });
            return returnData;
        }

        $('#doc_files').find('div').remove();

        $.each(doc_files, function () {
            let file_size = ' (' + (this.file_info.size / 1000).toFixed(1).toLocaleString('en') + ' Kbyte)',
                $tr = $(html),
                aa = fn_ext(this.file_name) || 'text',
                awesome = 'fa-file-' + aa + '-o';

            $tr.find('.fa-text-o').removeClass('fa-text-o').addClass(awesome);
            $tr.find('a').attr('href', '/approval/prev_draft/download_doc_files/' + this.no);
            $tr.find('.col-sm-8 span').text(this.file_name);
            $tr.find('.col-sm-4').text(file_size);
            $('#doc_files').append($tr);
        });
    })();

});

