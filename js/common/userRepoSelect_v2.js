/**
 * Created by 서정석 on 2016/12/28.
 * 동합문서함 저장소 검색
 */

define([
    'jquery',
], function ($) {
    "use strict";

    // * ------------------------------
    // * defaults 는 한번만 생성합니다.
    var pluginName = 'userRepoSelect',
        defaults = {};
    var html = {
        modal: '\
            <div class="modal modal-info fade madal-repo"> \
                <div class="modal-dialog"> \
                    <form method="post" action=""> \
                        <div class="modal-content"> \
                            <div class="modal-header"> \
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"> \
                                <span aria-hidden="true">×</span></button> \
                                <h4 class="modal-title">통합저장소</h4> \
                            </div> \
                            <div class="modal-body"> \
                                <ul class="text-left" style="padding: 5px 15px 5px 30px; \
                                    box-shadow: 3px 3px 5px #888888; background-color: #3c8dbc"> \
                                    <li>통합저장소는 중복된 문서를 관리하고 회사 문서를 재산화 하기 위한 공간입니다.</li> \
                                    <li>아래 리스트는 생성날짜 기준 최근 1달간 본인이 업로드한 파일입니다. 첨부를 원하는 파일을 선택해 주시기 바랍니다.</li> \
                                </ul> \
                                <div class="form-group"> \
                                    <div class="table-responsive" style="height:200px; overflow-y: auto;"> \
                                        <table class="table table-condensed form_table" \
                                            style="table-layout: auto; box-shadow: 3px 3px 5px #888888;"> \
                                            <colgroup> \
                                                <col style="width: 60%; background-color: whitesmoke;"/> \
                                                <col style="width: 10%; background-color: whitesmoke;"/> \
                                                <col style="width: 10%; background-color: whitesmoke;"/> \
                                            </colgroup> \
                                            <thead> \
                                            <tr> \
                                                <td class="td_title">파일명</td> \
                                                <td class="td_title">파일크기</td> \
                                                <td class="td_title">생성날짜</td> \
                                            </tr> \
                                            </thead> \
                                            <tbody></tbody> \
                                        </table> \
                                    </div> \
                                </div> \
                            </div> \
                            <div class="modal-footer"> \
                                <button type="button" class="btn btn-outline pull-left" data-dismiss="modal">Close</button> \
                                <button type="button" class="btn btn-outline btn_file_attach">첨부하기</button> \
                            </div> \
                        </div> \
                    </form> \
                </div> \
            </div>',
        button: '\
            <div class="btn btn-primary repository-button"> \
                <span>저장소검색...</span> \
                <i class="glyphicon glyphicon-plus"></i> \
                <input type="hidden" name="file_attach_idx" class="file_attach_idx"> \
            </div>',
        files: '<div class="files2" style="font-size: 14px;"></div>',
    }

    function UserRepoSelect() {
    };
    UserRepoSelect.prototype = {
        plugin: {},
        _init: function (self) {
            this.plugin = self;
            // html element 생성
            $(self.element).find('.fileinput-button').after(html.button);
            $(self.element).find('.files').after(html.files);
            var modal = $(self.element).before(html.modal);
            var recent_file = self.options.recent_file, nf = new Intl.NumberFormat(), add_tr;
            $.each(recent_file, function (index) {
                add_tr = '' +
                    '<tr>' +
                    '   <td class="" style="color: #0a0a0a; text-align: left; padding: 5px;">' +
                    '       <label> ' +
                    '           <input type="checkbox" name="file_idx[]" class="minimal" value=' + index + '>' +
                    '            ' + this.original_filename +
                    '       </label>' +
                    '   </td>' +
                    '   <td class="" style="color: #0a0a0a;">' + nf.format(Math.round(this.capacity / 1000)) + ' Kbyte</td>' +
                    '   <td class="" style="color: #0a0a0a;">' + this.format_date + '</td>' +
                    '</tr>' +
                    '';
                $('.modal-dialog table>tbody:last').after(add_tr);
            });
            this._initEvent();
        },
        _initEvent: function () {
            var self = this.plugin;
            var recent_file = self.options.recent_file;
            var $modal = $(self.element).prev();

            // 모달 생성 이벤트
            $(self.element).find('.repository-button').on('click', function () {
                $(self.element).prev().modal("show");
            });

            // 첨부하기 이벤트
            $modal.find('.btn_file_attach').on('click', function () {
                var file_idx = '';
                $modal.find('input[type|="checkbox"]:checked').each(function () {
                    let index = $(this).val();
                    $(self.element).find('.files2').append('' +
                        '<p class="text-left">' +
                        '   <i class="fa fa-file"></i> ' + recent_file[index].original_filename +
                        '</p>');
                    file_idx += recent_file[index].idx + ',';
                });
                file_idx = file_idx.substring(0, file_idx.length - 1);
                $(self.element).find('.file_attach_idx').val(file_idx);
                $modal.modal("hide");
            });
        },
    };

    // * ------------------------------
    // * 실제 플러그인 생성자
    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.recent_files = options.recent_files;

        // 업로드 객체 상속
        var userRepoSelect = Object.create(UserRepoSelect.prototype);
        userRepoSelect._init(this);
    }

    $.fn[pluginName] = function (options) {
        if (!$.isFunction($.fn.userUploadFiles)) {
            alert('userUploadFiles 를 추가해주시기 바랍니다.');
            return false;
        }

        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };
});

