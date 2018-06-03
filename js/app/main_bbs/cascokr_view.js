/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment', 'rating',
    'webSpeech', 'faloading',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

    // 게시판 테이블
    (function () {
        let Customer_voice = function () {
            this.box = $('#box_customer');

            this.data = this.get_data();

            this.init();
            this.initEvent();
        };

        Customer_voice.prototype = {
            init: function () {
                let box = $('#box_customer');
                let data = this.data;

                box.find('.box-header:eq(0) div:eq(0)').text(data.BD_TITLE);

                box.find('.box-body:eq(0) p:eq(0)').text(data.BD_W_NAME);
                box.find('.box-body:eq(0) p:eq(1)').text(data.BD_REG_DATE);
                box.find('.box-body:eq(0) p:eq(2)').text(data.BD_ITEM4);
                box.find('.box-body:eq(0) p:eq(3)').text(data.BD_VIEW_CNT);

                box.find('.box-body:eq(1) .contents').html(data.BD_CONT);

                box.find('.box-body:eq(2) p:eq(0)').text(data.STR_NAME);
                box.find('.box-body:eq(2) p:eq(1)').text(data.BD_ITEM2);
                box.find('.box-body:eq(2) p:eq(2)').text(data.STR_BUSO1 + ' ' + data.STR_BUSO2);

                // 응답시간 출력
                (function () {
                    let aaa = moment(data.BD_REG_DATE);
                    let bbb = moment(data.BD_ITEM2);

                    let diff = bbb.diff(aaa, 'seconds', true);
                    let minutes = parseInt(diff / 60);
                    let seconds = diff % 60;

                    box.find('.box-body:eq(2) p:eq(3) code').text(minutes + '분 ' + seconds + '초');
                })();

                box.find('.box-body:eq(3) .contents').html(data.BD_ITEM3);

                // 사원 이미지
                (function () {
                    let img = '<img class="img-rounded" style="width: 160px; height: 120px; margin-bottom: 1.2em;" />';
                    let photo = box.find('.box-body:eq(3) .photo').html(img);

                    if (data.STR_IMAGE1 !== '') {
                        photo.find('img').attr('src', 'http://idc.cas.co.kr/admincenter/files/memb/' + data.STR_IMAGE1);
                    } else {
                        photo.find('img').attr('src', 'http://renew.globalcas.com/cas_co/images/img3.jpg');
                    }
                })();

                // 첨부파일
                (function () {
                    let attatch = data.ATTATCH;
                    let html = '<p><a target="_blank"><i class="fa fa-file-picture-o"></i> <span></span></a></p>';

                    $.each(attatch, function () {
                        let tmp = $(html).clone();
                        let href = 'http://idc.cas.co.kr/boad/bd_free/2/egofiledown.php?bd=2' +
                            '&ftype=' + this.TYPE + '&fseq=' + this.SEQ + '&key=' + this.SKEY;

                        tmp.find('span').text(this.F_NAME);
                        tmp.find('a').attr('href', href);

                        box.find('.box-body:eq(0) p:eq(4)').append(tmp);
                    });
                })();

                // 평가버튼 생성
                (function () {
                    if (session.user_code === '831001') {
                        $('.fa-star').parent().removeClass('hidden');
                    }

                    $('.fa-bar-chart').parent().removeClass('hidden');
                })();
            },
            initEvent: function () {
                this.button();
            },
            button: function () {
                // 평가창 열기
                this.box.find('.fa-star').parent().on('click', function () {
                    $('.content .row .col-sm-12').removeClass('col-sm-12').addClass('col-sm-8');
                    $('#box_evaluation').removeClass('hidden');
                    window.resizeTo(1024, 600);

                    new Evaluation();
                });

                // 프린트
                this.box.find('.fa-print').parent().on('click', function () {
                    window.print();
                });

                // 통계 버튼
                this.box.find('.fa-bar-chart').parent().on('click', function () {
                    window.open('/casbbs/report');
                });
            },
        };

        Customer_voice.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/casbbs/get_board_contents',
                type: 'get',
                dataType: 'json',
                data: {
                    bd: location.pathname.split('/')[3],
                    seq: location.pathname.split('/')[4],
                    ymd: location.pathname.split('/')[5],
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Customer_voice();
    })();

    // 임원 평가 Box
    let Evaluation = (function () {
        let Evaluation = function () {
            this.box = $('#box_evaluation');

            this.data = this.get_data();

            this.init();
            this.initEvent();
        };

        Evaluation.prototype = {
            init: function () {
                let readonly = (this.data.score) ? true : false;
                $('#box_evaluation select').val(this.data.score);

                $('#box_evaluation select').barrating({
                    theme: 'bars-1to10',
                    readonly: readonly
                });

                // 평가완료시 disabled
                if (session.user_code === this.data.director_user_code) {
                    this.box.find('.fa-pencil').parent().attr('disabled', true);
                }

                this.set_box();
            },
            set_box: function () {
                let data = this.data;

                this.box.find('#speed_score span:eq(1)').text(data.answer_speed_score);
                this.box.find('#speed_score span:eq(0)').text(data.answer_speed_text);
            },
            initEvent: function () {
                this.button();
            },
            button: function () {
                let self = this;

                // 평가 버튼
                this.box.find('.fa-pencil').parent().on('click', function () {
                    self.post_evaluation();
                });

                // 통계 버튼
                this.box.find('.fa-bar-chart').parent().on('click', function () {
                    window.open('/casbbs/report');
                });
            },
        };

        Evaluation.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/casbbs/get_evaluation',
                type: 'get',
                dataType: 'json',
                data: {
                    seq: location.pathname.split('/')[4],
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        Evaluation.prototype.post_evaluation = function () {
            let self = this;
            let score = this.box.find('select[name="rating"]').val() || 0;

            if (score === 0) {
                alert('평가 점수를 선택해 주시기 바랍니다.');
                return;
            }

            $.ajax({
                async: false,
                url: '/casbbs/post_evaluation',
                type: 'post',
                dataType: 'json',
                data: {
                    seq: location.pathname.split('/')[4],
                    score: score,
                },
                success: function () {
                    alert('평가가 완료되었습니다.');
                    self.box.find('.fa-pencil').parent().attr('disabled', true);
                }
            });
        };

        return Evaluation;
    })();

    // 댓글 박스
    (function () {
        let Comment = function () {
            this.box = $('#comment_box');

            this.data = null;

            this.init();
            this.initEvent();
        };

        Comment.prototype = {
            init: function () {
                this.box.find('.direct-chat-msg').not('.hidden').remove();
                this.box.find('textarea').val('');

                this.data = this.get_data();

                this.setList();
                this.buttonEvent();
            },
            initEvent: function () {
                let self = this;
                // 입력
                this.box.find('.btn-primary').on('click', function () {
                    self.post_data();
                    self.init();

                    alert('코멘트가 입력되었습니다.');
                });
            },
            setList: function () {
                let data = this.data,
                    box = this.box,
                    li = box.find('.direct-chat-msg.hidden'),
                    img_path = '/approval/user_draft_hr/hr_s/';

                $.each(data, function () {
                    let clone = li.clone(true);

                    clone.find('.direct-chat-name').text(this.name);
                    clone.find('.direct-chat-timestamp').text(this.writeday);
                    clone.find('.direct-chat-text').html(this.content.replace(/\n/g, '<br>'));
                    clone.find('img').attr('src', img_path + this.user_code + '.jpg');
                    clone.find('img').error(function () {
                        $(this).attr('src', img_path + 'sample.jpg');
                    });

                    clone.removeClass('hidden');

                    if (this.user_code == session.user_code) {
                        clone.find('.direct-chat-info .pull-right').removeClass('hidden');
                    }

                    box.find('.direct-chat-messages').append(clone);
                });
            },
            buttonEvent: function () {
                let self = this,
                    box = this.box,
                    li = box.find('.direct-chat-msg').not('.hidden');

                // 수정
                li.find('.btn:eq(0)').on('click', function () {
                    let index = li.index($(this).closest('.direct-chat-msg'));

                    box.find('textarea').val(self.data[index].content);
                    box.find('textarea').data('cmt_idx', self.data[index].idx);
                    box.find('textarea').focus();
                });

                // 삭제
                li.find('.btn:eq(1)').on('click', function () {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        let index = li.index($(this).closest('.direct-chat-msg'));
                        self.delete_data(self.data[index].idx);
                        self.init();
                    }
                });
            },
        };

        Comment.prototype.get_data = function () {
            let returnData;
            $.ajax({
                async: false,
                url: '/main/get_bbs_comment',
                type: 'get',
                dataType: 'json',
                data: {
                    boardcode: window.location.pathname.split('/')[4],
                    boardidx: 'cas.co.2',
                },
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        Comment.prototype.post_data = function () {
            let self = this;
            let cmt = self.box.find('textarea');

            $.ajax({
                async: false,
                url: '/main/post_custom_voice_comment',
                type: 'post',
                dataType: 'json',
                data: {
                    cmt_idx: cmt.data('cmt_idx'),
                    seq: window.location.pathname.split('/')[4],
                    boardidx: 'cas.co.2',
                    cmt: cmt.val(),
                },
            });
        };

        Comment.prototype.delete_data = function (idx) {
            $.ajax({
                async: false,
                url: '/main/delete_bbs_comment',
                type: 'post',
                dataType: 'json',
                data: {
                    idx: idx,
                },
            });
        };

        new Comment();
    })();

    // 페이지 초기화
    (function () {
        window.resizeTo(800, 600);
        $('.fa-loading-wrapper').remove();
    })();
});


