/**
 * Created by 서정석 on 2016/11/15.
 * Cas 조직내 정적 변수 선언 및 값 생성
 */


// 사원정보 형식 "[경영정보팀] 과장 서정석"
;(function ($, window, document, undefined) {
    $.fn.cas = {
        cas_info: {
            user_info: null,
            dept_info: null,
            key_value: null,
        },
        _init: function () {
            this.cas_info = $.extend(this.cas_info, this.set_cas_info());
            this.get_user_code();
            this.get_dept_code();
        },
        set_cas_info: function () {
            var returnData;
            $.ajax({
                async: false,
                url: '/ajax_info/get_cas_info',
                type: 'get',
                dataType: 'json',
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        },
        get_user_code: function () {
            $.each(this.cas_info.user_info, function () {
                this.text = this.post + ' ' + this.code_name;
            });
            return this.cas_info.user_info;
        },
        get_dept_code: function () {
            $.each(this.cas_info.dept_info, function () {
                this.text = this.code_name;
            });
            return this.cas_info.dept_info;
        },
        get_user_select2_options: function () {
            var returnData = new Array;
            $.each(this.cas_info.user_info, function (i){
                returnData[i] = {
                    id: this.id,
                    text: '[' + this.parentname + '] ' + this.post + ' ' + this.code_name,
                }
            });
            return returnData;
        },
        // key값으로 빠르게 정보 검색(key: 사원번호, value: 값)
        get_key_value: function () {
            if (this.cas_info.key_value !== null) {
                return this.cas_info.key_value;
            } else {
                var tmp = {}, returnData;
                $.each(this.cas_info.dept_info, function (index, value) {
                    tmp[value.id] = '[' + value.parentname + '] ' + value.post + ' ' + value.code_name;
                    returnData1 = $.extend({}, tmp);
                });
                $.each(this.cas_info.user_info, function (index, value) {
                    tmp[value.id] = '[' + value.parentname + '] ' + value.post + ' ' + value.code_name;
                    returnData2 = $.extend({}, tmp);
                });
                returnData = $.extend(returnData1, returnData2);
                this.cas_info.key_value = returnData;
                return this.cas_info.key_value;
            }
        },
        get_organization: function () {
            var returnData = this.cas_info.user_info.concat(this.cas_info.dept_info);
            return returnData;
        }
    };
    $.fn.cas._init();

})(jQuery, window, document);