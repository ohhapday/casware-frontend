/* eslint-disable no-undef */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 comment
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'webSpeech',
], function ($, session, myFn, app, moment) {
    'use strict';

    const html = `
        <div class="row hidden-print">
            <div class="col-sm-12">
                <div class="box box-warning direct-chat direct-chat-primary" id="comment_box">
                    <div class="box-header with-border">
                        <h3 class="box-title">코멘트</h3>
                    </div>
                    <!-- /.box-header -->
                    <div class="box-body">

                        <div class="input-group" style="margin-left: 5px; margin-right: 5px;">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-default btn-lg btn-circle">
                                    <i class="fa fa-microphone"></i>
                                </button>
                            </div>
                            <textarea class="form-control" placeholder="메세지를 입력해주세요."
                                      style="height:55px; width: 100%;"></textarea>
                            <div class="input-group-btn" style="vertical-align: top;">
                                <button type="button" class="btn btn-primary btn-input"> 입력
                                </button>
                            </div>
                        </div>


                        <div class="direct-chat-messages" style="height: 100%;">
                            <div class="direct-chat-msg hidden">
                                <div class="direct-chat-info clearfix">
                                    <span class="direct-chat-name pull-left">서정석</span>
                                    <span class="direct-chat-timestamp pull-right">2017-02-06 09:52</span>
                                    <span class="pull-right hidden">
                                        <div class="timeline-footer" style="margin-right: 10px;">
                                            <button class="btn btn-success btn-xs btn-modify">Modify</button>
                                            <button class="btn btn-danger btn-xs btn-delete">Delete</button>
                                        </div>
                                    </span>
                                </div>
                                <div class="pull-left image">
                                    <img src="" class="img-rounded" alt="User Image" style="width: 60px"/>
                                </div>
                                <div class="direct-chat-text" style="margin-left: 80px">
                                    업무진행내역 작성시 항목별 기간 및 진척률 반영하여 재 작성바랍니다.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">

                    </div>
                </div>
            </div>
        </div>    
    `;

    return (function () {
        let Comment = function (options) {
            this.options = Object.assign({
                art_idx: 0,
                bbs_idx: 0,
                obj: null
            }, options);

            this.init();
            this.initEvent();
        };

        Comment.prototype = {
            init() {
                $(this.options.obj).append(html);
                this.setList();
            },
            initEvent() {
                this.btnEvent();
            },
            setList() {
                let self = this;

                this.getData().then(function (data) {
                    let box = $('#comment_box'),
                        li = box.find('.direct-chat-msg.hidden'),
                        img_path = '/approval/user_draft_hr/hr_s/';

                    box.find('.direct-chat-msg').not('.hidden').remove();
                    box.find('textarea').val('');

                    self.data = Object.assign([], data);
                    self.data.forEach(function (v, i) {
                        let clone = li.clone(true);

                        clone.find('.direct-chat-name').text(v.user_name);
                        clone.find('.direct-chat-timestamp').text(v.insert_time);
                        clone.find('.direct-chat-text').html(v.comment.replace(/\n/g, '<br>'));
                        clone.find('img').attr('src', img_path + v.user_code + '.jpg');
                        clone.find('img').error(function () {
                            $(this).attr('src', img_path + 'sample.jpg');
                        });

                        clone.removeClass('hidden');

                        if (v.user_code === session.user_code) {
                            clone.find('.direct-chat-info .pull-right').removeClass('hidden');
                        }

                        box.find('.direct-chat-messages').append(clone);
                    });
                });
            },
            btnEvent() {
                let self = this,
                    box = $('#comment_box');

                box.find('button').on('click', function (e) {
                    console.log($(e.target));
                    if ($(e.target).hasClass('btn-input')) {
                        let textarea = box.find('textarea');
                        if (!!textarea.val()) {
                            self.postData(textarea);
                            self.setList();
                        }
                    } else if ($(e.target).hasClass('btn-delete')) {
                        if (confirm('정말 삭제하시겠습니까?')) {
                            let li = box.find('.direct-chat-msg').not('.hidden');
                            let index = li.index($(this).closest('.direct-chat-msg'));
                            self.deleteData(self.data[index].idx);
                            self.setList();
                        }
                    } else if ($(e.target).hasClass('btn-modify')) {
                        let li = box.find('.direct-chat-msg').not('.hidden');
                        let index = li.index($(this).closest('.direct-chat-msg'));
                        box.find('textarea').val(self.data[index].comment);
                        box.find('textarea').data('cmt_idx', self.data[index].idx);
                        box.find('textarea').focus();
                    }
                });
            },
        };

        Comment.prototype = {
            ...Comment.prototype,
            getData() {
                let self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/comment/get_bbs_comment',
                        data: {
                            bbs_idx: self.options.bbs_idx,
                            art_idx: self.options.art_idx,
                        },
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
            postData(textarea) {
                let self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: false, type: 'post', dataType: 'json',
                        url: '/comment/post_bbs_comment',
                        data: {
                            cmt_idx: textarea.data('cmt_idx'),
                            bbs_idx: self.options.bbs_idx,
                            art_idx: self.options.art_idx,
                            comment: textarea.val(),
                        },
                        success: function (data, status, xhr) {
                            resolve(true);
                        },
                    });
                });
            },
            deleteData(idx) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: false, type: 'post', dataType: 'json',
                        url: '/comment/delete_bbs_comment',
                        data: {
                            cmt_idx: idx,
                        },
                        success: function (data, status, xhr) {
                            resolve(true);
                        },
                    });
                });
            }
        };

        return Comment;
    })();
});

