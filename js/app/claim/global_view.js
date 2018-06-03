/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment', 'webSpeech',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    (function () {
        $.ajax({
            async: true,
            type: 'GET',
            url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
            dataType: 'script',
            timeout: 1000,
        });
    })();

    let defaults = {
        YMD: window.location.pathname.split('/')[3] || null,
        NAT_GUB: window.location.pathname.split('/')[4] || null,
        SER_NO: window.location.pathname.split('/')[5] || null,
    };

    (function () {
        let Report = function () {
            this.options = Object.assign({}, defaults);
            this.data = this.get_data();

            this.init();
            this.initEvent();
        };

        Report.prototype = {
            init: function () {
                this.setContents();
            },
            initEvent: function () {
                $('#btn_print').on('click', function () {
                    window.print();
                });

                $('#btn_close').on('click', function () {
                    window.close();
                });
            },
            setContents: function () {
                $('.gubun .row:eq(0) p:eq(0)').text(this.data.NATNM);
                $('.gubun .row:eq(0) p:eq(1)').text(this.data.YMD);

                $('.gubun .row:eq(1) p:eq(0)').text(this.data.JPMNAM);
                $('.gubun .row:eq(1) p:eq(1)').text(this.data.OCC);

                $('.gubun .row:eq(2) p:eq(0)').text(this.data.SITENM);
                $('.gubun .row:eq(2) p:eq(1)').text(this.data.PRM_CNT + '(' + this.data.TOTAL_CNT + ')');

                // 관련사진 및 시리얼번호
                this.setImage();

                if (this.data.PRM !== null) {
                    $('.content .jubsu div').html(this.data.PRM.replace(/\n/g, '<br />'));
                    $('.content .jubsu').removeClass('hidden');
                }

                if (this.data.FILE_NAME1 !== null) {
                    let attach = '<a href="http://210.108.178.71/BizPortal/resources/test/CLAIM/'
                        + this.data.FILE_PATH1 + '">' + this.data.FILE_NAME1 + '</a>';
                    $('.content .jubsu div').after('<div>' + attach + '</div>');
                }

                if (this.data.FILE_NAME2 !== null) {
                    let attach = '<a href="http://210.108.178.71/BizPortal/resources/test/CLAIM/'
                        + this.data.FILE_PATH2 + '">' + this.data.FILE_NAME2 + '</a>';
                    $('.content .jubsu div').after('<div>' + attach + '</div>');
                }

                if (this.data.CONDI !== null) {
                    $('.content .accident div').html(this.data.CONDI.replace(/\n/g, '<br />'));
                    $('.content .accident').removeClass('hidden');
                }

                if (this.data.REL !== null) {
                    $('.content .measures div').html(this.data.REL.replace(/\n/g, '<br />'));
                    $('.content .measures').removeClass('hidden');
                }

                if (this.data.REQ !== null) {
                    $('.content .demand div').html(this.data.REQ.replace(/\n/g, '<br />'));
                    $('.content .demand').removeClass('hidden');
                }
            },
            // 사진 및 시리얼 번호
            setImage: function () {
                let base_path = 'http://210.108.178.71/BizPortal/resources/test/CLAIM/';
                let thumb_path = 'http://210.108.178.71/BizPortal/resources/test/CLAIM/';
                let serial_no = '';

                $.each(this.data.photo, function () {
                    if (this.FILE_PATH1 !== null) {
                        let thumb_img = this.FILE_PATH1.substr(0, this.FILE_PATH1.indexOf('.')) + '.png';
                        let img_path = thumb_path + 'thumb_' + thumb_img;

                        $('.content .photo div:eq(0)').append('<div><img src="' + img_path + '" /></div>');
                        $('.content .photo').removeClass('hidden');
                    }

                    if (this.GI_NO !== null) {
                        serial_no += this.GI_NO + ', ';
                    }
                });

                if (serial_no !== '') {
                    $('.content .serial div:eq(0)').text(serial_no);
                    $('.content .serial').removeClass('hidden');
                }
            },
            // 사진 클릭시 실제 크기로 확대
            clickImage: function () {

            },
        };

        Report.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/claim/get_data',
                type: 'get',
                dataType: 'json',
                data: {
                    YMD: this.options.YMD,
                    NAT_GUB: this.options.NAT_GUB,
                    SER_NO: this.options.SER_NO,
                },
                success: function (data) {
                    returnData = data;
                }
            });

            return returnData;
        };

        new Report();
    })();

    // 댓글 박스
    (function () {
        let Comment = function () {
            this.BCODE = 'clatb210';            //게시판 구분 코드 8자리 (Oracle : 오라클 table명)

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

                    if (this.user_code === session.user_code) {
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
                    boardcode: defaults.YMD + defaults.NAT_GUB + defaults.SER_NO,
                    boardidx: this.BCODE,
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
                url: '/main/post_claim_comment',
                type: 'post',
                dataType: 'json',
                data: {
                    cmt_idx: cmt.data('cmt_idx'),
                    boardcode: defaults.YMD + defaults.NAT_GUB + defaults.SER_NO,
                    boardidx: this.BCODE,
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
});


