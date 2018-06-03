/* eslint-disable no-undef,no-unused-vars,indent,no-console,no-extra-boolean-cast */
/**
 * Created by 서정석 on 2018/03/06.
 * 글로벌 클레임 권한 확인
 */
define([
    'jquery', 'session', 'myFn', 'app', 'moment',
], function ($, session, myFn, app, moment) {
    'use strict';

    let params = {
        improveDept: [
            'CAS1078', 'CAS1612', 'CAS1061'     // 품질, 중국품질, 경영정보
        ],
        adminUser: [
            '011052', '151036'                  // 안기용, 서정석
        ],
    };

    return (function () {
        let Authority = function (options) {
            this.options = Object.assign({}, options);

            this.data = {
                editStatus: false,
                improveStatus: false,
                adminStatus: false,
                viewStatus: false,
            };
            this.init();
            return this.data;
        };

        Authority.prototype = {
            ...Authority.prototype,
            init() {
                this.data = Object.assign(this.data, {editStatus: this.editStatus()});
                this.data = Object.assign(this.data, {improveStatus: this.improveStatus() || false});
                this.data = Object.assign(this.data, {adminStatus: this.adminStatus() || false});
                if (!!this.options.response_info) {
                    this.data = Object.assign(this.data, {improveCompletedStatus: this.improveCompletedStatus() || false});
                }
                this.data = Object.assign(this.data, {viewStatus: this.viewStatus() || false});
            },
            editStatus() {
                return (this.options.user_code === session.user_code && !this.options.response_info);
            },
            improveStatus() {
                let status = params.improveDept.find(function (value) {
                    return (session.dept_code === value);
                });
                return (!!status && !this.options.response_info);
            },
            adminStatus() {
                let status = params.adminUser.find(function (value) {
                    return (session.user_code === value);
                });
                return !!(status);
            },
            improveCompletedStatus() {
                let status = session.user_code === this.options.response_info.user_code;
                return !!this.options.response_info && status;
            },
            viewStatus() {
                let status1 = params.improveDept.find(function (value) {
                    return (session.dept_code === value);
                });

                let status2 = params.adminUser.find(function (value) {
                    return (session.user_code === value);
                });
                return !!status1 || !!status2;
            }
        };
        return Authority;
    })();
});