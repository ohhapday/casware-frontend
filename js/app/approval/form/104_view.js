/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search', 'moment',
    '/dist/js/app/approval/jubsu_line.js',
    'ckeditor', 'jquery-slimscroll', 'faloading', 'datetimepicker'
], function ($, session, orgInfo, myFn, app, select2Search, moment, Jubsu_line) {
    "use strict";

    // 문서 데이터
    let approval_action = location.pathname.split('/')[3],      // 결재 형태
        document_no = location.pathname.split('/')[4];          // 문서 번호

    let Document = (function () {
        let Document = function () {
            this.data = this.get_data();

            this.init();
            this.initEvent();
        };

        Document.prototype = {
            init: function () {
                this.set_page();
                this.doc_info();
                this.doc_contents();
            },
            initEvent: function () {
            },
            set_page: function () {
            },
            doc_info: function () {
                let table = $('.my-table:eq(0)');
                let document_number = this.data.document_number,
                    user_name,
                    dept_name;

                if (typeof(this.data.draft_user_code) !== 'undefined') {
                    let user_info = orgInfo.get_user_name(this.data.draft_user_code);
                    user_name = user_info[0].code_name;
                    dept_name = user_info[0].parentname;
                }

                table.find('.분류번호').text(document_number);
                table.find('.기안자').text(user_name);
                table.find('.기안부서').text(dept_name);
                table.find('.기안일자').text(this.data.draft_date);
            },
            doc_contents: function () {
                let table = $('.my-table:eq(2)');

                table.find('.제목').text(this.data.draft_title);
                table.find('.내용').html(this.data.draft_value.내용);
            },

        };

        Document.prototype.get_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: "/approval/prev_draft/get_document_data",
                type: "get",
                dataType: "json",
                data: {
                    document_no: document_no
                },
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        new Document();
    })();

    // 접수라인 추가
    (function () {
        let aa = new Jubsu_line(document_no);

        $('.내용').append(aa.html);
    })();
});

