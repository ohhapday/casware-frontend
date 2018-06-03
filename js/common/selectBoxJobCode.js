/**
 * Created by 서정석 on 2016/10/27.
 */

/* jshint nomen:false */
/* global define, require, window, document, location, Blob, FormData */

/**
 * --------------------------------------------
 * 연결된 스크립트나 다른 플러그인에서 스코프가
 * 제대로 닫혀져 있지 않을 경우를 대비하여 세미콜론을
 * 함수 호출 전에 작성하면 보다 안전해집니다.
 * --------------------------------------------
 */
;(function ($, window, document, undefined) {
    "use strict";

    /**
     * --------------------------------------------------------------
     * @param undefined
     * 글로벌 전역 변수인 undefined 사용합니다.
     * 단, ES3 에서는 다른 누군가에 의해서 전역 변수인 undefined 를
     * 변경할 수 있기 때문에 실제 undefined 인지 확신할 수 없습니다.
     * ES5 에서 undefined 는 더이상 값을 변경할 수 없습니다.
     * --------------------------------------------------------------
     */

    /**
     * ----------------------------------------------------------------------
     * @param window, document
     * window, document 는 전역 스코프가 아니라 지역스코프에서 사용하도록 설정
     * 이는 프로세스를 조금 더 빠르게 해결하고 능률적으로 minified 할 수 있다.
     * (특히, 해당 플러그인이 자주 참조될 경우에)
     * ----------------------------------------------------------------------
     */

        // * ------------------------------
        // * defaults 는 한번만 생성합니다.
    var pluginName = 'selectBoxJobCode',
        defaults = {
            propertyName: "value"
        },
        html = '' +
            '<select name="job_code_1st" id="job_code_1st" class="form-control input-sm" ' +
            '       style="width: auto;" required> ' +
            '   <option value="">-- 대분류 --</option> ' +
            '</select> ' +
            '<select name="job_code_2nd" id="job_code_2nd" class="form-control input-sm"' +
            '       style="width: auto;" required> ' +
            '   <option value="">-- 상위분류를 선택해주세요. --</option> ' +
            '</select>';

    // 직무분류코드
    var job_code_list;
    $.ajax({
        url: '/code/get_json_job_code',
        type: 'get',
        async: false,
        dateType: 'json',
        success: function (data, status, xhr) {
            job_code_list = JSON.parse(data);
        }
    });

    // * ------------------------------
    // * 실제 플러그인 생성자
    function Plugin(element, options) {
        this.element = element;

        /**
         * ----------------------------------------------------------------
         * 제이쿼리는 두개 또는 그 이상의 객체들을 첫번째 객체에
         * 저장하여 병합,확장할 수 있는 $.extend 유틸리티를 소유하고 있습니다.
         * 일반적으로 첫번째 객체에 {}, 빈 객체를 설정하여
         * 플러그인 인스턴스에 대한 default option(기본옵션)을
         * 변경시키지 않도록 하기 위함입니다.
         * ----------------------------------------------------------------
         */

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;
        this._html = html;
        this._job_code_list = job_code_list;

        // 각 Select Box 객체
        this.$job_code_1st = null;
        this.$job_code_2nd = null;
        this.$job_code_3rd = null;

        this.init();
        this.initEvent();
    }

    Plugin.prototype.init = function () {
        var that = this;
        // 이곳에 초기화 로직을 작성합니다.
        /**
         * ------------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------
         */

        // html 바인드
        $(this.element).html(this._html);

        // 대분류 생성
        $.each(this._job_code_list, function (index, value) {
            $(that.element).children('select:eq(0)').append('' +
                '<option value="' + value.code + '">' + value.code_name + '</option>' +
                '');
        });
    };

    // 이벤트 초기화
    Plugin.prototype.initEvent = function () {
        var that = this;
        this.$job_code_1st = $(this.element).children('#job_code_1st');
        this.$job_code_2nd = $(this.element).children('#job_code_2nd');

        // 대분류 이벤트 초기화
        this.$job_code_1st.change(function () {
            that.change_job_code_1st();
        });
        // 중분류 이벤트 초기화
        this.$job_code_2nd.change(function () {
            that.change_job_code_2nd();
        });

        // 각분류 값 지정
        if (this.options.job_code_1st !== '') {
            this.$job_code_1st.val(this.options.job_code_1st);
            that.change_job_code_1st();
        }
        if (this.options.job_code_2nd !== '') {
            this.$job_code_2nd.val(this.options.job_code_2nd);
            this.change_job_code_2nd();
        }
        if ($(this.element).children('#job_code_3rd')) {
            this.$job_code_3rd = $(this.element).children('#job_code_3rd');
            if (this.options.job_code_3rd !== '') {
                that.$job_code_3rd.val(this.options.job_code_3rd);
            }
        }
    };

    // 중분류 생성
    Plugin.prototype.change_job_code_1st = function () {
        var that = this;

        var index = this.$job_code_1st.find('option').index(this.$job_code_1st.find('option:selected')) - 1;

        this.$job_code_2nd.children('option').remove();
        this.$job_code_2nd.append('<option value="">-- 중분류 --</option>');
        $.each(this._job_code_list[index].sub_menu, function (index, value) {
            that.$job_code_2nd.append('' +
                '<option value="' + value.code + '">' + value.code_name + '</option>' +
                '');
        });
        if (this.$job_code_3rd) {
            this.$job_code_3rd.remove();
        }
    };

    // 소분류 생성
    Plugin.prototype.change_job_code_2nd = function () {
        var that = this;

        var index1 = this.$job_code_1st.find('option').index(this.$job_code_1st.find('option:selected')) - 1;
        var index2 = this.$job_code_2nd.find('option').index(this.$job_code_2nd.find('option:selected')) - 1;

        var obj = this._job_code_list[index1].sub_menu[index2];

        if (this.$job_code_3rd) {
            this.$job_code_3rd.remove();
        }
        if (obj.sub_menu.length > 0) {
            this.$job_code_2nd.after('' +
                '<select name="job_code_3rd" id="job_code_3rd" class="form-control input-sm"' +
                '		style="width: 200px; margin-left: 3px;">' +
                '	<option value="">-- 소분류 --</option>' +
                '</select>');
            this.$job_code_3rd = $(this.element).children('#job_code_3rd');
            $.each(obj.sub_menu, function (index, value) {
                that.$job_code_3rd.append('' +
                    '<option value="' + value.code + '">' + value.code_name + '</option>' +
                    '');
            });
        } else {
            if (this.$job_code_3rd) {
                this.$job_code_3rd.remove();
            }
        }
    };

    /**
     * --------------------------------------------------------------------------
     * 생성자(예. new Plugin()) 주변에 여러개의 인스턴스 생성을 방지하기 위해
     * 가벼운 플러그인 래퍼를 설정합니다.
     * data 메소드를 이용하여 cache 해 두게 됩니다.
     * (한번 생성된 인스턴스는 더이상 같은 인스턴스를 생성하지 않도록 하기 위함입니다.)
     * --------------------------------------------------------------------------
     */
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);