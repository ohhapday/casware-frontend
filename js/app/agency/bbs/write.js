/* eslint-disable no-undef,no-unused-vars */

/**
 * Created by 서정석 on 2017/09/20.
 * 게시판 write
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'webSpeech',
    'jquery-slimscroll', 'faloading',
    'ckeditor', 'userUploadFiles_v2',
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

    let defaults = {
        bbs_idx: window.location.pathname.split('/')[3],
        idx: window.location.pathname.split('/')[4] || null,
    };

    let Bbs_write = function () {
        this.options = Object.assign({}, defaults);
        this.data = Object.assign(
            {bbs_info: {}, bbs_contents: {}}
            , this.get_data());

        this.init();
        this.initEvent();

        console.log(this.data);
    };

    Bbs_write.prototype = {
        init: function () {
            let bbs_info = this.data.bbs_info;

            CKEDITOR.replace('contents', {
                width: '100%',
                height: '400px',
                filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
            });

            this.set_category();
            this.set_files();

            // 게시판 타이틀 처리
            $('.bbs-name').text(this.data.bbs_info.bbs_name);

            // 수정시 권한 체크
            if (this.check_modify_auth() === true) {
                this.set_bbs();
            } else {
                alert('작성자만 수정 가능합니다.', 'close');
            }
        },
        initEvent: function () {
            // 페이지 나가기 처리
            $(window).on('beforeunload', function () {
                return '';
            });

            $('form').submit(function () {
                $(window).off('beforeunload');
            });
        },
        set_bbs: function () {
            let bbs_contents = this.data.bbs_contents || null;

            if (bbs_contents !== null) {
                $('input[name="title"]').val(bbs_contents.title);
                $('#contents').html(bbs_contents.contents);
            }
        },
        set_files: function () {
            let bbs_info = this.data.bbs_info;
            let bbs_files = null;

            if (this.data.bbs_contents !== null) {
                bbs_files = this.data.bbs_contents.bbs_files;
            }

            $('.fileinput-area').userUploadFiles({
                url: '/common/uploadfile_handle/up_file?path=userfile/' + session.user_code + '/' + bbs_info.bbs_idx,
                deletable_file: bbs_files,
            });
        },
        set_category: function () {
            let category = this.data.bbs_info.category;
            let bbs_contents = this.data.bbs_contents;
            let $box = $('#box-title');

            if (category.length > 1) {
                $box.find('input[name="title"]').parent().removeClass('col-sm-12').addClass('col-sm-9');
                $box.find('select[name="category"]').parent().removeClass('hidden');
                $box.find('select[name="category"]').attr('required', true);

                $.each(category, function () {
                    let option = '<option value="' + this.idx + '">' + this.category_name + '</option>';
                    $box.find('select[name="category"]').append(option);
                });

                if (bbs_contents.hasOwnProperty('category_idx')) {
                    $box.find('select[name="category"]').val(bbs_contents.category_idx);
                }
            }

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

    Bbs_write.prototype.get_data = function () {
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

    new Bbs_write();
});

