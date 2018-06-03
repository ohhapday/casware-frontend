/* eslint-disable no-undef,no-console,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'highchart', 'highchart_exporting', 'highchart-3d',
    'datetimepicker',
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

    // 페이지 초기화
    (function () {
        $('input[type="text"]').datetimepicker({
            format: 'YYYY-MM',
            locale: 'ko',
            defaultDate: moment().format('YYYY-MM'),
            minDate: '2015-01',
        });

        $('input[type="text"]').on('dp.change', function () {
            new Chart();
            new Comment();
            new Chart_ea();
        });

        $('.fa-star').closest('.box-tools').popover({
            placement: 'left',
            title: '평가 기준',
            html: true,
            content: '평가기준은 <br>월별 답변건수: 50% <br>답변속도점수: 50% <br>임원평가 가산점: 30%<br>로 구성됩니다.',
            trigger: 'focus'
        });

        $('.fa-loading-wrapper').remove();
    })();

    // 직원별 차트
    let Chart = (function (Highcharts) {
        let option = {
            chart: {
                renderTo: 'chart_mem',
                type: 'column',
                /*options3d: {
                    enabled: true,
                    alpha: 20,
                    beta: -5,
                    depth: 0,
                    viewDistance: 25
                }*/
            },
            title: {
                text: '개인별 통계'
            },
            subtitle: {
                text: 'www.cas.co.kr'
            },
            yAxis: [{
                min: 0,
                max: 10,
                title: {
                    text: '점수'
                }
            }],
            tooltip: {
                headerFormat: '<span style="font-size: 1.2em">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0,
                    borderWidth: 1,
                },
                series: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
        };

        let Chart = function () {
            this.chart = null;

            this.data = this.get_data();
            this.chart_data = this.set_data();
            this.option = $.extend(option, this.chart_data);

            this.init();
            this.initTable();                // 직원별/월별 점수표
        };

        Chart.prototype = {
            init: function () {
                if (this.chart !== null) {
                    this.chart.destroy();
                }
                this.chart = Highcharts.chart(option);
            },
            set_data: function () {
                let data = this.data.current_month_user_data;

                let returnData = {
                    xAxis: {
                        categories: []
                    },
                    series: [{
                        name: '건수',
                        data: [],
                    }, {
                        name: '응답속도(분)',
                        data: [],
                        visible: false,
                        color: '#2a27bb'
                    }, {
                        name: '속도점수',
                        data: [],
                    }, {
                        name: '평가점수',
                        data: [],
                        color: 'rgb(247, 163, 92)'
                    }],
                };

                let idx_0 = returnData.series.findIndex(item => item.name === '건수');
                let idx_1 = returnData.series.findIndex(item => item.name === '응답속도(분)');
                let idx_2 = returnData.series.findIndex(item => item.name === '속도점수');
                let idx_3 = returnData.series.findIndex(item => item.name === '평가점수');

                $.each(data, function () {
                    returnData.xAxis.categories.push(this.user_name);
                    returnData.series[idx_0].data.push(parseInt(this.건수));
                    returnData.series[idx_1].data.push(parseFloat((this.평균응답속도 / 60).toFixed(1)));
                    returnData.series[idx_2].data.push(parseFloat(this.평균속도점수));
                    returnData.series[idx_3].data.push(parseFloat(this.임원평가점수));
                });

                return returnData;
            },
            initTable: function () {
                let data = this.data.current_month_user_data;
                let search = this.data.current_year_user_data;
                let table = $('#chart_mem').parent().next().find('table');

                table.find('tbody tr:not(:eq(0))').remove();

                // JSON Group-By
                let arr = search.reduce(function (result, current) {
                    result[current.reg_month] = result[current.reg_month] || [];
                    result[current.reg_month].push(current);

                    return result;
                }, {});

                $.each(data, function () {
                    let self = this;
                    let clone = table.find('tbody tr:eq(0)').clone(true);
                    let total = 0, cnt = 0;

                    clone.css('display', '');
                    clone.find('td:eq(0) div').text(this.user_name);

                    for (let i = 0; i < 12; i++) {         // 1~12월
                        if (typeof arr[i + 1] !== 'undefined') {
                            let user = arr[i + 1].find(function (item) {
                                return item.user_code === self.user_code;
                            });

                            if (typeof user !== 'undefined') {
                                let score = (parseFloat(user.건수에따른점수) * 50 +
                                    parseFloat(user.평균속도점수) * 50 +
                                    parseFloat(user.임원평가점수) * 30) / 10;
                                clone.find('td').eq(i + 1).find('div').text(score);
                                total += score;
                                cnt++;
                            }
                        }
                        clone.find('td').eq(13).find('div').text((parseFloat(total / cnt)).toFixed(2));
                    }

                    table.find('tbody').append(clone);
                });
            },
        };

        Chart.prototype.get_data = function () {
            let returnData;
            $.ajax({
                url: '/casbbs/get_chart_data',
                type: 'get',
                async: false,
                dataType: 'JSON',
                data: {
                    target_month: $('input[type="text"]').val(),
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Chart();
        return Chart;
    })(Highcharts);

    // 월별 문의 건수/ 월별 응답 속도
    let Chart_ea = (function (Highcharts) {
        let option = {
            chart: {
                type: 'column',
                /*options3d: {
                    enabled: true,
                    alpha: 20,
                    beta: -5,
                    depth: 90,
                    viewDistance: 25
                }*/
            },
            title: {
                text: '월별 문의 건수'
            },
            subtitle: {
                text: 'www.cas.co.kr'
            },
            yAxis: [{
                min: 0,
                title: {
                    text: '건'
                },
            }],
            tooltip: {
                headerFormat: '<span style="font-size: 1.2em">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} </b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0,
                    borderWidth: 2,
                },
                series: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
        };

        let Chart_ea = function () {
            this.chart_ea = null, this.chart_speed = null;

            this.data = this.set_data();
            this.option_ea = $.extend({}, option, this.data[0]);
            this.option_speed = $.extend({}, option, this.data[1]);

            this.init();

            this.initTable_ea();                // 월별 문의 건수 테이블
            this.initTable_speed();             // 월별 응답 속도 테이블
        };

        Chart_ea.prototype = {
            init: function () {
                if (this.chart_ea !== null) {
                    this.chart_ea.destroy();
                }
                this.chart_ea = Highcharts.chart('chart_ea', this.option_ea);

                if (this.chart_speed !== null) {
                    this.chart_speed.destroy();
                }

                this.option_speed = $.extend(this.option_speed, {
                    tooltip: {
                        headerFormat: '<span style="font-size: 1.2em">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.2f} 분</b></td></r>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    yAxis: [{
                        min: 0,
                        max: 75,
                        tickInterval: 10,
                        title: {
                            text: '분'
                        },
                        plotLines: [{
                            color: '#ff4641',
                            width: 4,
                            value: 10
                        }]
                    }],
                    title: {
                        text: '월별 응답 속도'
                    },
                });

                this.chart_speed = Highcharts.chart('chart_speed', this.option_speed);
            },
            set_data: function () {
                let data = this.get_data();
                let returnData;

                // JSON Group-By
                let arr = data.reduce(function (result, current) {
                    result[current.년] = result[current.년] || [];
                    result[current.년].push(current);

                    return result;
                }, {});

                let returnData_ea = {
                    xAxis: {
                        categories: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월',],
                        plotLines: [{
                            color: '#47C83E',
                            width: 2,
                            value: moment().format('M') - 0.5    // 6.5
                        }]
                    },
                    series: [],
                };

                let returnData_speed = {
                    xAxis: {
                        categories: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월',],
                        plotLines: [{
                            color: '#47C83E',
                            width: 2,
                            value: moment().format('M') - 0.5    // 6.5
                        }]
                    },
                    series: [],
                };

                let color = ['#A6A6A6', '#747474', '#4374D9'];
                let j = 0;
                $.each(arr, function (key) {
                    let data_ea = [], data_speed = [];
                    for (let i = 1; i <= 12; i++) {         // 1~12월
                        let bb = this.find(function (item) {
                            return parseInt(item.월) === i;
                        });
                        data_ea.push((typeof bb === 'undefined') ? null : parseInt(bb.건수));
                        data_speed.push((typeof bb === 'undefined') ? null : parseFloat(bb['개별 속도2']));
                    }

                    returnData_ea.series.push({name: key, data: data_ea, color: color[j]});
                    returnData_speed.series.push({name: key, data: data_speed, color: color[j]});

                    j++;
                });

                returnData = [
                    returnData_ea, returnData_speed
                ];

                return returnData;
            },
            initTable_ea: function () {
                let data = this.data[0];
                let table = $('#chart_ea').parent().next().find('table');

                table.find('tbody tr:not(:eq(0))').remove();

                $.each(data.series, function () {
                    let clone = table.find('tbody tr:eq(0)').clone(true);
                    let total = 0, cnt = 0;

                    clone.css('display', '');
                    clone.find('td:eq(0) div').text(this.name + '년');

                    for (let i = 0; i < 12; i++) {         // 1~12월
                        clone.find('td').eq(i + 1).find('div').text((this.data[i] || '0') + '건');
                        (this.data[i]) ? cnt++ : '';
                        total += this.data[i];
                    }
                    clone.find('td').eq(13).find('div').text((total / cnt).toFixed(1) + '건');

                    table.find('tbody').append(clone);
                });

                // 증감
                (function () {
                    let foot_01 = table.find('tfoot tr:eq(0)');
                    let foot_02 = table.find('tfoot tr:eq(1)');
                    let prev_val, current_val, variation, per;

                    for (let i = 0; i < 12; i++) {         // 1~12월
                        if (data.series[2].data[i] !== null) {
                            let variation = data.series[2].data[i] - data.series[1].data[i];
                            let per = (variation / data.series[1].data[i] * 100).toFixed(1);

                            foot_01.find('td').eq(i + 1).find('div').text(variation + '건');
                            foot_02.find('td').eq(i + 1).find('div').text(per + '%');
                        }
                    }

                    current_val = parseFloat(table.find('tbody tr:eq(3) td:eq(13) div').text());
                    prev_val = parseFloat(table.find('tbody tr:eq(2) td:eq(13) div').text());
                    variation = (current_val - prev_val).toFixed(1);
                    per = (variation / prev_val * 100).toFixed(1);

                    foot_01.find('td').eq(13).find('div').text(variation + '건');
                    foot_02.find('td').eq(13).find('div').text(per + '%');
                })();
            },
            initTable_speed: function () {
                let data = this.data[1];
                let table = $('#chart_speed').parent().next().find('table');

                table.find('tbody tr:not(:eq(0))').remove();

                $.each(data.series, function () {
                    let clone = table.find('tbody tr:eq(0)').clone(true);
                    let total = 0, cnt = 0;

                    clone.css('display', '');
                    clone.find('td:eq(0) div').text(this.name + '년');

                    for (let i = 0; i < 12; i++) {         // 1~12월
                        clone.find('td').eq(i + 1).find('div').text((this.data[i] || '0') + '분');
                        (this.data[i]) ? cnt++ : '';
                        total += this.data[i];
                    }
                    clone.find('td').eq(13).find('div').text((total / cnt).toFixed(1) + '분');

                    table.find('tbody').append(clone);
                });

                // 증감
                (function () {
                    let foot_01 = table.find('tfoot tr:eq(0)');
                    let foot_02 = table.find('tfoot tr:eq(1)');
                    let prev_val, current_val, variation, per;

                    for (let i = 0; i < 12; i++) {         // 1~12월
                        if (data.series[2].data[i] !== null) {
                            let variation = (data.series[2].data[i] - data.series[1].data[i]).toFixed(2);
                            let per = (parseFloat(variation) / data.series[1].data[i] * 100).toFixed(1);
                            foot_01.find('td').eq(i + 1).find('div').text(variation + '분');
                            foot_02.find('td').eq(i + 1).find('div').text(per + '%');
                        }
                    }

                    current_val = parseFloat(table.find('tbody tr:eq(3) td:eq(13) div').text());
                    prev_val = parseFloat(table.find('tbody tr:eq(2) td:eq(13) div').text());
                    variation = (current_val - prev_val).toFixed(1);
                    per = (variation / prev_val * 100).toFixed(1);

                    foot_01.find('td').eq(13).find('div').text(variation + '분');
                    foot_02.find('td').eq(13).find('div').text(per + '%');
                })();
            },
        };

        Chart_ea.prototype.get_data = function () {
            let returnData;
            $.ajax({
                url: '/casbbs/get_chart_ea_data',
                type: 'get',
                async: false,
                dataType: 'JSON',
                data: {
                    target_month: $('input[type="text"]').val(),
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Chart_ea();
        return Chart_ea;
    })(Highcharts);

    // 댓글 박스
    let Comment = (function () {
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
                    boardcode: $('input[type="text"]').val(),
                    boardidx: 'cas.co.report',
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
                    seq: $('input[type="text"]').val(),
                    boardidx: 'cas.co.report',
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

        return Comment;
    })();
});

