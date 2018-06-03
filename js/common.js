/**
 * Created by 서정석 on 2016/05/03.
 */

"use strict";

(function ($) {
    /**
     * 파일업로드시에 파일확인 및 파일사이즈 확인 (구버전)
     * @param selector
     * @constructor 서정석 on 2016/05/03.
     */
    function UpFile(selector) {
        this.$selector = null;

        this.init(selector);
        this.initEvent();
    }

    UpFile.prototype.init = function (selector) {
        this.$selector = $(selector);
    }

    UpFile.prototype.initEvent = function () {
        this.$selector.on('change', function () {
            var context = $('<div/>').appendTo('#files');
            var total_size = null;
            $.each(this.files, function (index, file) {
                var filesize = null;
                if (file.size >= 10000) filesize = ' [' + Math.round(file.size / 1024 / 1024 * 10) / 10 + 'Mbyte]';
                else    filesize = ' [' + Math.round(file.size / 1024) + 'Kbyte]';
                var node = $('<p/>')
                    .append($('<span/>').text(file.name))
                    .append($('<span/>').text(filesize));
                node.appendTo(context);
                total_size += file.size;
            });
            if (total_size > 104857600) {				// 104857600 - 100M이상 업로드 통제
                var str = '<small style="color: #a94442;">파일용량이 초과되었습니다.!</small>';
                var node = $('<p/>').append($('<span/>').html(str));
                node.appendTo(context);
            }
        });
    };

    $.fn.upFile = function () {
        this.each(function () {
            var upFile = new UpFile(this);
        });
        return this;
    }
    /*------------------------------------------------------------------------------*/


    /**
     * 파일업로드 단위 클래스
     * @param selector
     * @param option
     * @constructor 서정석 on 2016/05/29.
     */
    function UploadFile(selector, option) {
        this.$selector = null;
        this.return_data = new Array();     // 외부에서 처리하기 위한 객체
        // Default 옵션
        this.option = {
            'size': 100 * 1024 * 1024,                  // 100 MB
            'url': '',      // 전송할 곳
            'fileType': /(\.|\/)(hwp|doc|docx|pdf|ppt|pptx|xls|xlsx|zip|rar|jpg|png|bmp|gif|jpeg|psd|mp4|wmv|txt|avi)$/i,                           // 전송 파일 타입
            'numberOfFiles': 10,                         // 동시업로드 개수
            'imagePreview': 1,							// 이미지 파일 미리보기
            'file_obj': new Array(),
            'file_count': 0
        };

        // 개발자 참고용
        if ($('#file_info_obj').length == 0) {
            console.log('파일 정보 전달을 위한 #file_info_obj 히든객체가 필요합니다.');
            return;
        }
        if ($('#progress').length == 0) {
            console.log('#Progress 객체가 필요합니다.');
            return;
        }
        if ($('#files').length == 0) {
            console.log('#files 객체가 필요합니다.');
            return;
        }

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    // 외부에서 리턴을 받기위한 함수
    UploadFile.prototype.data_return = function () {
        return this.return_data;
    }

    UploadFile.prototype.init = function (selector, option) {
        this.$selector = $(selector);
        $.extend(this.option, option);
    }

    UploadFile.prototype.initEvent = function () {
        var upfileObj = this;
        var option = this.option;

        this.$selector.fileupload({
            url: option.url,
            acceptFileTypes: option.fileType,
            maxFileSize: option.size,
            dataType: 'json',
            numberOfFiles: option.numberOfFiles,
            autoUpload: false,
            formAcceptCharset: 'utf-8',
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            previewMaxWidth: 100,
            previewMaxHeight: 100,
            previewCrop: true
        }).on('fileuploadadd', function (e, data) {
            var status = 0;
            $.each(option.recent_file, function () {
                if (this.original_filename === data.files[0].name && this.capacity == data.files[0].size) {
                    alert('1달이내에 저장된 동일한 파일이 통합저장소에 존재합니다.\n\n저장소검색을 통해 해당 파일을 선택해 주세요.');
                    status = 1;
                }
            });
            if (status) {
                return;
            }

            var numberOfFiles = $(this).data("blueimp-fileupload").options.numberOfFiles;
            if (option.file_count > numberOfFiles - 1) {
                alert('업로드 개수는 ' + numberOfFiles + '개 이하입니다.');
                return false;
            }
            data.context = $('<div/>').appendTo('#files');
            $.each(data.files, function (index, file) {
                var node = $('<p/>')
                    .append($('<span/>').text(file.name));
                node.appendTo(data.context);
            });
            if (data.files.error) {
                data.files = null;
            } else {
                upfileObj.return_data[option.file_count] = data;
            }
            option.file_count++;
        }).on('fileuploadprocessalways', function (e, data) {
            var numberOfFiles = $(this).data("blueimp-fileupload").options.numberOfFiles;
            if (option.file_count > numberOfFiles) {
                e.stopImmediatePropagation();
                return;
            }
            try {
                var index = data.index,
                    file = data.files[index],
                    node = $(data.context.children()[index]);

                if (option.imagePreview) {		//이미지 미리보기 처리
                    if (file.preview) {
                        node
                            .prepend('<br>')
                            .prepend(file.preview);
                    }
                }
                if (file.error) {
                    node
                        .append('<br>')
                        .append($('<span class="text-danger"/>').text(file.error));
                    upfileObj.return_data.splice(option.file_count, 1);
                    option.file_count--;
                }
            } catch (exception) {
                console.log(exception);
            }
        }).on('fileuploadprogressall', function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }).on('fileuploaddone', function (e, data) {
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
                option.file_obj.push(data.result.files[0]);
                if (option.file_obj.length == option.file_count) {
                    $('#file_info_obj').val(JSON.stringify(option.file_obj));
                    return true;
                }
            } catch (exception) {
                alert('파일업로드 에러. 경영정보팀으로 문의하세요.')
                return;
            }
        });
    }

    /**
     * 파일업로드 객체 호출
     * @param upload_opt
     * @returns {jQuery}
     */
    $.fn.upFileUnit = function (upload_opt) {
        this.each(function (index) {
            var upFile = new UploadFile(this, upload_opt);
            $(this).data('upFile', upFile);
        });
        return this;
    }


    /*------------------------------------------------------------------------------*/
    function mySelect2RemoteUsercode(selector, option) {
        this.$selector = null;
        // Default 옵션
        this.option = {
            placeholder: '팀명 혹은 성명을 입력해 주세요.',
            language: "ko",
            allowClear: true,
            url: "/ajax_common/select2_remote_usercode",
            minimumInputLength: 1
        };

        // ajax 처리후 view 처리
        this.formatUser = function (repo) {
            if (repo.loading) return repo.text;
            var markup = "" +
                "<div class='select2-result-repository clearfix'>" +
                "   <div class='select2-result-repository__avatar' style='width: 100%; text-align: center'>" +
                "       <img src='" + repo.avatar_url + "' style='width: 45px; height: 60px;' class='img-rounded' align='left' />" +
                "       <span class='select2-result-repository__title' style='margin-left: 10px;'>" + repo.full_name + "</span>" +
                "   </div>" +
                "</div>";
            return markup;
        }

        // select 했을때
        this.formatUserSelection = function (repo) {
            return repo.full_name || repo.text;
        }

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    mySelect2RemoteUsercode.prototype.init = function (selector, option) {
        this.$selector = $(selector);
        $.extend(this.option, option);
    }

    mySelect2RemoteUsercode.prototype.initEvent = function () {
        let that = this;
        this.$selector.select2({
            placeholder: this.option.placeholder,
            language: this.option.language,
            allowClear: this.option.allowClear,
            minimumInputLength: this.option.minimumInputLength,
            ajax: {
                url: this.option.url,
                dataType: 'json',
                delay: 500,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        page: params.page
                    };
                },
                processResults: function (data, params) {
                    /*console.log(that.$selector);
                     that.$selector.find('.select2-search__field').blur();*/
                    // console.log($(this).get(0).container.dropdown.$search.get(0));
                    $(this).get(0).container.dropdown.$search.get(0).blur();
                    params.page = params.page || 1;
                    return {
                        results: data.items,
                        pagination: {
                            more: (params.page * 30) < data.total_count
                        }
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            templateResult: this.formatUser, // omitted for brevity, see the source of this page
            templateSelection: this.formatUserSelection // omitted for brevity, see the source of this page
        });
    }

    /**
     * 사원코드를 원격으로 불러오기 위한 Select2 객체 호출
     * @param option
     * @returns {jQuery}
     * @constructor 서정석 on 2016/07/23.
     */
    $.fn.select2RemoteUsercode = function (option) {
        if (!$.isFunction($.fn.select2)) {
            alert('select2가 준비되지 않았습니다.');
            // return;
        }
        this.each(function (index) {
            var upFile = new mySelect2RemoteUsercode(this, option);
        });
        return this;
    }


    /*------------------------------------------------------------------------------*/
    function mySelect2Usercode(selector, option) {
        this.$selector = null;
        this.select2_options = null;
        // Default 옵션
        this.option = {};

        // 형변환
        this.formatState = function (state) {
            if (!state.id) {
                return state.text;
            }
            var $state = $(
                "<div class='select2-result-repository clearfix'>" +
                "   <div class='select2-result-repository__avatar' style='width: 100%; text-align: center'>" +
                /* 속도 문제로 사진이미지 삭제 (2016-09-18)
                 //				"       <img src='/approval/user_draft_hr/hr_s/" + state.id + ".jpg' style='width: 45px; height: 60px;' class='img-rounded' align='left' />" +
                 */
                "       <span class='select2-result-repository__title' style='margin-left: 10px;'>" + state.text + "</span>" +
                "   </div>" +
                "</div>"
            );
            return $state;
        }

        // 셀렉션
        this.formatUserSelection = function (state) {
            return state.text;
        }

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    mySelect2Usercode.prototype.init = function (selector, option) {
        this.$selector = $(selector);
        $.extend(this.option, option);
    }

    mySelect2Usercode.prototype.initEvent = function () {
        if (!user_select2_options) {
            $.ajax({
                async: false,
                url: "/ajax_common/select2_usercode",
                type: "get",
                dataType: 'json',
                success: function (data, status, xhr) {
                    user_select2_options = data;
                }
            });
        }

        this.$selector.select2({
            placeholder: '팀명 혹은 성명',
            data: user_select2_options,
            templateResult: this.formatState,
            templateSelection: this.formatUserSelection
        });
    }

    /**
     * 사원코드를 Select2 객체 호출
     * @param option
     * @returns {jQuery}
     * @constructor 서정석 on 2016/07/24.
     */
    var user_select2_options = null;
    $.fn.select2Usercode = function (option) {
        if (!$.isFunction($.fn.select2)) {
            alert('select2가 준비되지 않았습니다.');
            return;
        }
        this.each(function (index) {
            var upFile = new mySelect2Usercode(this, option);
        });
        return this;
    }


    /*------------------------------------------------------------------------------*/
    function mySelect2PHPUsercode(selector, option) {
        this.$selector = null;
        this.select2_options = null;
        // Default 옵션
        this.option = {};

        // 형변환
        this.formatState = function (state) {
            if (!state.id) {
                return state.text;
            }
            var $state = $(
                "<div class='select2-result-repository clearfix'>" +
                "   <div class='select2-result-repository__avatar' style='width: 100%; text-align: center'>" +
                "       <span class='select2-result-repository__title' style='margin-left: 10px;'>" + state.text + "</span>" +
                "   </div>" +
                "</div>"
            );
            return $state;
        }

        // 셀렉션
        this.formatUserSelection = function (state) {
            return state.text;
        }

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    mySelect2PHPUsercode.prototype.init = function (selector, option) {
        this.$selector = $(selector);
        $.extend(this.option, option);
    }

    mySelect2PHPUsercode.prototype.initEvent = function () {
        this.$selector.select2({
            placeholder: '팀명 혹은 성명',
            templateResult: this.formatState,
            templateSelection: this.formatUserSelection
        });
    }

    /**
     * 300건 넘어갈 경우 Ajax가 느려서 사원코드를 PHP로 부른후에 Select2 객체 호출
     * @param option
     * @returns {jQuery}
     * @constructor 서정석 on 2016/09/18.
     */
    $.fn.select2PHPUsercode = function (option) {
        if (!$.isFunction($.fn.select2)) {
            alert('select2가 준비되지 않았습니다.');
            //noinspection JSValidateTypes
            return;
        }
        this.each(function (index) {
            var upFile = new mySelect2PHPUsercode(this, option);
        });
        return this;
    }


    /*------------------------------------------------------------------------------*/
    function mySelect2RemoteProductCode(selector, option) {
        this.$selector = null;
        // Default 옵션
        this.option = {
            placeholder: '코드 || 모델명 || 규격 || 단가',
            language: "ko",
            allowClear: true,
            url: "/in_trade/ajax_intertrade/select2_remote_product_code",
//			url: "/ajax_common/select2_remote_usercode",
            minimumInputLength: 2
        };

        // ajax 처리후 view 처리
        this.formatUser = function (repo) {
            if (repo.loading) return repo.text;
            var markup = "" +
                "<div class='select2-result-repository clearfix'>" +
                "   <div class='select2-result-repository__avatar' style='width: 100%; text-align: center'>" +
//				"       <img src='" + repo.avatar_url + "' style='width: 45px; height: 60px;' class='img-rounded' align='left' />" +
                "       <span class='select2-result-repository__title' style='margin-left: 10px;'>[" + repo.full_name + "]</span>" +
                "   </div>" +
                "</div>";
            return markup;
        }

        // select 했을때
        this.formatUserSelection = function (repo) {
            return repo.full_name || repo.text;
        }

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    mySelect2RemoteProductCode.prototype.init = function (selector, option) {
        this.$selector = $(selector);
        $.extend(this.option, option);
    }

    mySelect2RemoteProductCode.prototype.initEvent = function () {
        this.$selector.select2({
            tags: true,
            placeholder: this.option.placeholder,
            language: this.option.language,
            allowClear: this.option.allowClear,
            minimumInputLength: this.option.minimumInputLength,
            ajax: {
                url: this.option.url,
                dataType: 'json',
                delay: 500,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        page: params.page
                    };
                },
                processResults: function (data, params) {
                    $(this).get(0).container.dropdown.$search.get(0).blur();
                    params.page = params.page || 1;
                    return {
                        results: data.items,
                        pagination: {
                            more: (params.page * 30) < data.total_count
                        }
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            templateResult: this.formatUser, // omitted for brevity, see the source of this page
            templateSelection: this.formatUserSelection // omitted for brevity, see the source of this page
        });
    }

    /**
     * 사내거래에서 규격 코드를 원격으로 불러오기 위한 Select2 객체 호출
     * @param option
     * @returns {jQuery}
     * @constructor 서정석 on 2016/07/23.
     */
    $.fn.select2RemoteProductCode = function (option) {
        if (!$.isFunction($.fn.select2)) {
            alert('select2가 준비되지 않았습니다.');
            // return;
        }
        this.each(function (index) {
            var upFile = new mySelect2RemoteProductCode(this, option);
        });
        return this;
    }


    /*------------------------------------------------------------------------------*/
    function myGetJobCode(selector, option) {
        this.$selector = null;		// 대분류
        this.job_code_list = null;
        this.job_code_2nd = null;	// 중분류를 담는 select box
        // Default 옵션
        this.option = {};

        this.init(selector, option);
        this.initEvent(selector, option);
    }

    myGetJobCode.prototype.init = function (selector, option) {
        var that = this;
        this.$selector = $(selector);
        this.job_code_2nd = $(selector).next();
        $.extend(this.option, option);

        $.ajax({
            url: '/code/get_json_job_code',
            type: 'get',
            async: false,
            dateType: 'json',
            success: function (data, status, xhr) {
                that.job_code_list = JSON.parse(data);
            }
        });

        // 대분류
        $.each(this.job_code_list, function (index, value) {
            $(selector).append('' +
                '<option value="' + value.code + '">' + value.code_name + '</option>' +
                '');
        });

        if (this.option.job_code_1st != '') {
            $(selector).val(this.option.job_code_1st);
            that.change_job_code_1st();
        }
    }

    myGetJobCode.prototype.initEvent = function (selector, option) {
        var that = this;
        // 대분류 변경시
        $(selector).change(function () {
            that.change_job_code_1st();
        });
        // 중분류 변경시
        $(this.job_code_2nd).change(function () {
            that.change_job_code_2nd();
        });
    }

    // 중분류 생성
    myGetJobCode.prototype.change_job_code_1st = function () {
        var that = this;
        var index = null;
        index = this.$selector.find('option').index(this.$selector.find('option:selected')) - 1;

        that.job_code_2nd.find('option').remove();
        that.job_code_2nd.append('<option value="">-- 중분류 --</option>');
        $.each(this.job_code_list[index].sub_menu, function (index, value) {
            that.job_code_2nd.append('' +
                '<option value="' + value.code + '">' + value.code_name + '</option>' +
                '');
        });
        if (this.option.job_code_2nd != '') {
            this.job_code_2nd.val(this.option.job_code_2nd);
            this.change_job_code_2nd();
        }
    }

    // 소분류 생성
    myGetJobCode.prototype.change_job_code_2nd = function () {
        var that = this;
        var index1 = this.$selector.find('option').index(this.$selector.find('option:selected')) - 1;
        var index2 = this.job_code_2nd.find('option').index(this.job_code_2nd.find('option:selected')) - 1;

        var obj = this.job_code_list[index1].sub_menu[index2];

        $('#job_code_3rd').remove();
        if (obj.sub_menu.length > 0) {
            this.job_code_2nd.after('' +
                '<select name="job_code_3rd" id="job_code_3rd" class="form-control input-sm"' +
                '		style="width: 200px; margin-left: 3px;">' +
                '	<option value="">-- 소분류 --</option>' +
                '</select>');
            $.each(obj.sub_menu, function (index, value) {
                $('#job_code_3rd').append('' +
                    '<option value="' + value.code + '">' + value.code_name + '</option>' +
                    '');
            });
            if (this.option.job_code_3rd != '') {
                $('#job_code_3rd').val(this.option.job_code_3rd);
            }
        }
    }

    /**
     * 직무코드를 대분류/중분류/소분류로 select 태그에 표시
     * @param option
     * @returns {jQuery}
     * @constructor 서정석 on 2016/09/04.
     */
    $.fn.get_job_code = function (option) {
        this.each(function (index) {
            var my = new myGetJobCode(this, option);
        });
        return this;
    }
})(jQuery)

/**
 1. 모듈 스코프 내에서 사용할 변수 작성
 2. 유틸리티 메소드 작성
 3. DOM 조작 메소드 작성
 4. 이벤트 핸들러 작성
 5. Public 메소드 작성
 http://www.nextree.co.kr/p4150/
 **/