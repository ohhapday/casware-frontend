/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/06/12.
 * 전사 재고현황
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment', 'highchart', 'highchart_exporting', 'datetimepicker',
], function ($, session, myFn, app, moment) {
    'use strict';

    let nf = new Intl.NumberFormat(['en-US']);

    // 전사재고 테이블 Class
    let Inven = (function () {
        let Inven = function (table) {
            this.table = table;
            this.data = null;
            this.init();
        };

        Inven.prototype = {
            init: function () {
                let tmp = this.get_data();
                this.data = tmp.inventory;
                this.search_date = tmp.search_date;

                $('#inven_title h4').text(this.search_date + ' 기준 전사재고 현황');

                // 테이블 타이틀 변경
                this.table.find('thead tr:eq(0) th:eq(1)').text(moment().subtract(2, 'years').format('YYYY') + '년말');
                this.table.find('thead tr:eq(0) th:eq(2)').text(moment().subtract(1, 'years').format('YYYY') + '년말');

                this.initEvent();
                this.tr_head();
                this.total();
            },
            initEvent: function () {
                let self = this;
                let invenData = this.data;

                // 하부조직 펼치기
                this.table.find('.fa-angle-double-right').on('click', function () {
                    let tmp = $(this).closest('tr');
                    let index = self.table.find('tbody tr').not(':eq(0), :eq(1), .sub').index(tmp);
                    let target_code = invenData[index].dept_cd;

                    for (let i = 0; i < invenData[index].sub.length; i++) {
                        tmp = tmp.next();
                        tmp.fadeIn(500);
                    }

                    $(this).fadeOut(250, function () {
                        $(this).next().fadeIn(250);
                    });

                    new Chart(target_code);
                });

                // 하부조직 닫기
                this.table.find('.fa-angle-double-down').on('click', function () {
                    let tmp = $(this).closest('tr');
                    let index = self.table.find('tbody tr').not(':eq(0), :eq(1), .sub').index(tmp);

                    for (let i = 0; i < invenData[index].sub.length; i++) {
                        tmp = tmp.next();
                        tmp.fadeOut(500);
                    }

                    $(this).fadeOut(250, function () {
                        $(this).prev().fadeIn(250);
                    });
                });
            },
            tr_head: function () {
                let self = this;
                let clone = this.table.find('tbody tr:eq(0)');
                let invenData = this.data;

                $.each(invenData, function () {
                    let tr_last = self.table.find('tbody tr:last');
                    let tr = clone.clone(true);

                    self.tr_data(tr, this);

                    tr_last.after(tr);
                    self.tr_sub(tr, this.sub);                  // 하부부서 생성
                    tr.css('display', '');
                });
            },
            tr_sub: function (tr_last, subData) {
                let self = this;
                let clone = this.table.find('tbody tr:eq(1)');

                $.each(subData, function () {
                    let tr_last = self.table.find('tbody tr:last');
                    let tr = clone.clone(true);

                    self.tr_data(tr, this);

                    tr.find('td:eq(0) div').text('+ ' + this.dept_name);
                    tr_last.after(tr);
                });
            },
            tr_data: function (obj_tr, data) {
                obj_tr.find('td:eq(0) span').text(data.dept_name);

                obj_tr.find('td:eq(1) div').text(nf.format(data['before_last_year_end'].수량));
                obj_tr.find('td:eq(2) div').text(nf.format((data['before_last_year_end'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(3) div').text(nf.format(data['last_year_end'].수량));
                obj_tr.find('td:eq(4) div').text(nf.format((data['last_year_end'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(5) div').text(nf.format(data['현재고'].수량));
                obj_tr.find('td:eq(6) div').text(nf.format((data['현재고'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(7) div').text(nf.format(data['30일이내'].수량));
                obj_tr.find('td:eq(8) div').text(nf.format((data['30일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(9) div').text(nf.format(data['60일이내'].수량));
                obj_tr.find('td:eq(10) div').text(nf.format((data['60일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(11) div').text(nf.format(data['180일이내'].수량));
                obj_tr.find('td:eq(12) div').text(nf.format((data['180일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(13) div').text(nf.format(data['365일이내'].수량));
                obj_tr.find('td:eq(14) div').text(nf.format((data['365일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(15) div').text(nf.format(data['365일초과'].수량));
                obj_tr.find('td:eq(16) div').text(nf.format((data['365일초과'].금액 / 1000).toFixed(0)));
            },
            total: function () {
                let keyList = Object.keys(this.data[0]);
                let total = {};
                let obj_tr = this.table.find('tfoot tr');
                for (let key of keyList) {
                    total[key] = {
                        '금액': null,
                        '수량': null,
                    };
                }

                $.each(this.data, function () {
                    for (let key of keyList) {
                        total[key].수량 += parseFloat(this[key].수량);
                        total[key].금액 += parseFloat(this[key].금액);
                    }
                });

                obj_tr.find('td:eq(1) div').text(nf.format(total['before_last_year_end'].수량));
                obj_tr.find('td:eq(2) div').text(nf.format((total['before_last_year_end'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(3) div').text(nf.format(total['last_year_end'].수량));
                obj_tr.find('td:eq(4) div').text(nf.format((total['last_year_end'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(5) div').text(nf.format(total['현재고'].수량));
                obj_tr.find('td:eq(6) div').text(nf.format((total['현재고'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(7) div').text(nf.format(total['30일이내'].수량));
                obj_tr.find('td:eq(8) div').text(nf.format((total['30일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(9) div').text(nf.format(total['60일이내'].수량));
                obj_tr.find('td:eq(10) div').text(nf.format((total['60일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(11) div').text(nf.format(total['180일이내'].수량));
                obj_tr.find('td:eq(12) div').text(nf.format((total['180일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(13) div').text(nf.format(total['365일이내'].수량));
                obj_tr.find('td:eq(14) div').text(nf.format((total['365일이내'].금액 / 1000).toFixed(0)));

                obj_tr.find('td:eq(15) div').text(nf.format(total['365일초과'].수량));
                obj_tr.find('td:eq(16) div').text(nf.format((total['365일초과'].금액 / 1000).toFixed(0)));
            },
            destory: function () {
                this.table.find('tbody tr').not(':eq(0), :eq(1)').remove();
            },
        };

        Inven.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/inventory/get_inventory',
                type: 'get',
                dataType: 'json',
                data: {
                    date: $('input[type="text"]').val() || moment().format('YYYY-MM'),
                    gubun: $('.nav-tabs .active a').data('gubun'),
                },
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        return Inven;
    })();

    // Highcharts
    let Chart = (function (Highcharts) {
        let option = {
            title: {
                text: '전사재고 현황 추이 (2015 ~ 2017/06 현재 )'
            },
            yAxis: {
                title: {
                    text: '금액'
                },
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {},
        };

        let Chart = function (target_code = null) {
            this.chart = null;
            this.target_code = target_code;
            this.data = this.get_data();

            this.option = $.extend(option, this.data);
            this.option.title.text = '전사재고 현황 추이 (2015 ~ ' +
                this.data.xAxis.categories[this.data.xAxis.categories.length - 1] +
                '현재 )';

            this.init();
        };

        Chart.prototype = {
            init: function () {
                if (this.chart !== null) {
                    this.chart.destroy();
                }
                this.chart = Highcharts.chart('container', option);
            },
        };

        Chart.prototype.get_data = function () {
            let returnData, self = this;
            $.ajax({
                url: '/inventory/get_chart_data',
                type: 'get',
                async: false,
                dataType: 'JSON',
                data: {
                    target_code: self.target_code,
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Chart;
    })(Highcharts);

    // Highcharts
    (function (Highcharts) {
        let option = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: '전사재고 현황 추이 (2015 ~ 2017/06 현재 )'
            },
            yAxis: {
                title: {
                    text: '금액'
                },
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
        };

        let Chart = function (target_code = null) {
            this.chart = null;
            this.target_code = target_code;
            this.data = this.get_data();

            console.log(this.data);

            let data = [];
            $.each(this.data.series, function () {
                let tmp = {
                    name: this.name,
                    y: this.data[this.data.length - 1],
                };
                data.push(tmp);
            });

            this.data = {
                series: [{
                    name: '금액',
                    colorByPoint: true,
                    data: data,
                }]
            };

            this.option = $.extend(option, this.data);
            this.option.title.text = '부서별 재고 비율/금액';

            this.init();
        };

        Chart.prototype = {
            init: function () {
                if (this.chart !== null) {
                    this.chart.destroy();
                }
                this.chart = Highcharts.chart('container2', option);
            },
        };

        Chart.prototype.get_data = function () {
            let returnData, self = this;
            $.ajax({
                url: '/inventory/get_chart_data',
                type: 'get',
                async: false,
                dataType: 'JSON',
                data: {
                    target_code: self.target_code,
                },
                success: function (data) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Chart;
    })(Highcharts);

    // 페이지 처리
    (function () {
        let inven_table;

        $('input[type="text"]').datetimepicker({
            format: 'YYYY-MM',
            locale: 'ko',
            defaultDate: moment().format('YYYY-MM'),
            minDate: '2017-01',
        });

        $('input[type="text"]').on('dp.change', function () {
            inven_table.destory();
            inven_table = new Inven($('#inven_table'));
        });

        $('a[data-toggle="tab"]').on('click', function (e) {
            e.preventDefault();
            setTimeout(function () {
                inven_table.destory();
                inven_table = new Inven($('#inven_table'));
            }, 100);
        });

        inven_table = new Inven($('#inven_table'));
    })();
});


