/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'moment', 'select2Search',
    'jquery-slimscroll', 'faloading',
    'datetimepicker',
], function ($, session, orgInfo, myFn, app, moment) {
    "use strict";

    let ajax_data = null,
        s_year = location.pathname.split('/')[3] || moment().add(0, 'day').format('YYYY'),
        s_month = location.pathname.split('/')[4] || moment().add(0, 'day').format('MM'),
        s_user_code = location.pathname.split('/')[5] || session.user_code,
        is_editable = false;

    if (s_user_code === session.user_code) {
        is_editable = true;
    }

    if (is_editable === false) {
        let input = $('input, textarea').not(':eq(0)');
        input.attr('readonly', 'true');

        $('.fa-save').parent().attr('disabled', 'true');
    }

    // SET 데이터
    function set_data() {
        if (ajax_data === null) {
            $.ajax({
                async: false,
                url: "/slogan/get_slogan",
                type: "get",
                dataType: "json",
                data: {
                    user_code: s_user_code,
                    s_year: s_year,
                    s_month: s_month,
                },
                success: function (data, status, xhr) {
                    ajax_data = data;
                }
            });
        }
        // User 정보
        (function () {
            let $user = $('.user-panel'),
                $con = $user.find('.form-group .control-label'),
                contents = ajax_data.user_info,
                img_path = '/approval/user_draft_hr/hr_s/';

            $user.find('img').attr('src', img_path + contents.user_code + '.jpg');
            $user.find('img').error(function () {
                $(this).attr('src', img_path + 'sample.jpg');
            });

            $con.eq(1).find('.text-left').text(contents.post_name + ' ' + contents.user_name);
            let str = (contents.dept_1st_name !== null) ? '[' + contents.dept_1st_name + '] ' : '';
            $con.eq(3).find('.text-left').text(str + contents.dept_name);
            if (ajax_data.slogan_month.write_date !== null) {
                $con.eq(5).find('.text-left').text(ajax_data.slogan_month.slogan.write_date);
            }
        })();

        // 방침 및 목표 처리
        (function () {
            let contents = ajax_data.policy,
                task = JSON.parse(contents.task),
                $policy = $('#tab_01 .inner:eq(0)'),
                $goals1 = $('#tab_01 .inner:eq(1)'),
                $goals2 = $('#tab_01 .inner:eq(2)'),
                $ol = $('#tab_01 ol');

            $policy.find('div').text(contents.code_name);
            $policy.find('h3').text(contents.policy);
            $.each(task, function () {
                $ol.append('<li>' + this + '</li>');
            });

            $goals1.find('h3').text(contents.goals.매출목표);
            $goals2.find('h3').text(contents.goals.수금목표);
        })();

        // 년간 구호 처리
        (function () {
            let $widget = $('.year_widget'),
                contents = ajax_data.slogan_year;

            if (contents !== null) {
                $widget.find('input[name|="slogan"]').val(contents.slogan);
                $widget.find('input[name|="slogan"]').data('idx', contents.idx);

                $widget.find('textarea').val(contents.task);
            }

            $('.year_widget:eq(0) .col-sm-4:eq(0)').text(`${s_year}년 개인구호`);
        })();

        // 월간 구호 처리
        (function () {
            let $widget = $('.month_widget:eq(0)'),
                contents = ajax_data.slogan_month;

            if (contents.length !== 0) {
                $widget.find('input[name|="slogan"]').val(contents.slogan);
                $widget.find('input[name|="slogan"]').data('idx', contents.idx);

                $.each(contents.details, function (i) {
                    let $tr = $widget.find('table tbody tr').eq(i),
                        $td = $tr.find('td input');

                    $td.eq(0).val(this.goals);
                    $td.eq(0).data('idx', this.idx);
                    $td.eq(1).val(this.details);
                });
            }

            $widget.find('.col-sm-4:eq(0)').text(`${s_month}월 개인구호`)
        })();

        (function () {
            let $widget = $('.month_widget:eq(1)'),
                contents = ajax_data.slogan_month;

            if (contents.length !== 0) {
                $widget.find('input[name|="slogan"]').val(contents.slogan);
                $widget.find('input[name|="slogan"]').data('idx', contents.idx);

                $.each(contents.details, function (i) {
                    let $tr = $widget.find('table tbody tr').eq(i),
                        $td = $tr.find('td input');

                    $td.eq(0).val(this.goals);
                    $td.eq(0).data('idx', this.idx);
                    $td.eq(1).val(this.details);
                });
            }
        })();

        // 이전달 구호 처리
        (function () {
            let $widget = $('#prev_widget'),
                contents = ajax_data.slogan_prev_month;

            if (contents.length !== 0) {
                $widget.find('input[name|="slogan"]').val(contents.slogan);
                $widget.find('input[name|="slogan"]').data('idx', contents.idx);
                $widget.find('textarea').val(contents.task);

                $.each(contents.details, function (i) {
                    let $tr = $widget.find('table tbody tr').eq(i),
                        $td = $tr.find('td input');

                    $td.eq(0).val(this.goals);
                    $td.eq(0).data('idx', this.idx);
                    $td.eq(1).val(this.evaluate_cmt);
                    $td.eq(2).val(this.weight);
                    $td.eq(3).val(this.evaluate);

                    if ($td.eq(0) !== null) {
                        $td.eq(1).attr('readonly', false);
                        $td.eq(2).attr('readonly', false);
                        $td.eq(3).attr('readonly', false);
                    }
                });
            }
        })();

        // 부서별 개인구호
        (function () {
            let $widget = $('#team_widget'),
                contents = ajax_data.team_slogan,
                tr = $widget.find('tbody tr:eq(0)');

            // JSON Group-By
            contents = contents.reduce(function (result, current, currentIndex) {
                if (result.length === 0 || result[result.length - 1]['user_code'] !== current.user_code) {
                    let goals_copy = (current.goals) ? current.goals.slice() : '';
                    let details_copy = (current.details) ? current.details.slice() : '';

                    result.push(current);

                    result[result.length - 1].goals = [];
                    result[result.length - 1].goals[0] = goals_copy;

                    result[result.length - 1].details = [];
                    result[result.length - 1].details[0] = details_copy;
                } else {
                    result[result.length - 1].goals.push(current.goals);
                    result[result.length - 1].details.push(current.details);
                }

                return result;
            }, []);

            $.each(contents, function (i) {
                let li = tr.clone(true);
                let self = this;

                li.removeClass('hidden');
                $widget.find('tbody').append(li);

                li.find('td:eq(0) div').text(this.code_name);
                li.find('td:eq(1) div').text(this.user_name);
                li.find('td:eq(2) div').text(this.year_slogan);
                li.find('td:eq(3) div').text(this.month_slogan);

                $.each(this.goals, function (j) {
                    if (j === 0) {
                        li.find('td:eq(0)').attr('rowspan', contents[i].goals.length);
                        li.find('td:eq(1)').attr('rowspan', contents[i].goals.length);
                        li.find('td:eq(2)').attr('rowspan', contents[i].goals.length);
                        li.find('td:eq(3)').attr('rowspan', contents[i].goals.length);

                        li.find('td:eq(4) div').text(this);
                        li.find('td:eq(5) div').text(contents[i].details[j]);
                    } else {
                        let li2 = $('<tr><td><div></div></td><td><div></div></td></tr>').clone();

                        li2.find('td:eq(0) div').text(this);
                        li2.find('td:eq(1) div').text(contents[i].details[j]);
                        li.after(li2);
                    }
                });
            });
        })();
    }

    // GET 데이터
    function get_data() {
        let slogan = {
            // 년간 구호
            get_year_slogan: function () {
                let $widget = $('.year_widget');
                return {
                    idx: $widget.find('input[name|="slogan"]').data('idx') || null,
                    slogan: $widget.find('input[name|="slogan"]').val() || null,
                    task: $widget.find('textarea').val() || null,
                    write_date: (ajax_data.slogan_year != null) ? ajax_data.slogan_year.write_date : null,
                }
            },
            // 월간구호 get
            get_month_data: function () {
                let $widget,
                    return_data;

                // 1번째탭과 3번째탭 Value 체크
                if($('.nav-tabs li:eq(0)').hasClass('active') === true) {
                    $widget = $('.month_widget').eq(0);
                } else {
                    $widget = $('.month_widget').eq(1);
                }

                return_data = {
                    idx: $widget.find('input[name|="slogan"]').data('idx'),
                    slogan: $widget.find('input[name|="slogan"]').val(),
                    slogan_details: []
                }

                $.each($widget.find('table tbody tr'), function (i) {
                    return_data.slogan_details[i] = {
                        idx: $(this).find('td input').eq(0).data('idx') || null,
                        goals: $(this).find('td input').eq(0).val() || null,
                        details: $(this).find('td input').eq(1).val() || null,
                        evaluate_cmt: null,
                        weight: null,
                        evaluate: null,
                    }
                });

                return return_data;
            },
            // 이전달 구호 get
            get_prev_month_data: function () {
                let $widget = $('#prev_widget'),
                    $tr = $widget.find('table tbody tr'),
                    return_data;

                return_data = {
                    idx: $widget.find('input[name|="slogan"]').data('idx'),
                    slogan: $widget.find('input[name|="slogan"]').val(),
                    task: $widget.find('textarea').val() || null,
                    evaluate_total: parseFloat($widget.find('tfoot tr input:eq(3)').val()),
                    slogan_details: []
                }

                $.each($tr, function (i) {
                    return_data.slogan_details[i] = {
                        idx: $(this).find('td input').eq(0).data('idx') || null,
                        goals: $(this).find('td input').eq(0).val() || null,
                        evaluate_cmt: $(this).find('td input').eq(1).val() || null,
                        weight: $(this).find('td input').eq(2).val() || null,
                        evaluate: $(this).find('td input').eq(3).val() || null,
                    }
                });

                return return_data;
            },
            check_prev_month_data: function () {
                let $widget = $('#prev_widget'),
                    status = true;             // 상태 변수
                let total = parseInt($widget.find('table tfoot tr td input:eq(2)').val());
                let data = ajax_data.slogan_prev_month.details || null;

                if (total !== 100 && data !== null) {
                    // alert('가중치의 총합을 100[%]로 산정해 주시기 바랍니다.')
                    // status = false;
                }

                return status;
            },
        };

        let data = {
            s_year: s_year,
            s_month: s_month,
            user_info: ajax_data.user_info,
            slogan_year: slogan.get_year_slogan(),
            slogan_month: slogan.get_month_data(),
            slogan_prev_month: slogan.get_prev_month_data(),
            check: slogan.check_prev_month_data()
        }

        return data;
    }

    // PUT 데이터
    function put_data(data) {
        $.ajax({
            async: false,
            url: "/slogan/put_slogan",
            type: "post",
            data: data,
            success: function (data, status, xhr) {
                alert('저장되었습니다.');
                ajax_data = null;
                set_data();
            }
        });
    }

    // 버튼 처리
    (function () {
        $('.fa-print.print1').parent().on('click', function () {
            $('.month_widget').closest('.row').removeClass('hidden-print');
            $('#prev_widget').closest('.row').addClass('hidden-print');
            window.print();
        });

        $('.fa-print.print2').parent().on('click', function () {
            $('#prev_widget').closest('.row').removeClass('hidden-print');
            $('.month_widget').closest('.row').addClass('hidden-print');
            window.print();
        });

        $('.fa-close').parent().on('click', function () {
            window.close();
        });

        // FORM submit
        $('form').on('submit', function (e) {
            e.preventDefault();
            let data = get_data();

            if (data.check) {
                put_data(data);
            }
        });
    })();

    // 가중치 & 평가점수 처리
    (function () {
        set_data();

        let $widget = $('#prev_widget'),
            $tr = $widget.find('table tbody tr'),
            $weight = $tr.find('td input:eq(2)'),
            $evaluate = $tr.find('td input:eq(3)'),
            $sum_tr = $widget.find('table tfoot tr');

        function total() {
            let weight_sum = 0,
                evaluate_sum = 0;

            $.each($tr, function (i) {
                let weight_val = parseFloat($(this).find('td input:eq(2)').val()) || 0,
                    evaluate_val = parseFloat($(this).find('td input:eq(3)').val()) || 0;

                weight_sum += weight_val;
                evaluate_sum += (weight_val * evaluate_val / 100);
            });

            $sum_tr.find('td input:eq(2)').val(weight_sum);
            $sum_tr.find('td input:eq(3)').val(evaluate_sum.toFixed(2));
        }

        $weight.on('change', function () {
            total();
        });

        $evaluate.on('change', function () {
            total();
        });

        total();

    })();

    // 마무리 처리
    (function () {
        let date = moment(s_year + s_month, 'YYYYMM');

        // 년월 선택
        $('#target_date').val(s_year + '-' + s_month);
        $('#target_date').datetimepicker({
            format: 'YYYY-MM',
            locale: 'ko',
        }).on('dp.change', function (e) {
            let date = $('#target_date').val().replace('-', '/');
            let user_code = '/' + $('select[name|="user_name"]').val() || '';

            $(location).attr('href', '/slogan/view/' + date + user_code);
        });

        // 타이틀 변경
        // $('.month_widget input[name|="slogan"]')
//            .attr('placeholder', date.format('MM') + '월 개인구호');
        $('.nav li:eq(3) span').eq(0).text(date.format('MM'));

        $('#prev_widget input[name|="slogan"]')
            .attr('placeholder', date.subtract(1, 'month').format('MM') + '월 개인구호');
        $('.nav li:eq(4) span').eq(0).text(date.format('MM'));

        $('select[name|="user_name"]').select2Search({
            option: orgInfo.get_select2_options(),
            placeholder: '팀명 혹은 성명',
            selected: [s_user_code],
        }).on('select2:select', function (e) {
            let date = $('#target_date').val().replace('-', '/');
            let user_code = '/' + $('select[name|="user_name"]').val() || '';

            $(location).attr('href', '/slogan/view/' + date + user_code);
        });

        // 월 개인구호 수립시 커서 포커스 처리(2017-10-11)
        $('a[href="#tab_03"]').on('shown.bs.tab', function (e) {
            $('#tab_03 input[name="slogan"]').focus();
        });

        // loading
        $(".fa-loading-wrapper").remove();
    })();
});

