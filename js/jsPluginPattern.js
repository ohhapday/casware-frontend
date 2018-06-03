/**
 * Created by 서정석 on 2016/10/27.
 */

/**
 * --------------------------------------------
 * 연결된 스크립트나 다른 플러그인에서 스코프가
 * 제대로 닫혀져 있지 않을 경우를 대비하여 세미콜론을
 * 함수 호출 전에 작성하면 보다 안전해집니다.
 * --------------------------------------------
 */
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
    var pluginName = 'userUpload',
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

        this._init();
        this._initEvent();
    }

    Plugin.prototype._init = function () {
        // 이곳에 초기화 로직을 작성합니다.
        /**
         * ------------------------------------------------------------------
         * 이곳에 초기화 로직을 작성합니다.
         * 여러분은 이미 인스턴스를 통해 DOM 요소, options 을 사용할 수 있습니다.
         * (예. this.element, this.options)
         * ------------------------------------------------------------------
         */
    };

    // 이벤트 초기화
    Plugin.prototype._initEvent = function () {

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