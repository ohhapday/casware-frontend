/**
 * Created by 서정석 on 2017/01/16.
 * 결재서류 입력
 */

requirejs([
    'jquery', 'session', 'orgInfo', 'myFn', 'app', 'select2Search',
    'moment', 'ckeditor', 'jquery-slimscroll', 'faloading', 'datetimepicker'
], function ($, session, orgInfo, myFn, app, select2Search,
             moment) {
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
                // 달력
                $('input[name="기안일자"]').datetimepicker({
                    format: 'YYYY-MM-DD',
                    locale: 'ko',
                    defaultDate: moment(),
                });

                CKEDITOR.replace('내용', {
                    width: '100%',
                    height: '500px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });
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

                table.find('td:eq(1)').text(document_number);
                table.find('input[name="기안자"]').val(user_name);
                table.find('input[name="기안부서"]').val(dept_name);
                table.find('input[name="기안일자"]').val(this.data.draft_date);
            },
            doc_contents: function () {
                let table = $('.my-table:eq(2)');
                let aaa = (this.data.draft_value) ?  this.data.draft_value.내용 : '';

                table.find('input:eq(0)').val(this.data.draft_title);
                table.find('textarea').val(aaa);
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
});

