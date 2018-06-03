/* eslint-disable no-undef,no-unused-vars */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 comment
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'webSpeech',
    'jquery-slimscroll', 'faloading',
], function ($, session, myFn, app, moment) {
    'use strict';

    let defaults = {
        bbs_idx: window.location.pathname.split('/')[3],
        idx: window.location.pathname.split('/')[4] || null,
    };

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

            this.data = Object.assign([], this.get_data());

            this.setList();
        },
        initEvent: function () {
            let self = this;
            // 입력
            this.box.find('.btn-primary').on('click', function () {
                self.post_data();
                self.init();

                alert('코멘트가 입력되었습니다.');
            });

            this.buttonEvent();
        },
        setList: function () {
            let data = this.data,
                box = this.box,
                li = box.find('.direct-chat-msg.hidden'),
                img_path = '/approval/user_draft_hr/hr_s/';

            $.each(data, function () {
                let clone = li.clone(true);

                clone.find('.direct-chat-name').text(this.user_name);
                clone.find('.direct-chat-timestamp').text(this.insert_time);
                clone.find('.direct-chat-text').html(this.comment.replace(/\n/g, '<br>'));
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

                box.find('textarea').val(self.data[index].comment);
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
        let returnData = null;
        $.ajax({
            async: false,
            url: '/comment/get_bbs_comment',
            type: 'get',
            dataType: 'json',
            data: {
                bbs_idx: defaults.bbs_idx,
                art_idx: defaults.idx,
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
            url: '/comment/post_bbs_comment',
            type: 'post',
            dataType: 'json',
            data: {
                cmt_idx: cmt.data('cmt_idx'),
                bbs_idx: defaults.bbs_idx,
                art_idx: defaults.idx,
                comment: cmt.val(),
            },
            success: function (data) {
                cmt.data('cmt_idx', '');
            },
        });
    };

    Comment.prototype.delete_data = function (idx) {
        $.ajax({
            async: false,
            url: '/comment/delete_bbs_comment',
            type: 'post',
            dataType: 'json',
            data: {
                cmt_idx: idx,
            },
        });
    };

    new Comment();
});

