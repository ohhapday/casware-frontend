/* eslint-disable no-undef,no-unused-vars,quotes,no-console,indent */

/**
 * Created by 서정석 on 2017/10/23.
 * 글로벌 커뮤니티 main
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/global/control_sidebar.js',                         // 우측 메뉴바
    '/dist/js/app/global/timezone.js',                                // moment 타임존
    '/dist/js/app/global/report_bar_chart.js',                        // 글로벌 월간 리포트
    '/dist/js/app/main_bbs/pop_new_product/pop_introduce_180201.js',                  // 팝업
], function ($, session, myFn, app, moment, control_sidebar, Timezone) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    $.ajax({
        async: false,
        type: 'GET',
        url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
        dataType: 'script',
        timeout: 1000,
    });

    let defaults = {
        gubun: window.location.pathname.split('/')[1],
        bbs_idx: window.location.pathname.split('/')[3],
        idx: window.location.pathname.split('/')[4] || null,
    };

    let html = {
        box_line: `
            <div class="box-line">
                <a href="#">
                    <h5>
                        <span class="ellipsis text-light-blue" style="width: 90%"></span>
                        <span class="badge bg-yellow pull-right hidden" style="color: white;"></span>
                    </h5>
                </a>
                <p><span class="u-name"></span><span class="u-date"></span></p>
            </div>
            `,
        board_list: ` 
            <p style="width: 0%; cursor: pointer;">
                <span style="width: 85%"></span>
                <span class="badge bg-yellow pull-right" style="color: white;"></span>
            </p> 
            `,
    };

    // 게시판 생성
    (function () {
        let Bbs = function () {
            this.data = Object.assign({}, this.get_data());
            this.tz = new Timezone('Asia/Seoul');

            this.init();
            this.initEvent();
        };

        Bbs.prototype = {
            init: function () {
                this.setBbsList({
                    data: this.data.board.ceo_message,
                    object: $('#bbs_ceo_message'),
                });

                this.setBbsList({
                    data: this.data.board.notice,
                    object: $('#bbs_notice'),
                });

                this.setBbsList({
                    data: this.data.board.skill_support,
                    object: $('#bbs_skill_support'),
                });

                this.setBbsList({
                    data: this.data.board.global_sales_instance,
                    object: $('#bbs_global_sales_instance'),
                });

                this.setBbsList({
                    data: this.data.board.branch_news,
                    object: $('#bbs_branch_news'),
                });

                this.setBbsList({
                    data: this.data.board.sales_instance,
                    object: $('#bbs_sales_instance'),
                });

                this.setBbsList({
                    data: this.data.board.new_product,
                    object: $('#bbs_new_product'),
                });

                // this.setClaim();
            },
            initEvent: function () {
                let self = this;

                $('#btn_korea').on('click', function () {
                    self.tz.setTimeZone('Asia/Seoul');
                    self.tz.getDateObj($('.u-date'));
                    self.tz.getDateObj($('#control-sidebar-home-tab .menu-info p'));
                });

                $('#btn_local').on('click', function () {
                    self.tz.setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                    self.tz.getDateObj($('.u-date'));
                    self.tz.getDateObj($('#control-sidebar-home-tab .menu-info p'));
                });

                $('#btn_america').on('click', function () {
                    self.tz.setTimeZone('America/Los_Angeles');
                    self.tz.getDateObj($('.u-date'));
                    self.tz.getDateObj($('#control-sidebar-home-tab .menu-info p'));
                });

                $('#btn_russia').on('click', function () {
                    self.tz.setTimeZone('Europe/Moscow');
                    self.tz.getDateObj($('.u-date'));
                    self.tz.getDateObj($('#control-sidebar-home-tab .menu-info p'));
                });
            },
            setBbsList: function (option) {
                let obj = option.object,
                    data = option.data,
                    self = this;

                obj.find('.box-title').text(data.bbs_info.eng_name);
                obj.find('.fa-bars').parent().on('click', function () {
                    window.location.href = `/${defaults.gubun}/lists/${data.bbs_info.bbs_idx}`;
                });
                obj.find('.fa-pencil').parent().on('click', function () {
                    window.location.href = `/${defaults.gubun}/write/${data.bbs_info.bbs_idx}`;
                });

                $.each(data.row, function () {
                    let clone = $(html.box_line).clone(true);
                    let title = this.title;

                    if (this.category_name !== null) {
                        title = '[' + this.category_name + '] ' + title;
                    }

                    clone.find('h5 span:eq(0)').text(title);
                    if (this.read === '1') {
                        clone.find('h5 span:eq(0)').removeClass('text-light-blue').addClass('read-title');
                    }

                    clone.find('.u-name').text('[' + this.post_name + '] ' + this.user_name + ' ');

                    let dateTime = `<i>${self.tz.getTimezone(this.insert_date).format('YYYY-MM-DD HH:mm:ss')}</i>`;
                    clone.find('.u-date').html(dateTime);

                    clone.find('a').attr('href', `/${defaults.gubun}/view/${this.bbs_idx}/${this.idx}`);
                    if (this.cmt_cnt > 0) {
                        clone.find('.badge').removeClass('hidden').text(this.cmt_cnt);
                    }

                    obj.find('.box-body').append(clone);
                });
            },
            setClaim: function () {
                let $table = $('#bbs_claim_report');

                let option = {
                    path: 'GlobalClaim',
                    ajax_data: this.data.board.claim.global
                };

                $table.find('.fa-list').parent().on('click', function () {
                    window.open('/oci8/' + option.path + '/egolist.php', '', 'scrollbars=yes,width=810,height=700');
                });

                $.each(option.ajax_data, function () {
                    let self = this;
                    let $tr = $(html.board_list);

                    $tr.children('span:eq(0)').text('[' + this.NATNM + '] ' + this.JPMNAM);

                    if (this.comment_n !== '0') {
                        $tr.children('.badge').text(this.comment_n);
                    }
                    if (this.read === '1') {
                        $tr.addClass('read-title');
                    }
                    $table.find('.box-body').append($tr);
                    $tr.animate({
                        width: '100%'
                    }, {
                        queue: false,
                        duration: 1000
                    });
                    $tr.on('click', function () {
                        let url = '/claim/global_view/' + self.YMD + '/' + self.NAT_GUB + '/' + self.SER_NO;
                        window.open(url, '', 'scrollbars=yes,width=810,height=700');
                        $(this).addClass('read-title');
                    });
                });
            },
        };

        Bbs.prototype.get_data = function () {
            let returnData;
            $.ajax({
                async: false,
                url: '/comm/get_board',
                type: 'get',
                dataType: 'json',
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Bbs();
    })();

    // 글로벌 클레임
    (function () {
        let Global_claim = function () {
            this.init();
            this.initEvent();
            this.tz = null;
        };

        Global_claim.prototype = {
            init() {
                this.getData()
                    .then(this.setList);
            },
            initEvent() {
                $('#bbs_claim_report').find('.fa-pencil').parent().on('click', function () {
                    let url = '/global_claim/write/';
                    window.open(url, '', 'scrollbars=yes,width=900,height=700');
                });

                $('#bbs_claim_report').find('.fa-bars').parent().on('click', function () {
                    let url = '/global_claim/lists/';
                    window.open(url, '', 'scrollbars=yes,width=900,height=700');
                });
            },
            setList(data) {
                let self = this;
                let $table = $('#bbs_claim_report');
                let tz = new Timezone('Asia/Seoul');

                data.forEach(function (v, i) {
                    let $tr = $(html.box_line);
                    $tr.find('h5 span:eq(0)').text('[' + v.dept_name + '] ' + v.prod_model);
                    if (v.comment_n !== '0') {
                        $tr.find('.badge').removeClass('hidden').text(v.comment_n);
                    }
                    if (v.read === '1') {
                        $tr.find('h5 span:eq(0)').removeClass('text-light-blue').addClass('read-title');
                    }

                    $tr.find('.u-name').text('[' + v.post_name + '] ' + v.user_name + ' ');
                    let dateTime = `<i>${tz.getTimezone(v.insert_date).format('YYYY-MM-DD HH:mm:ss')}</i>`;
                    $tr.find('.u-date').html(dateTime);

                    $table.find('.box-body').append($tr);
                    $tr.animate({
                            width: '100%'
                        }, {
                            queue: false,
                            duration: 1000
                        }
                    );

                    $tr.on('click', function () {
                        let url = '/global_claim/view/' + v.idx;
                        window.open(url, '', 'scrollbars=yes,width=900,height=700');
                        $(this).addClass('read-title');
                    });
                });
            },
        };

        Global_claim.prototype = Object.assign(Global_claim.prototype, {
            getData() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/global_claim/get_main_lists',
                        data: {
                            user_code: session.user_code,
                        },
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            }
        });

        new Global_claim();
    })();

    // 우측 사이드바 토글
    (function () {
        let profile = null;
        $('.main-header .fa-bars').parent().on('click', function () {
            if ($('aside').hasClass('control-sidebar-open') !== false) {
                if (profile === null) {
                    profile = new control_sidebar.Profile();
                }
            }
        });
    })();
});