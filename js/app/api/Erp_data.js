/**
 * Created by 서정석 on 2018/02/27
 * Erp 데이터 추출
 */

define([
    'jquery', 'moment'
], function ($, moment) {
    'use strict';

    // ERP 소분류 데이터
    let Erp_prod_model = (function () {
        let Erp_prod_model = function () {
        };

        Erp_prod_model.prototype = {
            ...Erp_prod_model.prototype,
            get_data() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/erp_data/get_prod_model',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Erp_prod_model();
    })();

    // ERP 국가 데이터
    let Erp_nation = (function () {
        let Erp_nation = function () {
        };

        Erp_nation.prototype = {
            ...Erp_nation.prototype,
            get_data() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/erp_data/get_nation',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Erp_nation();
    })();

    // ERP 바이어 데이터
    let Erp_buyer = (function () {
        let Erp_buyer = function () {
        };

        Erp_buyer.prototype = {
            ...Erp_buyer.prototype,
            get_data(nation_code) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/api/erp_data/get_buyer',
                        data: {
                            nation_code
                        },
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                    });
                });
            },
        };
        return new Erp_buyer();
    })();

    return {
        prod_model: Erp_prod_model,
        nation: Erp_nation,
        buyer: Erp_buyer,
    };
});