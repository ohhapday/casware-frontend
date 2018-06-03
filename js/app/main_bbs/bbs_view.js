/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'webSpeech',
    'jquery-slimscroll', 'faloading',
//    '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',       // 구글 번역
], function ($, session, myFn, app, moment) {
    'use strict';

    let ajax_data,
        idx = location.pathname.split('/')[3];          // 문서 번호;

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

    // ajax Data
    (function () {
        $.ajax({
            async: false,
            url: '/main/get_bbs_contents',
            type: 'get',
            dataType: 'json',
            data: {
                idx: idx,
            },
            success: function (data, status, xhr) {
                ajax_data = data;
                if(data.contents.rec_del === '1') {
                    alert('삭제된 컨텐츠입니다.', 'close');
                    return;
                }
            }
        });
    })();

    // 컨텐츠 처리
    (function () {
        let $user = $('.user-panel'),
            $con = $user.find('div.control-label'),
            contents = ajax_data.contents,
            img_path = '/approval/user_draft_hr/hr_s/';

        $user.find('img').attr('src', img_path + contents.userid + '.jpg');
        $user.find('img').error(function () {
            $(this).attr('src', img_path + 'sample.jpg');
        });

        $('#contents_title div').eq(0).text(contents.title);

        $con.eq(0).find('.text-left').text(contents.name);
        $con.eq(1).find('.text-left').text(contents.org);
        $con.eq(2).find('.text-left').text(contents.writeday);
        $con.eq(3).find('.text-left').text(contents.readnum);

        $('#contents').html(contents.content);
    })();

    // 첨부파일 처리
    (function () {
        let $att_file = $('.row:eq(0)').find('.box-footer:eq(0) .control-label:eq(1)'),
            html = '<div><a href=""></a></div>';

        $.each(ajax_data.contents.upfile, function (i) {
            if (this.file_name !== '') {
                let href = '/popup/file_down.php?',
                    ext = this.file_name.slice(this.file_name.lastIndexOf('.') + 1),
                    path = 'dn_path=' + '../upload/main/filename' + i + '/' + ajax_data.contents.send_time + '.' + ext,
                    f_name = '&f_name=' + encodeURI(this.file_name),
                    $clone = $(html).clone();
                let aa = href + path + f_name;

                $clone.find('a').attr('href', aa).text(this.file_name);
                $att_file.append($clone);
            }
        });
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
                    idx: window.location.pathname.split('/')[3],
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
                url: '/main/post_bbs_comment',
                type: 'post',
                dataType: 'json',
                data: {
                    idx: window.location.pathname.split('/')[3],
                    cmt_idx: cmt.data('cmt_idx'),
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

    // 버튼 처리
    (function () {
        // 프린트
        $('#btn_print').on('click', function () {
            window.print();
        });

        // 닫기
        $('#btn_close').on('click', function () {
            window.close();
        });

        // 수정
        $('#btn_modify').on('click', function () {
            $(location).attr('href', '/popup/bbs_edit.php?idx=' + idx);
        });

        // 삭제
        $('#btn_delete').on('click', function () {
            if (confirm('삭제하시겠습니까?')) {
                $.ajax({
                    async: false,
                    url: '/main/delete_bbs_contents',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        idx: idx,
                    },
                    success: function (data, status, xhr) {
                        alert('삭제되었습니다.', 'close');
                    }
                });
            }
        });
    })();

    // 마무리 처리
    (function () {
        if (ajax_data.contents.userid === session.user_code) {
            $('.btn-group.pull-left').removeClass('hidden');
        }
    })();
});

