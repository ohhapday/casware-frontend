/* eslint-disable no-undef,no-unused-vars */

/**
 * Created by 서정석 on 2017/09/25.
 * 워크플랜
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'fullcalendar', 'fullcalendar-ko'
], function ($, session, myFn, app, moment) {
    'use strict';

    // 팝업 처리(추가, 수정, 삭제)
    let PopUp = (function () {
        let PopUp = function () {
            this.data = {
                idx: '',
                user_code: '',
                title: '',
                where: '',
                start: '',
                end: '',
                color: '',
                allDay: '',
            };

            this.init();
            this.initEvent();
        };

        PopUp.prototype = {
            init: function (calEvent) {

            },
            setData: function (data) {
                this.data = this.setTitle(data);

                let title = '';
                $('#pop').modal('show');
                $('#pop input[name="title"]').val(this.data.title);

                if (this.data.allDay === 1) {
                    title = moment(this.data.start).format('MM월 DD일');
                } else {
                    title = moment(this.data.start).format('MM월 DD일 HH시mm분') + ' ~ '
                        + moment(this.data.end).format('MM월 DD일 HH시mm분');
                }
                $('#pop .schedule').text(title);
            },
            initEvent: function () {
                let self = this;

                $('#pop .btn_update').on('click', function () {
                    self.post_work_plan();
                    $('#pop').modal('hide');
                });

                $('#pop .btn_delete').on('click', function () {
                    self.delete_work_plan();
                    $('#pop').modal('hide');
                });

                // 엔터키 처리
                $('#pop input[name="title"]').on('keydown', function (e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();

                        self.post_work_plan();
                        $('#pop').modal('hide');
                    }
                });

                // 모달후 포커스 처리
                $('#pop').on('shown.bs.modal', function () {
                    $('#pop input[name="title"]').focus();
                });
            },
            // 타이틀을 장소와 타이틀로 분리
            setTitle: function (data) {
                let where = '';
                let title = data.title.replace(/^\[[가-힝]{2}\]/g, '');
                let tmp = data.title.match(/^\[[가-힝]{2}\]/g) || '';

                if (tmp.length > 0) {
                    where = tmp[0].replace(/^\[|\]/g, '');
                    $('#pop input[name="where"][value="' + where + '"]').iCheck('check');
                } else {
                    $('#pop input[name="where"]').iCheck('uncheck');
                }

                data = Object.assign(data, {title: title});
                /* data = {
                    ...data,
                    title: title,
                };*/
                return data;
            },
        };

        PopUp.prototype.post_work_plan = function () {
            let where = $('#pop input[name="where"]:checked').val() || '';

            let data = Object.assign(this.data, {
                title: (where ? '[' + where + ']' : '') + $('#pop input[name="title"]').val(),
                color: where ? $('#pop input[name="where"]:checked').data('color') : ''
            });

            $.ajax({
                async: false,
                url: '/work_plan2/post_work_plan',
                type: 'post',
                dataType: 'json',
                data: data,
                success: function (data, status, xhr) {
                    $('#calendar').fullCalendar('refetchEvents');
                }
            });
        };

        PopUp.prototype.delete_work_plan = function () {
            $.ajax({
                url: '/work_plan2/delete_work_plan/',
                type: 'post',
                data: {
                    idx: this.data.idx,
                },
                success: function (data) {
                    $('#calendar').fullCalendar('refetchEvents');
                    $('#pop').modal('hide');
                }
            });
        };

        return PopUp;
    })();

    // 캘린더 처리
    (function () {
        let sources = {
            url: '/work_plan2/get_work_plans/',
            data: {
                gubun: '',
                user_code: session.user_code + '',
            },
            success: function (data) {
                $.each(data, function () {
                    this.original_title = this.title;
                    if (this.report_user_name !== '') {
                        this.title = this.original_title + ' ' + this.report_user_name;
                    }
                });
            },
        };

        let Work_plan = function () {
            this.sources = Object.assign({}, sources);

            this.users = Object.assign({
                chairmans: null,
                team_heads: null,
            }, this.get_data());
            this.popup = new PopUp();

            this.init();
            this.initEvent();
        };

        Work_plan.prototype = {
            init: function () {
                this.setNavTab();
                this.setCalendar();
            },
            initEvent: function () {
                let self = this;
                $('.nav a, .dropdown li a').click(function () {
                    if ($(this).data('code') === 'business_trip') {         // 출장 일정
                        self.sources.data.gubun = $(this).data('code') + '';
                    } else {
                        self.sources.data.gubun = '';
                    }
                    self.sources.data.user_code = $(this).data('code') + '';
                    $('#calendar').fullCalendar('refetchEventSources', self.sources);
                    $('#calendar').fullCalendar('changeView', 'month');

                    $('.box-body h3').text($(this).text());
                });
            },
            setNavTab: function () {
                let self = this;

                // 임원탭 처리
                (function () {
                    let li = $('.nav-tabs li:eq(0)');
                    $.each(self.users.chairmans, function () {
                        let clone = li.clone(true);

                        clone.find('a').text(this.user_name);
                        clone.find('a').data('code', this.user_code);
                        clone.removeClass('hidden');

                        $('.nav-tabs li:last-child').after(clone);
                    });
                })();

                // 간부사원 처리
                (function () {
                    let li = $('.team_heads .dropdown');
                    let ul = $('.team_heads ul li');

                    $.each(self.users.team_heads, function (key) {
                        let clone = li.clone(true);

                        // 부서장/팀장
                        $.each(this, function () {
                            let v_ul = ul.clone(true);

                            v_ul.find('a').text(this.duty_name + ' ' + this.user_name);
                            v_ul.find('a').data('code', this.user_code);
                            v_ul.removeClass('hidden');

                            clone.find('li').last().after(v_ul);
                        });

                        clone.find('button span:eq(0)').text(key);
                        clone.removeClass('hidden');
                        $('.team_heads .dropdown').last().after(clone);
                    });
                })();
            },
            setCalendar: function () {
                let self = this;
                $('#calendar').fullCalendar({
                    defaultView: 'agendaWeek',
                    lang: 'ko',
                    header: {
                        left: 'prev,next,today',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay,listWeek'
                    },
                    selectable: true,
                    // selectHelper: true,
                    buttonText: {
                        today: 'today',
                        month: 'month',
                        week: 'week',
                        day: 'day'
                    },
                    timeFormat: 'HH:mm',
                    droppable: true,
                    events: this.sources,
                    select: function (start, end, resource, view) {
                        if (session.user_code !== self.sources.data.user_code) {
                            return false;
                        }

                        // 전일 이벤트 여부 확인
                        let allDay = !start.hasTime() && !end.hasTime();

                        self.popup.setData({
                            idx: '',
                            user_code: self.sources.data.user_code,
                            title: '',
                            start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
                            end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
                            color: '',
                            allDay: (allDay) ? 1 : 0,
                        });
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        if (session.user_code !== self.sources.data.user_code) {
                            return false;
                        }

                        if (calEvent.editable === false) {
                            return false;
                        }

                        self.popup.setData({
                            idx: calEvent.idx,
                            user_code: calEvent.user_code,
                            title: calEvent.title,
                            start: moment(calEvent.start).format('YYYY-MM-DD HH:mm:ss'),
                            end: moment(calEvent.end).format('YYYY-MM-DD HH:mm:ss'),
                            color: calEvent.color,
                            allDay: parseInt(calEvent.allDay),
                        });
                    },
                    eventRender: function (event, element) {
                        if (event.url) {
                            $(element).find('.fc-content').append('<i class="fa fa-file" style="margin-left: 5px;"></i>');
                        }
                        if (event.gubun === 'business_trip') {
                            element.css('color', '#000000');
                        }
                    },
                    eventDrop: function (calEvent, jsEvent, ui, view) {
                        $.ajax({
                            url: '/work_plan2/post_work_plan/',
                            type: 'post',
                            data: {
                                idx: calEvent.idx,
                                user_code: calEvent.user_code,
                                start: calEvent.start.format('YYYY-MM-DD HH:mm:ss'),
                                end: (calEvent.end === null) ? calEvent.start.format('YYYY-MM-DD HH:mm:ss') : calEvent.end.format('YYYY-MM-DD HH:mm:ss'),
                                title: calEvent.title,
                                original_title: calEvent.title,
                                allDay: (calEvent.allDay) ? 1 : 0,
                                color: calEvent.color
                            },
                            success: function (data) {
                            }
                        });
                    },
                    eventResize: function (calEvent, delta, revertFunc, jsEvent, ui, view) {
                        $.ajax({
                            url: '/work_plan2/post_work_plan/',
                            type: 'post',
                            data: {
                                idx: calEvent.idx,
                                user_code: calEvent.user_code,
                                start: calEvent.start.format('YYYY-MM-DD HH:mm:ss'),
                                end: (calEvent.end === null) ? calEvent.start.format('YYYY-MM-DD HH:mm:ss') : calEvent.end.format('YYYY-MM-DD HH:mm:ss'),
                                title: calEvent.title,
                                original_title: calEvent.title,
                                allDay: (calEvent.allDay) ? 1 : 0,
                                color: calEvent.color
                            },
                            success: function (data) {
                            }
                        });
                    }
                });

                $('.box-body h3').text(session.dept + ' ' + session.position + ' ' + session.user_name);
            },
        };

        Work_plan.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/work_plan2/get_users',
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Work_plan();
    })();

    // 화면 초기 처리
    (function () {
        // 임원 입력 권한 (인사팀, 경영정보팀)
        if (session.dept_code === 'CAS0600' || session.filler.match(/^(bae)/g) !== null) {
            $('#btn_input').removeClass('hidden');
        }
    })();
});

