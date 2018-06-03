/**
 * Created by 서정석 on 2018/03/20.
 * 부서 정보 데이터
 */

window.define([
    'jquery', 'moment'
], function ($, moment) {
    'use strict';

    let Dept_lists = (function () {
        let Dept_lists = function () {
        };

        Dept_lists.prototype = {
            ...Dept_lists.prototype,
            getData() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/pray/get_dept_lists',
                        success: function (data, status, xhr) {
                            resolve(data);
                        },
                        error(request, status, error) {
                            reject({
                                request, status, error
                            });
                        }
                    });
                });
            },
        };

        return new Dept_lists().getData();
    })();

    return Dept_lists;
});