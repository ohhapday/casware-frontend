/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/08/17.
 * 개인정보 변경(비밀번호)
 */

define([
    'jquery', 'session', 'moment', 'bootstrap', 'jquery-popup-overlay',
], function ($, session, moment) {
    'use strict';

    let pop_html = `
        <div id="user_edit_pop" class="well" style="width: 500px;">
            <form>
                <div class="row">
                    <div class="col-md-12">    
                        <div class="nav-tabs-custom">
                            <ul class="nav nav-tabs">
                                <li class="active"><a href="#pw_login" data-toggle="tab">로그인 비밀번호</a></li>
                                <li><a href="#pw_approval" data-toggle="tab">결재 비밀번호</a></li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active form-horizontal">
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label">기존 비밀번호</label>
                                        <div class="col-sm-9" style="padding: 0px 20px;">
                                            <input type="password" class="form-control input-sm" 
                                                placeholder="기존 비밀번호" required>
                                        </div>
                                    </div>
                                    <div class="with-border" style="margin-bottom: 10px;"></div>
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label">신규 비밀번호</label>
                                        <div class="col-sm-9" style="padding: 0px 20px;">
                                            <input type="password" class="form-control input-sm" 
                                                placeholder="신규 비밀번호" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label">비밀번호 확인</label>
                                        <div class="col-sm-9" style="padding: 0px 20px;">
                                            <input type="password" class="form-control input-sm" 
                                            placeholder="비밀번호 확인" required>
                                        </div>
                                    </div>
                                </div>                            
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-danger pull-left">변경</button>
                        <button type="button" class="user_edit_pop_close btn btn-default pull-right">Close</button>
                    </div>
                </div>
            </form>
        </div>
    `;

    let User_edit_pop = function () {
        this.init();
        this.initEvent();
    };

    User_edit_pop.prototype = {
        init: function () {
            $('#user_edit_pop input').val('');

            if ($('#user_edit_pop').length === 0) {
                $('body').append(pop_html);
            }

            $('#user_edit_pop').popup({
                transition: 'all 0.5s',
                scrolllock: true,
                autoopen: true,
                blur: false,
            });
        },
        initEvent: function () {
            let self = this;
            $('#user_edit_pop button:eq(0)').on('click', function (e) {
                let form = $('#user_edit_pop form'),
                    isValid = null;

                isValid = form[0].checkValidity();
                if (false === isValid) {
                    return;
                }
                e.preventDefault();

                // 비밀번호 전송
                (function () {
                    let current_pw = $('#user_edit_pop input:eq(0)').val();
                    let new_pw = $('#user_edit_pop input:eq(1)').val();
                    let confirm_pw = $('#user_edit_pop input:eq(2)').val();

                    if (new_pw === confirm_pw) {
                        $.ajax({
                            async: false,
                            url: '/main/put_user_password',
                            type: 'post',
                            dataType: 'json',
                            data: {
                                gubun: $('#user_edit_pop .nav-tabs li.active a').attr('href'),
                                current_pw: current_pw,
                                new_pw: new_pw,
                            },
                            success: function (data, status, xhr) {
                                $('#user_edit_pop').popup('hide');
                                alert(data.message);
                                self = null;
                            }
                        });
                    } else {
                        $('#user_edit_pop').popup('hide');
                        alert('변경하려는 비밀번호가 일치하지 않습니다.');
                        self = null;
                    }
                })();
            });
        },
    };

    return User_edit_pop;
});

