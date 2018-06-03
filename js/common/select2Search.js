/**
 * Created by 서정석 on 2016/12/13.
 * Select2 생성 플러그인 (option에 otions 필요)
 * options가 없을 경우 Default 사원정보
 */

define(['jquery', 'select2', 'orgInfo'], function ($, select2, orgInfo) {

    "use strict";

    var pluginName = 'select2Search',
        defaults = {
            option: orgInfo.get_select2_options(),      // 디폴트 : 사원 정보
            placeholder: '팀명 혹은 성명',
            selected: [],
        };

    function get_key_value (option) {
        var tmp = [], returnData;
        $.each(option, function (index, value) {
            tmp[value.id] = value.text;
            returnData = $.extend({}, tmp);
        });
        return returnData;
    }

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        // 빠른 검색을 위해 key, value 형태로 변환
        this.option_key_value = get_key_value(this.options.option);

        this._init();
        this._initEvent();
    }

    Plugin.prototype = {
        _init: function () {
            var self = this;
            $(this.element).select2({
                placeholder: self.options.placeholder,
                data: self.options.option,
                templateResult: self.formatState,
            });

            // 디폴트 기본 Selected
            $.each(self.options.selected, function (i, value) {
                $(self.element).append('<option value="' + value + '" selected>' + self.option_key_value[value] + '</option>');
            });
        },
        _initEvent: function () {
        },
        formatState: function (state) {
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
        },

    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    };

});