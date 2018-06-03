/* eslint-disable no-undef,no-unused-vars */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

define([
    'jquery', 'session', 'myFn', 'jquery-popup-overlay', 'ckeditor',
    '/dist/js/common/select2UserSearch_v2.js'
], function ($, session, myFn) {
    'use strict';

    let pop_html = `
        <div id="slide" class="well" style="min-width: 400px;">
            <form>
                <div class="row">
                    <div class="col-md-12">
                        <div class="box-header bg-blue">
                            답변 요청 메일 보내기 
                        </div>
                        <div class="box-body form-horizontal">
                            <div class="form-group">
                                <label class="col-sm-2 control-label">제목</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="mail_title" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-2 control-label">수신</label>
                                <div class="col-sm-10">
                                    <select name="user_name" multiple required
                                            class="form-control input-sm select2 hidden"
                                            style="border: 0; width: 100%; height: 30px;">
                                        <option></option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-12">
                                    <textarea name="contents" id="mail_contents" title=""></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-2 control-label">첨부링크</label>
                                <div class="col-sm-10 control-label attach-link" style="text-align: left;">
                                    ㅁㅁㅁㅁㅁㅁㅁ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                         
                <div class="row" style="margin-top: 30px;">
                    <div class="col-md-12">
                        <div class="btn-group pull-right" role="group">
                            <button type="button" class="btn btn-primary" disabled>
                                <i class="fa fa-envelope-o"></i> 전송
                            </button>
                            <button type="button" class="btn btn-default">
                                <i class="fa fa-close"></i> 닫기
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;

    let Mail_box = function (data) {
        this.data = data;
        this.init();
        this.initEvent();
    };

    Mail_box.prototype = {
        init: function () {
            this.addPopup();

            $('input[name="mail_title"]').val('[대리점 사이트] 문의사항에 대해 답변을 요청드립니다.');
            $('select[name="user_name"]').val([]);
            $('#mail_contents').val('');
            $('.attach-link').html(`
                <a href="/main_contents/korea_agency/index?url=/bbs/view/${this.data.bbs_idx}/${this.data.idx}" 
                    target="_blank">바로가기</a>
            `);

            $('#slide').popup({
                autoopen: true,
                blur: false,
                autozindex: true,
            });
        },
        initEvent: function () {
            this.btnEvent();
        },
        addPopup: function () {
            if (document.querySelector('#slide') === null) {
                let html = $(pop_html).clone(true);

                $('body').append(html);

                CKEDITOR.replace('mail_contents', {
                    width: '100%',
                    height: '400px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });

                $('select[name="user_name"]').select2UserSearch({
                    default_user_code: [],
                });

                $('select[name="user_name"]').on('change', function (e) {
                    if ($(this).val() !== null) {
                        $('#slide .btn-primary').attr('disabled', false);
                    } else {
                        $('#slide .btn-primary').attr('disabled', true);
                    }
                });
            }
        },
        btnEvent: function () {
            let self = this;
            // 창 닫기
            $('#slide .btn-default').on('click', function () {
                $('#slide').popup('hide');
            });

            // 전송
            $('#slide .btn-primary').on('click', function (e) {
                self.postData(function () {
                    alert('메일이 발송되었습니다.');
                });
            });
        }
    };

    Mail_box.prototype = {
        ...Mail_box.prototype,
        postData: function (callback) {
            let self = this,
                user_mail = $('#slide select[name="user_name"]').val().reduce(function (result, current) {
                    result.push(current + '@globalcas.co.kr');
                    return result;
                }, []);

            $.ajax({
                async: true, type: 'post', dataType: 'json',
                url: '/agency_bbs/send_mail',
                data: {
                    title: $('#slide input[name="mail_title"]').val(),
                    user_name: user_mail,
                    contents: CKEDITOR.instances.mail_contents.getData(),
                    bbs_data: self.data,
                },
                beforeSend: function () {
                    $('#slide button').attr('disabled', true);
                },
                complete: function () {
                    if (typeof callback === 'function') {
                        callback();
                    }
                    $('#slide button').attr('disabled', false);
                }
            });
        },
    };

    return Mail_box;
});
