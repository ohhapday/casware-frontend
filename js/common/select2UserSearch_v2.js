/**
 * Created by 서정석 on 2018/01/26.
 * 조직원 정보 Select2 처리
 */

define([
    'jquery', 'session', 'myFn', 'select2', 'select2-ko',
    // '/dist/js/common/casInfo.js'
], function ($, session, myFn, select2) {

    'use strict';

    let pluginName = 'select2UserSearch',
        defaults = {
            propertyName: 'value'
        };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this._user_select2_options = null;
        this._key_value = null;

        this._init();
        this._initEvent();
    }

    Plugin.prototype = {
        _init: function () {
            let self = this;

            this.getData(function () {
                // 사원/부서 정보
                self._user_select2_options = $.fn.cas.get_user_select2_options();
                self._key_value = $.fn.cas.get_key_value();

                $(self.element).select2({
                    placeholder: '팀명 혹은 성명',
                    data: self._user_select2_options,
                    templateResult: self.formatState,
                    templateSelection: self.formatUserSelection
                });

                $.each(self.options.default_user_code, function (i, value) {
                    $(self.element).append('<option value="' + value + '" selected>' + self._key_value[value] + '</option>');
                });
            });
        },
        _initEvent: function () {

        },
        formatState: function (state) {
            if (!state.id) {
                return state.text;
            }
            let $state = $(
                '<div class="select2-result-repository clearfix">' +
                '   <div class="select2-result-repository__avatar" style="width: 100%; text-align: center">' +
                '       <span class="select2-result-repository__title" style="margin-left: 10px;">' + state.text + '</span>' +
                '   </div>' +
                '</div>'
            );
            return $state;
        },
        formatUserSelection: function (state) {
            return state.text;
        },
        getData: function (callback) {
            $.ajax({
                async: true,
                url: '/dist/js/common/casInfo.js',
                dataType: 'script',
                complete: function (data, status, xhr) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                },
            });
        },
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
});
