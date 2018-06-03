/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/main_bbs/user_edit_pop.js',                   // 개인정보 변경(결재비밀번호)
    '/dist/js/app/claim/global_claim_authority.js',
    '/dist/js/app/main_bbs/top_menu.js',                        // 탑메뉴
    '/dist/js/app/main_bbs/notification.js',                    // 실시간 알림판
    '/dist/js/app/main_bbs/inwork.js',                          // 출석현황
    '/dist/js/app/main_bbs/pop_new_product/pop_introduce_180201.js',                  // 팝업
    // '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',       // 구글 번역
    'jquery-slimscroll', 'faloading', 'jmarquee',
], function ($, session, myFn, app, moment,
             User_edit_pop,
             Authority) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    (function () {
        $.ajax({
            async: true,
            type: 'GET',
            url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
            dataType: 'script',
            timeout: 1000,
        });
    })();

    let ajax_data;
    let html = {
        board_list: ' \
            <p class="text-light-blue" style="width: 0%; cursor: pointer;"> \
                <span class="p-title" style="width: 85%"></span> \
                <span class="badge bg-gray pull-right" style="color: white;"></span> \
            </p> \
        ',
        movie_list: ' \
            <li><a href="#"></a></li> \
        ',
        marquee_list: ' \
            <li style="cursor: pointer;"> \
                <img src="" alt="User Image" style="width: 66px; height: 77px"> \
                    <a class="users-list-name" href="#"></a> \
                <span class="users-list-date"></span> \
                <span class="users-list-date" style="color: #3c8dbc; font-size: 14px; font-weight: bold;"></span> \
            </li> \
        ',
        new_article: ' \
            <span style="margin-left: 50px; cursor: pointer;"></span> \
        ',
    };

    // ajax Data
    (function () {
        $.ajax({
            async: false,
            url: '/main/get_board',
            type: 'get',
            dataType: 'json',
            success: function (data, status, xhr) {
                ajax_data = data;
            }
        });
    })();

    // 페이지 초기화
    (function () {
        let img_path = '/approval/user_draft_hr/hr_s/';
        $('.user-panel .image img').attr('src', img_path + session.user_code + '.jpg');
        $('.user-panel .image img').error(function () {
            $(this).attr('src', img_path + 'sample.jpg');
        });

        let my_slogan = ajax_data.team_slogan.find(function (item) {
            return item.user_code === session.user_code;
        }) || '입력요망';

        // 개인구호
        $('.user-panel .inner p').text(my_slogan.month_slogan);

        // 개인구호 미입력시 팝업
        if (my_slogan.month_slogan === '미입력') {
            alert('개인구호를 입력해 주시기 바랍니다.');
            window.open('/slogan/view', 'b_view', 'scrollbars=yes,width=800,height=600');
        }

        if (my_slogan.slogan !== '미입력') {
            $('.user-panel .info p').text(my_slogan.month_slogan);
            // $('.user-panel button:eq(0)').text('My Slogan');
        }

        $('.user-panel button:eq(0)').on('click', function () {
            window.open('/slogan/view', 'b_view', 'scrollbars=yes,width=800,height=600');
        });
    })();

    // 정보변경
    (function () {
        let user_edit_pop = null;
        $('.user-panel button:eq(1)').on('click', function () {
            if (user_edit_pop === null) {
                user_edit_pop = new User_edit_pop();
            } else {
                user_edit_pop.init();
            }
        });
    })();

    // 게시물 표시
    (function () {
        // 공지사항, 일반 게시판
        function set_board(option) {
            let $table = $(option.obj_nm);
            let link = option.link || '/bbs';

            $table.find('.fa-pencil').parent().on('click', function () {
                window.open('/bbs/write/' + option.bbs_idx, '', 'scrollbars=yes,width=800,height=600');
            });
            $table.find('.fa-list').parent().on('click', function () {
                window.open('/bbs/lists/' + option.bbs_idx, '', 'scrollbars=yes,width=800,height=600');
            });

            $.each(option.ajax_data, function () {
                let self = this;
                let $tr = $(html.board_list);
                if (option.obj_nm === '#gongji_board') {      // 공지사항만 날짜
                    let datetime = moment(this.datetime).format('MM[-]DD');
                    $tr.children('.p-title').text('[' + datetime + '] ' + this.title);
                } else {
                    $tr.children('.p-title').text(this.title);
                }
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
                    }
                );
                $tr.on('click', function () {
                    let url = link + '/view/' + option.bbs_idx + '/' + self.idx;

                    window.open(url, 'b_view', 'scrollbars=yes,width=800,height=600');
                    $(this).addClass('read-title');
                });
            });
        }

        set_board({
            obj_nm: '#glb_ceo_message',
            bbs_idx: 55,
            ajax_data: ajax_data.board.glb_ceo_message,
        });

        set_board({
            obj_nm: '#glb_branch_news',
            bbs_idx: 52,
            ajax_data: ajax_data.board.glb_branch_news,
        });

        /* set_board({
            obj_nm: '#glb_new_product',
            bbs_idx: 53,
            ajax_data: ajax_data.board.glb_new_product,
        });*/

        set_board({
            obj_nm: '#gongji_board',
            bbs_idx: 13,
            ajax_data: ajax_data.board.gongji,
        });

        set_board({
            obj_nm: '#oversea_board',
            bbs_idx: 14,
            ajax_data: ajax_data.board.oversea,
        });

        set_board({
            obj_nm: '#domestic_board',
            bbs_idx: 15,
            ajax_data: ajax_data.board.domestic,
        });

        set_board({
            obj_nm: '#education_board',
            bbs_idx: 17,
            ajax_data: ajax_data.board.education,
        });

        set_board({
            obj_nm: '#family_board',
            bbs_idx: 18,
            ajax_data: ajax_data.board.family,
        });

        set_board({
            obj_nm: '#comtogether_board',
            bbs_idx: 19,
            ajax_data: ajax_data.board.comtogether,
        });

        set_board({
            obj_nm: '#quality_board',
            bbs_idx: 16,
            ajax_data: ajax_data.board.quality,
            // link: '/popup/q_view.php'
        });

        // 읽은글 히든 처리
        // $('p.read-title:not(#gongji_board p)').hide('slow');
    })();

    // 고객의 소리 (cas.co.kr)
    (function () {
        let cascokr_list = ajax_data.board.cascokr;
        let $table = $('#cascokr');

        $table.find('.fa-list').parent().on('click', function () {
            window.open('/cas_co/egolist.php?bd=2', '', 'scrollbars=yes,width=600,height=700');
        });

        $.each(cascokr_list, function () {
            let self = this,
                $tr = $(html.board_list);

            $tr.children('.p-title').text(this.BD_TITLE);

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
                }
            );
            $tr.on('click', function () {
                // let url = '/cas_co/egoread.php?bd=' + self.CONF_SEQ + '&seq=' + self.BD_SEQ + '&ymd=' + self.YMD;
                let url = '/casbbs/view/' + self.CONF_SEQ + '/' + self.BD_SEQ + '/' + self.YMD;
                window.open(url, '', 'scrollbars=yes,width=800,height=600');
                $(this).addClass('read-title');
                // $(this).hide('slow');
            });
        });
    })();

    // 글로벌 클레임
    (function () {
        let Global_claim = function () {
            this.init();
            this.initEvent();
        };

        Global_claim.prototype = {
            init() {
                this.getData()
                    .then(this.setList);
            },
            initEvent() {
                $('#global_claim').find('.fa-pencil').parent().on('click', function () {
                    let url = '/global_claim/write/';
                    window.open(url, '', 'scrollbars=yes,width=900,height=700');
                });

                $('#global_claim').find('.fa-list').parent().on('click', function () {
                    let url = '/global_claim/lists/';
                    window.open(url, '', 'scrollbars=yes,width=900,height=700');
                });
            },
            setList(data) {
                let self = this;
                let $table = $('#global_claim');

                data.forEach(function (v, i) {
                    let $tr = $(html.board_list);
                    $tr.children('.p-title').text('[' + v.dept_name + '] ' + v.prod_model);
                    if (v.comment_n !== '0') {
                        $tr.children('.badge').text(v.comment_n);
                    }
                    if (v.read === '1') {
                        $tr.addClass('read-title');
                    }
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

    // 국내 클레임 (ERP)
    (function () {
        function set_board(option) {
            let $table = $(option.obj_nm);

            $table.find('.fa-list').parent().on('click', function () {
                window.open('/oci8/' + option.path + '/egolist.php', '', 'scrollbars=yes,width=810,height=700');
            });

            $.each(option.ajax_data, function () {
                let self = this;
                let $tr = $(html.board_list);

                $tr.children('.p-title').text('[' + this.NATNM + '] ' + this.JPMNAM);

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
                    }
                );
                $tr.on('click', function () {
                    let url = '';

                    if (option.obj_nm.indexOf('domestic') > -1) {        // 국내 클레임
                        url = '/oci8/' + option.path + '/egoread.php?ymd=' + self.YMD + '&nat_gub=' + self.NAT_GUB + '&ser_no=' + self.SER_NO;
                    } else {
                        url = '/claim/global_view/' + self.YMD + '/' + self.NAT_GUB + '/' + self.SER_NO;
                    }
                    window.open(url, '', 'scrollbars=yes,width=810,height=700');
                    $(this).addClass('read-title');
                    // $(this).hide('slow');
                });
            });
        }

        set_board({
            obj_nm: '#domestic_claim',
            ajax_data: ajax_data.board.claim.domestic,
            path: 'DomClaim',
        });
    })();

    // 간부 개인구호
    (function () {
        let $table = $('#slogan_board');
        let $ul = $('.marquee ul');
        let slogan_list = ajax_data.slogan;
        let img_path = '/approval/user_draft_hr/hr_s/';
        $table.find('.fa-pencil').parent().on('click', function () {
            window.open('/slogan/view/', '', 'scrollbars=yes,width=800,height=600');
        });
        $table.find('.fa-list').parent().on('click', function () {
            window.open('/popup/evaluate.php?year=2017', '', 'scrollbars=yes,width=995,height=700');
        });

        $.each(slogan_list, function () {
            let $li = $(html.marquee_list);
            $li.find('img').attr('src', img_path + this.user_code + '.jpg');
            $li.find('img').data('user_code', this.user_code);
            $li.find('img').error(function () {
                $(this).attr('src', img_path + 'sample.jpg');
            });

            $li.find('.users-list-name').text(this.dept_name);
            $li.find('.users-list-date:eq(0)').text('[' + this.직책 + '] ' + this.user_name);
            $li.find('.users-list-date:eq(1)').text(this.slogan);

            $ul.append($li);
        });

        // 개인구호 세부사항 팝업
        $table.find('.users-list li').on('click', function () {
            let add_url = moment().format('YYYY/MM/') + $(this).find('img').data('user_code');
            window.open('/slogan/view/' + add_url, '', 'scrollbars=yes,width=800,height=600');
        });

        $('.marquee').marquee({
            duration: 50000,
            gap: 50,
            delayBeforeStart: 0,
            direction: 'left',
            duplicated: true,
            pauseOnHover: true,
        });
    })();

    // 새글 marquee
    (function () {
        let new_article = ajax_data.board.new_article;

        $.each(new_article, function () {
            let self = this,
                $li = $(html.new_article),
                title = decodeURIComponent(this.title).replace(/[+]/g, ' ');
            $li.append('<a style="color: #FFFFFF"></a>');
            $li.find('a').text(title);
            $li.find('a').on('click', function () {
                window.open('/bbs/view/' + self.bbs_idx + '/' + self.article_idx, '', 'scrollbars=yes,width=800,height=600');
            });

            $('#new_article_marquee').append($li);
        });

        $('#new_article_marquee').marquee({
            duration: 30000,
            gap: 50,
            delayBeforeStart: 0,
            direction: 'left',
            duplicated: true,
            pauseOnHover: true,
        });
    })();

    // Google 번역
    (function () {
        // 브라우저 설정 언어 확인
        let userLang = navigator.language || navigator.userLanguage;
        // alert("브라우저 설정 언어 : " + userLang);

        $('.tran_icon').closest('button').on('click', function () {
            let query = '',
                $content = $(this).closest('.box').find('.box-body .p-title');

            $.each($content, function () {
                let text = encodeURI($(this).text());
                query += 'q=' + text + '&';
            });

            $.ajax({
                async: false,
                url: 'https://www.googleapis.com/language/translate/v2?' + query,
                type: 'get',
                dataType: 'json',
                data: {
                    key: 'AIzaSyBL2PJkwQAizd5clhecTd6gFJ142DTtOVI',
                    target: 'en',
                    format: 'text'
                },
                success: function (data, status, xhr) {
                    $.each($content, function (i) {
                        $(this).text(data.data.translations[i].translatedText);
                    });
                }
            });
        });
    })();

    // 채플 배너 처리
    (function () {
        let chapel = ajax_data.chapel;
        let bible = null, c_bible;
        let array_bible = [{
            gubun: 'chapel_reply',
            text: 'CAS Chapel Replay',
            // href: '/cas_movie/reply?idx=' + chapel.idx
        }, {
            gubun: 'chapel_live',
            text: 'CAS Chapel Live',
            href: 'mms://210.108.178.40/CAS_KO_500K'
        }, {
            gubun: 'meeting_live',
            text: 'CAS Monthly Meeting LIVE',
            href: 'mms://210.108.178.40/CAS_KO_500K',
            hrefs: [
                {
                    nation: 'KOR',
                    href: 'mms://210.108.178.40/CAS_KO_500K'
                },
                {
                    nation: 'ENG',
                    href: 'mms://210.108.178.40/CAS_EN_200K'
                },
                {
                    nation: 'CHN',
                    href: 'mms://210.108.178.40/CAS_CH_200K'
                },
                {
                    nation: 'RUS',
                    href: 'mms://210.108.178.40/CAS_RU_200K'
                },
            ]
        }, {
            gubun: 'meeting_reply',
            text: 'CAS Monthly Meeting Replay',
            href: '/cas_movie/meeting_reply?idx=' + chapel.idx
        }];

        c_bible = array_bible.find(function (item) {
            return item.gubun === chapel.gubun;
        });

        $('#chepel_bannar .info-box-text').text(chapel.bannar_live_date);
        $('#chepel_bannar .info-box-number').text(c_bible.text);

        if (chapel.holy_bible && chapel.title && c_bible.gubun.indexOf('chapel_reply') > -1) {
            bible = '(' + chapel.holy_bible + ') ' + chapel.title;
        } else {
            bible = '';
        }
        $('#chepel_bannar .progress-description').text(bible);

        // 채플 배너 클릭
        $('#chepel_bannar object').contents().find('svg').on('click', function () {
            if (c_bible.gubun.indexOf('chapel_reply') > -1) {
                window.open(c_bible.href);
            } else {
                $(location).attr('href', c_bible.href);
            }
        });

        // 채플 라이브 국가별 버튼 생성
        (function () {
            if (c_bible.hasOwnProperty('hrefs')) {
                let box = $('#chepel_bannar .progress-description');
                $.each(c_bible.hrefs, function () {
                    box.append(`
                        <a href="${this.href}" style="margin-left: 15px;">
                            <button class="btn btn-xs btn-flat btn-default">${this.nation}</button>
                        </a>
                    `);
                });
            }
        })();

        // 리뷰 배너 클릭
        $('#review_bannar .info-box-text').text(ajax_data.review.review_date);
        $('#review_bannar object').contents().find('svg').on('click', function () {
            window.open('/cas_movie/reply?gubun=review');
        });
        $('#review_bannar').on('click', function () {
            window.open('/cas_movie/reply?gubun=review');
        }).css('cursor', 'pointer');
    })();

    // 마무리 처리
    (function () {
        // 카스 가족의 기도 열기
        $('.sidebar .pray_cas').on('click', function () {
            window.open('/pray/view', 'b_view', 'scrollbars=yes,width=900,height=700');
        });

        // 목록 열기
        $('.box-header>div:first-child').on('click', function () {
            if ($(this).attr('data-col') === 'true') {
                $(this).attr('data-col', 'false');
                $(this).parent().next().children('p').hide('slow');
            } else {
                $(this).attr('data-col', 'true');
                $(this).parent().next().children('p').show('slow');
            }
        });

        // 왼쪽 메뉴 열기
        $('.navbar-toggle').on('click', function () {
            if ($('.navbar-collapse').hasClass('in')) {
                $('body').removeClass('sidebar-open');
            } else {
                $('body').addClass('sidebar-open');
            }
        });

        // 개인 구호
        $('#slogan-table').parent().slimScroll({
            height: '150',
        });
        $('#slogan-table').closest('.box-body').find('.btn-success').on('click', function () {
            window.open('/slogan/view', 'b_view', 'scrollbars=yes,width=800,height=600');
        });

        // 전사 매출
        (function () {
            $('#sales_report object').contents().find('svg').on('click', function () {
                window.open('/sales_report', '', '');
            });

            let sales_date = moment(ajax_data.sales_report_date.year
                + ajax_data.sales_report_date.month
                + ajax_data.sales_report_date.day);

            // 최근
            $('#sales_report .progress-description div:eq(0)')
                .text(sales_date.format('YYYY년 MM월 DD일'))
                .css('cursor', 'pointer')
                .on('click', function () {
                    window.open('/sales_report', '', '');
                });

            // 지난달 말일
            let prev_date = sales_date.subtract(1, 'months');
            let lastDay = (new Date(prev_date.format('YYYY'), prev_date.format('M'), 0)).getDate();

            $('#sales_report .progress-description div:eq(1)')
                .text(prev_date.format('YYYY년 MM월 ') + lastDay + '일')
                .css('cursor', 'pointer')
                .on('click', function () {
                    window.open('/sales_report/' + prev_date.format('YYYY-MM-') + lastDay, '', '');
                });
        })();

        // 글로벌 매출
        (function () {
            let date = moment();

            $('#global_report object').contents().find('svg').on('click', function () {
                window.open('/global_monthly_report/' + moment().subtract(60, 'd').format('YYYY-MM'), '', '');
            });

            $('#global_report .progress-description div:eq(0)')
                .text(date.subtract(1, 'months').subtract(10, 'd').format('YYYY년 MM월'))               // 40일 이전 데이터
                .css('cursor', 'pointer')
                .on('click', function () {
                    window.open('/global_monthly_report/' + date.format('YYYY-MM'), '', '');
                });

            let clone = date.clone();

            $('#global_report .progress-description div:eq(1)')
                .text(clone.subtract(1, 'months').format('YYYY년 MM월'))
                .css('cursor', 'pointer')
                .on('click', function () {
                    window.open('/global_monthly_report/' + date.format('YYYY-MM'), '', '');
                });
        })();

        // 배너 클릭
        $('a[href="http://www.cas.co.kr"] object').contents().find('svg').on('click', function () {
            window.open('http://www.cas.co.kr', '', '');
        });
        $('a[href="http://www.casgalileo.co.kr/"] object').contents().find('svg').on('click', function () {
            window.open('http://www.casgalileo.co.kr/', '', '');
        });

        $('.content-wrapper').css('min-height', '1400px');

        // 로그아웃 처리
        $('.navbar-right li:last').on('click', function () {
            sessionStorage.clear();
            location.href = '/auth/logout';
        });
        $('.user-panel button:eq(2)').on('click', function () {
            sessionStorage.clear();
            location.href = '/auth/logout';
        });

        // 인사팀 조직도 관리
        if (session.dept_code === 'CAS0600' || session.dept_code === 'CAS1061') {
            $('.nav li:last-child a').attr('href', '/organ/organ_edit.html');
        }

        $('.fa-loading-wrapper').remove();
    })();

    // 상해 물류현황
    (function () {
        let shanghai_pop = null;

        $('#btngroup_etc a:eq(5)').on('click', function () {
            window.open('/ajax/shanghai_pop.php', 'b_view', 'scrollbars=yes,width=800,height=600');
        });
    })();

    // 페이지내 SVG 스타일 변경
    (function () {
        $('object').contents().find('path, polygon').css('fill', 'white');
        $('object').contents().find('svg').css('cursor', 'pointer');
    })();
});

