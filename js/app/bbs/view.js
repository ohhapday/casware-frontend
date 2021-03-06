/* eslint-disable no-undef,no-unused-vars */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/bbs/comment_v2.js',
    'jquery-slimscroll', 'faloading',
], function ($, session, myFn, app, moment, Comment) {
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

    // 게시판 부분
    let Bbs_view = function () {
        this.options = Object.assign({}, defaults);
        this.data = Object.assign({}, this.get_data());

        this.init();
        this.initEvent();
    };

    Bbs_view.prototype = {
        init: function () {
            this.set_bbs();
            this.setVote();
            this.set_button();
        },
        initEvent: function () {

        },
        set_bbs: function () {
            let bbs_contents = this.data.bbs_contents || null;
            let user = $('.user-panel'),
                img_path = '/approval/user_draft_hr/hr_s/';

            $('.bbs-name').text(this.data.bbs_info.bbs_name);

            user.find('img').attr('src', img_path + bbs_contents.user_code + '.jpg');
            user.find('img').error(function () {
                $(this).attr('src', img_path + 'sample.jpg');
            });

            if (bbs_contents !== null) {
                let title = '';
                if (bbs_contents.category_name !== null) {
                    title += '[' + bbs_contents.category_name + '] ';
                }
                title += bbs_contents.title;
                $('#bbs_box .u-title').html(title);
                $('#bbs_box #contents').html(bbs_contents.contents);

                user.find('.u-name').text(bbs_contents.user_name);
                user.find('.u-dept_name').text(bbs_contents.dept_name);
                user.find('.u-write_date').text(bbs_contents.write_date);
                user.find('.u-count').text(bbs_contents.count);
            }

            this.set_files();
        },
        set_files: function () {
            let file_area = $('#bbs_box .bbs_files'),
                html = '<div><div class="col-sm-8"><a><i class="fa"></i> <span></span></a></div>' +
                    '<div class="col-sm-4 text-right"></div></div>';
            let bbs_files = this.data.bbs_contents.bbs_files || null;

            $.each(bbs_files, function (i) {
                let url = '/common/uploadfile_handle/download/?idx=' + this.idx,
                    clone = $(html).clone(),
                    awesome = myFn.extention.get_awesome(this.original_filename),
                    file_size = ' (' + (this.capacity / 1000).toFixed(1).toLocaleString('en') + ' Kbyte)';

                clone.find('i').addClass(awesome);
                clone.find('a span').text(this.original_filename);
                clone.find('.text-right').text(file_size);
                clone.find('a').attr('href', url);

                file_area.append(clone);
            });

        },
        setVote: function () {
            let self = this;
            let bbs_contents = this.data.bbs_contents || null;
            let $button = $('#bbs_vote button');
            let pop_content = '';

            $('#bbs_vote span').text(bbs_contents.vote.vote_cnt);

            // 추천후
            if (bbs_contents.vote.is_voted === false) {
                $button.on('click', function () {
                    bbs_contents.vote = Object.assign(bbs_contents.vote, self.post_vote());
                    self.setVote();

                    $button.popover({
                        title: '추천',
                        content: '추천해 주셨습니다. <br>감사합니다.',
                        placement: 'right',
                        html: true,
                    });
                    $button.popover('show');
                });
            }
            // 추천전
            else {
                $button.removeClass('btn-default').addClass('bg-purple');
                $button.off('click');
            }
        },
        set_button: function () {
            let self = this;
            // 수정권한
            if (this.check_modify_auth() === true) {
                $('#bbs_box .btn-group').removeClass('hidden');
            }

            $('#bbs_box .btn_print').on('click', function () {
                window.print();
            });

            $('#bbs_box .btn_list').on('click', function () {
                $(window.location).attr('href', '/' + defaults.gubun + '/lists/' + self.options.bbs_idx);
            });

            $('#bbs_box .btn_back').on('click', function () {
                history.back();
            });

            $('#bbs_box .btn_close').on('click', function () {
                window.close();
            });

            $('#bbs_box .btn_modify').on('click', function () {
                $(window.location).attr('href', '/' + defaults.gubun + '/write/' + self.options.bbs_idx + '/' + self.options.idx);
            });

            $('#bbs_box .btn_delete').on('click', function () {
                if (confirm('삭제하시겠습니까?')) {
                    $.ajax({
                        async: false,
                        url: '/bbs/delete',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            idx: self.options.idx,
                        },
                        success: function (data, status, xhr) {
                            alert('삭제되었습니다.');
                            $(window.location).attr('href', '/' + defaults.gubun + '/lists/' + self.options.bbs_idx);
                        }
                    });
                }
            });
        },
        // 수정시 권한 체크
        check_modify_auth: function () {
            let status = true;
            if (this.options.idx !== null) {
                if (this.data.bbs_contents.user_code !== session.user_code) {
                    status = false;
                }
            }

            return status;
        },
    };

    Bbs_view.prototype.get_data = function () {
        let returnData = {};
        $.ajax({
            async: false,
            url: '/bbs/get_bbs_data',
            type: 'get',
            dataType: 'json',
            data: {
                idx: this.options.idx,
                bbs_idx: this.options.bbs_idx
            },
            success: function (data) {
                returnData = Object.assign.call({}, data);
            }
        });
        return returnData;
    };

    Bbs_view.prototype.post_vote = function () {
        let returnData;
        $.ajax({
            async: false,
            url: '/bbs/post_bbs_vote',
            type: 'post',
            dataType: 'json',
            data: {
                idx: this.options.idx,
            },
            success: function (data) {
                returnData = data;
            }
        });
        return returnData;
    };

    new Bbs_view();

    // 댓글 박스
    (function () {
        const bbs_idx = defaults.bbs_idx;
        new Comment({
            art_idx: Number(defaults.idx),
            bbs_idx: bbs_idx,
            obj: '#comment_area',
        });
    })();

});

