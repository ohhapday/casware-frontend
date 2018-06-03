/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/10/23.
 * 글로벌 커뮤니티 main
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'datatables.net', 'dataTables-bootstrap',
    'datetimepicker', 'jquery-slimscroll', 'faloading',
    'jqxcore', 'jqxbuttons', 'jqxgrid', 'jqxdata', 'jqxdatatable', 'jqxscrollbar', 'jqxmenu',
    'jqxgrid.sort', 'jqxgrid.aggregates', 'jqxgrid.columnsresize', 'jqxgrid.selection',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 글로벌 월간 리포트
    (function () {
        let target_date = moment().subtract(60, 'd');

        let avg_fn = function (aggregates) {
            let renderstring = '';
            $.each(aggregates, function (key, value) {
                let classname;
                (value.indexOf('-') < 0) ? classname = '' : classname = 'minusCell';
                renderstring += '<div class="' + classname + '" style="font-size: 12px; position: relative; margin: 4px; overflow: hidden;">' + value + '</div>';
            });
            return renderstring;
        };

        // 누계로 실제 계산이 아닌 단순한 평균의 경우 하이라이트 색상 처리
        let avg_dummy_fn = function (aggregates) {
            let renderstring = '';
            $.each(aggregates, function (key, value) {
                let classname;
                (value.indexOf('-') < 0) ? classname = '' : classname = 'minusCell';
                renderstring += '<div class="' + classname + '" style="font-size: 12px; position: relative; margin: 4px; overflow: hidden; background-color: #00a65a">' + value + '</div>';
            });
            return renderstring;
        };

        let theme = 'energyblue';
        let source = {
            datatype: 'json',
            datafields: [
                {name: 'nation'},
                {name: 'review_01_01'},
                {name: 'review_01_02'},
                {name: 'review_01_03'},
                {name: 'review_01_04'},
                {name: 'review_01_05'},
                {name: 'review_01_06'},
                {name: 'review_01_07'},
                {name: 'review_01_08'},
                {name: 'review_01_09'},
                {name: 'review_01_10'},
                {name: 'review_01_11'},
                {name: 'review_01_12'},
                {name: 'review_01_13'},
                {name: 'review_02_01'},
                {name: 'review_02_02'},
                {name: 'review_02_03'},
                {name: 'review_02_04'},
                {name: 'review_02_05'}
            ],
            method: 'get',
            url: '/global_report/ajax_monthly_report/total_report',
            data: {
                year: target_date.format('YYYY'),
                month: target_date.format('MM'),
            },
            root: 'Rows',
            async: false,
            filter: function () {
                $('#jqxgrid').jqxGrid('updatebounddata', 'filter');
            },
            beforeprocessing: function (data) {
                source.totalrecords = data[0].TotalRows;
            }
        };

        let dataAdapter = new $.jqx.dataAdapter(source);

        $('#jqxgrid').jqxGrid({
            source: dataAdapter,
            theme: theme,
            sortable: true,
            columnsresize: true,
            pagermode: "simple",
            width: '100%',
            height: 400,
            showaggregates: false,
            showstatusbar: true,
            // columnsheight: 100,
            selectionmode: 'none',
            columns: [
                {text: '국가', datafield: 'nation', width: '100', align: 'center', cellsAlign: 'center'},
                {
                    text: '목표<br>달성<br>(%)',
                    datafield: 'review_01_01',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '매출<br>신장<br>(%)',
                    datafield: 'review_01_02',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '매출<br>이익<br>(%)',
                    datafield: 'review_01_03',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '판관<br>비<br>(%)',
                    datafield: 'review_01_04',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '인건<br>비<br>(%)',
                    datafield: 'review_01_05',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '영업<br>이익<br>(%)',
                    datafield: 'review_01_06',
                    width: '6%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '재고<br>회전<br>(일)',
                    datafield: 'review_01_07',
                    width: '3%',
                    minwidth: '50',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '장기<br>재고<br>(%)',
                    datafield: 'review_01_08',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '수금<br>달성<br>(%)',
                    datafield: 'review_01_09',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '채권<br>회전<br>(일)',
                    datafield: 'review_01_10',
                    width: '3%',
                    minwidth: '50',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '장기<br>채권<br>(%)',
                    datafield: 'review_01_11',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '최종<br>인원',
                    datafield: 'review_01_12',
                    width: '2%',
                    minwidth: '50',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '인당<br>매출',
                    datafield: 'review_01_13',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'Report',
                    cellsformat: 'c1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: 'FOB<br>달성<br>(%)',
                    datafield: 'review_02_01',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'FOB',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: 'FOB<br>신장<br>(%)',
                    datafield: 'review_02_02',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'FOB',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '본사<br>수금<br>(%)',
                    datafield: 'review_02_03',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'FOB',
                    cellsformat: 'p1',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '본사<br>채권<br>잔액',
                    datafield: 'review_02_04',
                    width: '5%',
                    minwidth: '75',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'FOB',
                    cellsformat: 'c',
                    cellclassname: function (row, column, value, data) {
                        // let v = value.substring(1);
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                },
                {
                    text: '채권<br>증감',
                    datafield: 'review_02_05',
                    width: '5%',
                    minwidth: '60',
                    align: 'center',
                    cellsAlign: 'right',
                    columngroup: 'FOB',
                    cellsformat: 'c',
                    cellclassname: function (row, column, value, data) {
                        if (value < 0) {
                            return "minusCell";
                        }
                    },
                }
            ],
            columngroups: [
                {text: '현지관리 지표', align: 'center', name: 'Report'},
                {text: '본사관련 지표', align: 'center', name: 'FOB'}
            ]
        });

        $("#jqxgrid").on('bindingcomplete', function (event) {
            $('.jqx-grid-header').css('height', '90px');
            $('.jqx-grid-column-header.jqx-grid-column-header-energyblue.jqx-widget-header.jqx-widget-header-energyblue')
                .css('height', '60px');
            $('.jqx-grid-columngroup-header.jqx-grid-columngroup-header-energyblue').css('height', '30px');
        });

        // 월 선택
        $('#target_date').datetimepicker({
            defaultDate: target_date,
            format: 'YYYY-MM',
            locale: 'ko',
            minDate: '2016-01',
        });

        $('#target_date').on("dp.change", function (e) {
            target_date = e.date;
            source.data = {
                year: target_date.format('YYYY'),
                month: target_date.format('MM'),
            };

            dataAdapter = new $.jqx.dataAdapter(source);
            $('#jqxgrid').jqxGrid('updatebounddata');
        });
    })();

    // 타이틀 툴 버튼
    (function () {
        $('#box-global_report .fa-pencil').parent().on('click', function () {
            window.open(`/global_monthly_report/${$('#target_date').val()}`);
        });
    })();
});