/* eslint-disable no-undef,no-unsafe-negation,no-unused-vars */
/**
 * Created by 서정석 on 2017/02/20.
 * 실시간 알림판
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'jquery-slimscroll', 'faloading',
], function ($) {
    'use strict';

    // 페이지 초기화
    (function () {
        $('#notice_area .box-body').slimScroll({
            height: '195',
        });
        $('#notice_area .box-header>div:first-child').on('click', function () {
            $(this).parent().next().toggle('slow');
        });

        // 알림판 화면 확대/축소
        $('#notice_area .fa-plus').parent().on('click', function () {
            let height = parseInt($('#notice_area .box-body').css('height'));
            $('#notice_area .box-body').css('height', 395);

            if (height < 500) {
                $('#notice_area .box-body').slimScroll({
                    height: height + 100,
                });
            }
        });

        $('#notice_area .fa-minus').parent().on('click', function () {
            let height = parseInt($('#notice_area .box-body').css('height'));
            if (height > 195) {
                $('#notice_area .box-body').slimScroll({
                    height: height - 100,
                });
            }
        });

        // 리플레시
        $('#notice_area .fa-refresh').parent().on('click', function () {
            $('#notice_area .alert:not(.hidden)').remove();
            aa = null;
            aa = new Sse();
        });
    })();

    // EventSource
    let Sse = (function () {
        let Sse = function () {
            this.source = null;
            this.data = null;
            this.init();
            this.initEvent();
        };

        Sse.prototype = {
            init: function () {
                let self = this;
                let source = new EventSource('/main/get_notification');
                let compare = {};
                let todo = null, approval = null, mail = null, intertrade = null;

                source.addEventListener('message', function (e) {
                    let data = JSON.parse(e.data) || {};

                    // JSON Group-By
                    self.data = data.reduce(function (result, current) {
                        result[current.gubun] = result[current.gubun] || [];
                        result[current.gubun].push(current);
                        return result;
                    }, {});

                    // Notification창 알림
                    // self.notifyMe(self.data);

                    try {
                        $('.nav li div').text('');

                        // Approval (비교없이 Dom을 계속 변경시에 브라우저에 부하가 발생)
                        if (JSON.stringify(self.data.approval || '').length !== JSON.stringify(compare.approval || '').length) {
                            if (approval !== null) {
                                approval.remove();
                            }
                            compare.approval = $.extend(true, [], self.data.approval);
                            approval = self.setList({data: self.data.approval, title: '전자결재'});

                            // 메뉴에 카운트 변경
                            $('.nav li:eq(1) div').text('(' + self.data.approval.length + ')');
                        }

                        // mail (비교없이 Dom을 계속 변경시에 브라우저에 부하가 발생)
                        if (JSON.stringify(self.data.mail || '').length !== JSON.stringify(compare.mail || '').length) {
                            if (mail !== null) {
                                mail.remove();
                            }
                            compare.mail = $.extend(true, [], self.data.mail);
                            mail = self.setList({data: self.data.mail, title: '메일'});

                            // 메뉴에 카운트 변경
                            $('.nav li:eq(0) div').text(' (' + self.data.mail.length + ')');
                        }

                        // TODOLIST (비교없이 Dom을 계속 변경시에 브라우저에 부하가 발생)
                        if (JSON.stringify(self.data.todo || '').length !== JSON.stringify(compare.todo || '').length) {
                            if (todo !== null) {
                                todo.remove();
                            }
                            compare.todo = $.extend(true, [], self.data.todo);
                            todo = self.setList({data: self.data.todo, title: 'TODO'});

                            // 메뉴에 카운트 변경
                            $('.nav li:eq(2) div').text(' (' + self.data.todo.length + ')');
                        }

                        // 사내거래 (비교없이 Dom을 계속 변경시에 브라우저에 부하가 발생)
                        if (JSON.stringify(self.data.intertrade || '').length !== JSON.stringify(compare.intertrade || '').length) {
                            if (intertrade !== null) {
                                intertrade.remove();
                            }
                            compare.intertrade = $.extend(true, [], self.data.intertrade);
                            intertrade = self.setList({data: self.data.intertrade, title: '사내거래'});

                            // 메뉴에 카운트 변경
                            $('.nav li:eq(3) div').text(' (' + self.data.intertrade.length + ')');
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }, false);
            },
            initEvent: function () {
                let self = this;
                $('#notice_area a').on('click', function () {
                    $('#notice_area .alert:not(.hidden)').remove();
                    self.init();
                });
                /*$('#notice_area .alert').on('click', function () {
                    $(this).addClass('hidden');
                });*/
            },
            setList: function (obj) {
                let $alert = $('#notice_area .alert.hidden');
                let clone_alert = $alert.clone(true);

                clone_alert.data('title', obj.title);

                let cnt = ' (총 ' + obj.data.length + '건)';
                clone_alert.find('h_title').text(obj.title + cnt);
                clone_alert.find('h_title').text(obj.title + cnt);

                $.each(obj.data, function (i) {
                    let self = this;
                    let li = clone_alert.find('div:eq(0)').clone(true);

                    li.find('.p-title:eq(0)').html(this.title);
                    li.find('.p-title:eq(1)').text(this.from_user);
                    li.find('.p-title:eq(2)').text(this.w_date);

                    // 코멘트 처리
                    $.each(this.comment, function () {
                        let cmt_li = li.find('a.hidden').clone(true);

                        cmt_li.find('div').html('<i class="fa fa-level-up fa-rotate-90"></i> ' +
                            this.title + '(' + this.from_user + ')');
                        cmt_li.attr('href', this.link).attr('target', '_blank');

                        cmt_li.removeClass('hidden');
                        li.find('.p-comment').append(cmt_li);
                    });

                    li.removeClass('hidden');
                    clone_alert.append(li);

                    li.find('a').attr('href', self.link).attr('target', '_blank');

                    if (i === 2) {
                        return false;
                    }
                });

                clone_alert.removeClass('hidden');
                $('#notice_area .box-body').append(clone_alert);

                return clone_alert;
            },
            notifyMe: function (data) {
                let body = '';
                let cnt = 0;

                $.each(data, function (title) {
                    let aa = this.filter(function (item) {
                        return item.is_notification === '0';
                    });
                    cnt += aa.length;
                });
                if (cnt === 0) return;          // 메세지가 있을경우만 발송

                body = '+ ' + cnt + ' New Notifications';

                if (!'Notification' in window) {
                    alert('브라우저가 desktop notification을 지원하지 않습니다.\n\n표준브라우저를 사용하시기 바랍니다.');
                } else if (Notification.permission === 'granted') {
                    let notification = new Notification('CASWARE', {
                        body: body,
                        tag: 'message1',
                        icon: '/images/cas.png',
                    });

                    notification.onclick = function () {
                        location.href = '/main';
                    };
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission(function (permission) {
                        if (!('permission' in Notification)) {
                            Notification.permission = permission;
                        }
                        if (permission === 'granted') {
                            var notification = new Notification('CASWARE', {
                                body: body,
                                tag: 'message1',
                                icon: '/images/cas.ico',
                            });
                        }
                    });
                }
            },
        };

        return Sse;
    })();

    let aa = new Sse();
});

