/**
 * Created by 서정석 on 2018/02/27
 * Erp 데이터 추출
 */

define([
    'jquery', 'moment'
], function ($, moment) {
    'use strict';

    // 사원 정보 데이터
    let User_info = (function () {
        let User_info = function () {
        };

        User_info.prototype = {
            ...User_info.prototype,
            get_data(user_code) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/casware_data/get_user_info',
                        data: {
                            user_code,
                        },
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new User_info();
    })();

    // 불량 코드 데이터
    let Symptom_code = (function () {
        let Symptom_code = function () {
        };

        Symptom_code.prototype = {
            ...Symptom_code.prototype,
            get_data() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/casware_data/get_symptom_code',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Symptom_code();
    })();

    // 자재 데이터
    let Defective_code = (function () {
        let Defective_code = function () {
        };

        Defective_code.prototype = {
            ...Defective_code.prototype,
            get_data() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/casware_data/get_defective_code',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Defective_code();
    })();

    // 불량원인 데이터
    let Defective_cause_code = (function () {
        let Defective_cause_code = function () {
        };

        Defective_cause_code.prototype = {
            ...Defective_cause_code.prototype,
            get_data() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/casware_data/get_defective_cause_code',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Defective_cause_code();
    })();

    return {
        User_info,
        Symptom_code,
        Defective_code,
        Defective_cause_code,
    };
});