/**
 * Created by 서정석 on 2016/11/01.
 */


/**
 * --------------------------------------------
 * 연결된 스크립트나 다른 플러그인에서 스코프가
 * 제대로 닫혀져 있지 않을 경우를 대비하여 세미콜론을
 * 함수 호출 전에 작성하면 보다 안전해집니다.
 * --------------------------------------------
 */

// 사원정보에 대한 Data 미존재시 에러방지를 위해 casinfo.js 로드
// (속도를 위해 가급적 로드하지 말고 html문서에 js 첨부할것!!!!)
;if (!$.fn.hasOwnProperty('cas')) {
    $.ajax({
        async: false,
        url: '/dist/js/common/casInfo.js',
        dataType: 'script'
    });
}

;(function ($, window, document, undefined) {

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
    var pluginName = 'select2UserSearch',
        defaults = {
            propertyName: "value"
        };

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

        this._user_select2_options = null;
        this._key_value = null;

        this._init();
        this._initEvent();
    }

    Plugin.prototype._init = function () {
        var that = this;
        // 이곳에 초기화 로직을 작성합니다.
        /**
         * ------------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------
         */

        // 사원/부서 정보
        this._user_select2_options = $.fn.cas.get_user_select2_options();
        this._key_value = $.fn.cas.get_key_value();

        $(this.element).select2({
            placeholder: '팀명 혹은 성명',
            data: that._user_select2_options,
            templateResult: that.formatState,
            templateSelection: that.formatUserSelection
        });

        // 디폴트 기본 Selected
        $.each(this.options.default_user_code, function (i, value) {
            $(that.element).append('<option value="' + value + '" selected>' + that._key_value[value] + '</option>');
        });
    };

    // 이벤트 초기화
    Plugin.prototype._initEvent = function () {

    };

    // 형변환
    Plugin.prototype.formatState = function (state) {
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
    };

    // 셀렉션
    Plugin.prototype.formatUserSelection = function (state) {
        return state.text;
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
        if (!$.isFunction($.fn.select2)) {
            alert('select2 를 추가해주시기 바랍니다.');
            return false;
        }

        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);