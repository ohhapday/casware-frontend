/**
 * Created by 서정석 on 2016/10/27.
 * jsPlugin 파일 업로드
 */

;(function ($, window, document, undefined) {

    // * defaults 는 한번만 생성합니다.
    var pluginName = 'userUploadFiles',
        defaults = {
            url: '',
            acceptFileTypes: /(\.|\/)(hwp|doc|docx|pdf|ppt|pptx|xls|xlsx|csv|zip|rar|jpg|png|bmp|gif|jpeg|psd|mp4|wmv|txt|avi)$/i,                           // 전송 파일 타입
            maxFileSize: 100 * 1024 * 1024,                      // 100 MB
            dataType: 'json',
            numberOfFiles: 10,
            autoUpload: false,
            formAcceptCharset: 'utf-8',
            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
            previewMaxWidth: 200,
            previewMaxHeight: 200,
            previewCrop: true,
            imagePreview: 1,							    // 이미지 파일 미리보기
        };

    // 파일업로드 객체를 구성할 Dom 요소
    var html = {
        button: '\
                <div class="btn btn-success fileinput-button"> \
                    <span>Add files...</span> \
                    <input type="file" name="files[]" accept="*/*" multiple> \
                    <i class="glyphicon glyphicon-plus"></i> \
                    <input type="hidden" name="file_info_obj" class="file_info_obj"> \
                </div> \
            ',
        progress: '\
                <div class="progress" style="margin-top: 10px;"> \
                    <div class="progress-bar progress-bar-success"></div> \
                </div> \
            ',
        files: '<div class="files" style="font-size: 14px;"></div>',
        deletable_file: '\
                <p class="text-left"> \
                    <i class="fa fa-file"></i> \
                        <span></span> \
                    <i class="fa fa-fw fa-close text-yellow" style="cursor: pointer"></i> \
                </p>'
    };

    // 첨부파일만 있을때의 생성자 및 함수
    function UserUploadFiles() {
    };
    UserUploadFiles.prototype = {
        plugin: {},
        // 초기화
        _init: function (self) {
            this.plugin = self;
            if (!self.options.url) {
                alert('전송할 Target URL이 필요합니다.');
                return false;
            }
            // html element 생성
            $(self.element).append(html.button);
            $(self.element).append(html.progress);
            $(self.element).append(html.files);
            // 삭제가능 파일 추가
            var i = 0;
            $.each(self.options.deletable_file, function () {
                let deletable_file = html.deletable_file;
                let $el = $(self.element).find('.files').append(deletable_file).children();
                $el.eq(i).children('span').text(this.original_filename);
                $el.eq(i).children('.fa-close').attr('data-idx', this.idx);
                i++;
            });
            this._initEvent();
        },
        // 이벤트 초기화
        _initEvent: function () {
            this._blueimp();            // blueimp fileupload 연결
            this._submit();             // submit 이벤트시 후크
            this._delete_event();       // 파일 삭제 처리
        },
        // blueimp fileupload 연결
        _blueimp: function () {
            var self = this.plugin;
            // 폼 전송때 file 정보를 보관할 배열
            var fileInfo = new Array();

            $(self.element).fileupload(self.options)
                .on('fileuploadadd', function (e, data) {
                    var status = 0;
                    $.each(self.options.recent_file, function () {
                        if (self.original_filename === data.files[0].name && self.capacity == data.files[0].size) {
                            alert('1달이내에 저장된 동일한 파일이 통합저장소에 존재합니다.\n\n저장소검색을 통해 해당 파일을 선택해 주세요.');
                            status = 1;
                        }
                    });
                    if (status) {
                        return false;
                    }

                    var numberOfFiles = self.options.numberOfFiles;
                    if (self.fileCount > numberOfFiles - 1) {
                        alert('업로드 개수는 ' + numberOfFiles + '개 이하입니다.');
                        return false;
                    }

                    data.context = $('<div/>').appendTo($(self.element).children('.files'));
                    $.each(data.files, function (index, file) {
                        var node = $('<p/>').append($('<span/>').text(file.name));
                        node.appendTo(data.context);
                    });
                    if (data.files.error) {
                        data.files = null;
                    } else {
                        self.objFiles.push(data);
                    }
                    self.fileCount++;
                })
                .on('fileuploadprocessalways', function (e, data) {
                    var numberOfFiles = self.options.numberOfFiles;
                    if (self.fileCount > numberOfFiles) {
                        e.stopImmediatePropagation();
                        return;
                    }
                    try {
                        var index = data.index,
                            file = data.files[index],
                            node = $(data.context.children()[index]);

                        if (self.options.imagePreview) {		//이미지 미리보기 처리
                            if (file.preview) {
                                node.prepend('<br>').prepend(file.preview);
                            }
                        }
                        if (file.error) {
                            node.append('<br>').append($('<span class="text-danger"/>').text(file.error));
                            self.objFiles.splice(option.file_count, 1);
                            self.file_count--;
                        }
                    } catch (exception) {
                        console.log(exception);
                    }
                })
                .on('fileuploadprogressall', function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('.progress .progress-bar').css(
                        'width',
                        progress + '%'
                    );
                })
                .on('fileuploaddone', function (e, data) {
                    $.each(data.result.files, function (index, file) {
                        if (file.url) {
                            var link = $('<a>')
                                .attr('target', '_blank')
                                .prop('href', file.url);
                            $(data.context.children()[index])
                                .wrap(link);
                        } else if (file.error) {
                            var error = $('<span class="text-danger"/>').text(file.error);
                            $(data.context.children()[index])
                                .append('<br>')
                                .append(error);
                        }
                    });
                    // 업로드 중지시 예외 처리
                    try {
                        data.result.files[0].original_name = data.files[0].name;
                        fileInfo.push(data.result.files[0]);
                        if (self.objFiles.length == self.fileCount) {
                            $(self.element).find('.file_info_obj').val(JSON.stringify(fileInfo));
                            return true;
                        }
                    } catch (exception) {
                        alert('파일업로드 에러. 경영정보팀으로 문의하세요.')
                        return;
                    }
                });
        },
        // submit 이벤트시 submit 후크
        _submit: function () {
            var plugin = this.plugin;
            var that = this;
            var form = $(plugin.element).parents('form');

            form.submit(function (e) {
                var form = this;
                e.preventDefault();
                // faLoading 처리 (톱니바퀴)
                if (typeof $.fn.faLoading == 'function') {
                    $(plugin.element).parents('.content').faLoading('fa-cog');
                }

                // 직무분류코드 처리
                if (typeof $.fn.selectBoxJobCode == 'function') {
                    that._job_code_validation();
                }

                // 파일 업로드 처리
                var obj = plugin.objFiles;
                if (obj.length != 0) {
                    $.each(obj, function (index) {
                        $(this).submit();
                    });
                    // 파일 업로드 완료후 폼 전송
                    var file_cnt = 0;
                    $(document).ajaxComplete(function () {
                        file_cnt++;
                        if (file_cnt == obj.length) {
                            form.submit();
                        }
                    });
                } else {
                    form.submit();
                }
            });
        },
        // 직무분류코드 있을 경우 전송 Url 변경
        _job_code_validation: function () {
            var plugin = this.plugin;
            var form = $(plugin.element).parents('form');

            if (typeof $.fn.selectBoxJobCode == 'function') {
                let $job_code_1st = form.find('select[name|=job_code_1st]');
                let $job_code_2nd = form.find('select[name|=job_code_2nd]');
                let $job_code_3rd = form.find('select[name|=job_code_3rd]');

                if ($job_code_1st.length > 0) {
                    let job_3rd_val = ($job_code_3rd.length > 0) ? $job_code_3rd.val() + '/' : '';
                    let job_code_list = $job_code_1st.val() + '/' + $job_code_2nd.val() + '/' + job_3rd_val;
                    $(plugin.element).data("blueimp-fileupload").options.url =
                        '/common/uploadfile_handle/up_file?file_path=' + job_code_list;
                }
            }
        },
        // 파일 삭제 처리
        _delete_event: function () {
            var that = this;
            $('.files .fa-close').on('click', function () {
                var obj = $(this).parent();
                var url = '/common/uploadfile_handle/doc_file_delete/';

                // 파일 업로드 개선 이전 프로그램에 대한 대응 처리 (2017년에 삭제 요망)
                if (!that.plugin.options.deletable_file[0].conversion_filename) {
                    url = '/common/uploadfile_handle/prev_file_delete/';
                }

                $.ajax({
                    async: false,
                    url: url,
                    type: "post",
                    data: {
                        idx: $(this).attr('data-idx'),
                    },
                    success: function (data, status, xhr) {
                        obj.fadeOut('slow');
                    }
                });
            });
        },
    };

    // 저장소가 필요할 경우 (상속/확장 예시) - 별도 플러그인 제작 예정
    var bb = Object.create(UserUploadFiles.prototype);
    bb = $.extend(bb, {
        test: function () {
            alert('test2');
        }
    });

    // 저장소가 필요할 경우 - 별도 플러그인 제작 예정
    var userRepoSelect = {
        _init: function () {
        },
        _initEvent: function () {
        },
    };

    // * ------------------------------
    // * 실제 플러그인 생성자
    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.objFiles = new Array();            // 외부에서 처리하기 위한 파일 객체 저장소
        this.fileCount = 0;                     // 업로드할 파일 개수 count

        this._defaults = defaults;
        this._name = pluginName;

        // 업로드 객체 상속
        var userUploadFiles = Object.create(UserUploadFiles.prototype);
        userUploadFiles._init(this);
    }

    $.fn[pluginName] = function (options) {
        if (!$.isFunction($.fn.fileupload)) {
            alert('blueimp.fileupload 를 추가해주시기 바랍니다.');
            return false;
        }

        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
