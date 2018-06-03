/**
 * Created by 서정석 on 2016/12/10.
 * Cas 조직도 실행에 필요한 조직내 정적 변수 선언 및 값 생성
 */

define(['jquery', 'moment'], function ($, moment) {
    "use strict";

    var user_info,      // 사원 정보
        dept_info,      // 조직 정보
        key_value,      // 빠른 검색을 위한 Key: value (사원번호: 성명, 조직코드: 조직명)
        flag_change = false;    // 조직도가 변경되었는지 여부

    var dt = JSON.parse(localStorage.getItem('dt')) || '';
    var now = moment().format('YYYY-MM-DD');

    user_info = JSON.parse(localStorage.getItem('user_info')) || '';
    dept_info = JSON.parse(localStorage.getItem('dept_info')) || '';

    // ajax 데이터 로드
    (function () {
        if (moment(now).isBefore(dt) === false) {
            $.ajax({
                async: false,
                url: "/ajax_info/get_cas_info",
                type: "get",
                dataType: 'json',
                data: {},
                success: function (data, status, xhr) {
                    user_info = data.user_info;
                    dept_info = data.dept_info;
                    dt = moment().add(7, 'days').format('YYYY-MM-DD');
                    localStorage.setItem('user_info', JSON.stringify(user_info));
                    localStorage.setItem('dept_info', JSON.stringify(dept_info));
                    localStorage.setItem('dt', JSON.stringify(dt));
                }
            });
        }

        key_value = get_key_value();

        $.each(user_info, function () {
            this.text = this.post + ' ' + this.code_name;
        });

        $.each(dept_info, function () {
            this.text = this.code_name;
        });
    })();

    // key값으로 빠르게 정보 검색(key: 사원번호, value: 값)
    function get_key_value() {
        if (typeof key_value !== 'undefined') {
            return key_value;
        } else {
            var tmp = {}, returnData, returnData1, returnData2;
            $.each(dept_info, function (index, value) {
                tmp[value.id] = "[" + value.parentname + "] " + value.post + " " + value.code_name;
                returnData1 = $.extend({}, tmp);
            });
            $.each(user_info, function (index, value) {
                tmp[value.id] = "[" + value.parentname + "] " + value.post + " " + value.code_name;
                returnData2 = $.extend({}, tmp);
            });
            returnData = $.extend(returnData1, returnData2);
            return returnData;
        }
    }

    function get_user_name(user_code) {
        return user_info.filter(function (item) {
            return item.id === user_code;
        });
    }

    // 사원정보 + 조직정보 Merge
    function get_organization() {
        var returnData = user_info.concat(dept_info);
        return returnData;
    }

    // 사원정보 Select2
    var get_select2_options = function () {
        var returnData = new Array;
        $.each(user_info, function (index) {
            returnData[index] = {
                id: this.id,
                text: "[" + this.parentname + "] " + this.post + " " + this.code_name,
            }
        });
        return returnData;
    }

    return {
        user_info: user_info,
        dept_info: dept_info,
        key_value: key_value,
        flag_change: flag_change,                           // 조직변경 여부

        get_organization: get_organization,                 // 사원정보 + 조직정보 Merge
        get_select2_options: get_select2_options,           // 사원정보 Select2
        get_user_name: get_user_name,                       // 사원 이름
    }
});