/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/10/23.
 * 글로벌 커뮤니티 main
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'chartjs',
    'datetimepicker'
], function ($, session, myFn, app, moment, Chart) {
    'use strict';

    // 글로벌 월간 실적
    (function () {
        let userCallback = function (value, index, values) {
            return '￦' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        let chart1;
        let target_date = moment().subtract(60, 'd');

        let config1 = {
            type: 'bar',
            data: {
                datasets: [{
                    type: 'line',
                    borderWidth: 0.1,
                    borderColor: "rgba(124,111,0, 0.3)",
                    backgroundColor: "rgba(255,255,255, 0)",
                    pointBorderColor: "#7C6F00",
                    pointBackgroundColor: "rgba(255,255,143, 1)",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    lineTension: 0.2,
                    yAxisID: "y-axis-2",
                }, {
                    borderWidth: 3,
                    borderColor: "#919192",
                    backgroundColor: "rgba(210, 214, 222, 1)",
                    pointBorderColor: "#3b8bba",
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    fill: true,
                    lineTension: 0.2,
                    yAxisID: "y-axis-1",
                }, {
                    borderWidth: 3,
                    borderColor: "#91521A",
                    backgroundColor: "rgba(250, 121, 7, 1)",
                    pointBorderColor: "#c1c7d1",
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    fill: true,
                    lineTension: 0.2,
                    yAxisID: "y-axis-1",
                }, {
                    borderWidth: 3,
                    borderColor: "#306E92",
                    backgroundColor: "rgba(60,141,188,1)",
                    pointBorderColor: "#c1c7d1",
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    fill: true,
                    lineTension: 0.2,
                    yAxisID: "y-axis-1",
                }]
            },
            options: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'aaaa'
                },
                tooltips: {
                    mode: 'label',
                    callbacks: {}
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            labelString: '일'
                        }
                    }],
                    yAxes: [{
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "left",
                        id: "y-axis-1",
                        ticks: {}
                    }, {
                        type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 120,
                        },
                        // grid line settings
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                    }],
                },
            }
        };

        Chart.defaults.global.responsiveAnimationDuration = 2000;
        Chart.defaults.global.responsive = true;
        Chart.defaults.global.maintainAspectRatio = false;
        Chart.defaults.global.hover = {
            mode: 'dataset'
        };

        function drawchart() {
            let data;
            if (typeof chart1 !== 'undefined') chart1.destroy();

            $.ajax({
                url: '/global_report/ajax_monthly_report/progress',
                type: 'post',
                async: false,
                dataType: 'JSON',
                data: {
                    gubun: 'domestic',
                    year: target_date.format('YYYY'),
                    month: target_date.format('MM'),
                },
                success: function (returnData) {
                    data = returnData;
                }
            });

            // 매출
            config1.data.labels = data.labels;
            $.each(config1.data.datasets, function (index, dataset) {
                config1.data.datasets[index].label = data.acc[index].label;
                config1.data.datasets[index].data = data.acc[index].data;
            });
            let ctx1 = $("#sales_canvas").get(0).getContext("2d");
            chart1 = new Chart(ctx1, config1);
        }

        let year = target_date.format('YYYY');
        let month = target_date.format('MM');

        config1.options.title.text = "ACCUMULATIVE LOCAL SALES_Y" + year + "_M" + month;
        config1.options.tooltips.callbacks.label = function (tooltipItem, data) {
            if (tooltipItem.yLabel > 150) {
                return tooltipItem.yLabel.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else {
                return '달성률 : ' + tooltipItem.yLabel.toFixed(0) + '%';
            }
        };
        config1.options.scales.yAxes[0].ticks.userCallback = function (value, index, values) {
            return '$' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };
        config1.options.scales.yAxes[1].ticks.userCallback = function (value, index, values) {
            return value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '%';
        };

        drawchart();

        // 월 선택
        $('#target_date').datetimepicker({
            defaultDate: target_date,
            format: 'YYYY-MM',
            locale: 'ko',
            minDate: '2016-01',
        });

        $('#target_date').on('dp.update', function (e) {
            target_date = e.date;
            drawchart();
        });

        // 타이틀 툴 버튼
        $('#box-global_report .fa-pencil').parent().on('click', function () {
            window.open(`/global_monthly_report/${target_date.format('YYYY-MM')}`);
        });
    })();
});