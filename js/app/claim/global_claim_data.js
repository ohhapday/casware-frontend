/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

define([
    'jquery', 'session', 'myFn', 'app', 'moment',
], function ($, session, myFn, app, moment) {
    'use strict';

    let params = {
        dir: window.location.pathname.split('/')[1] || null,
        mode: window.location.pathname.split('/')[2] || null,
        idx: window.location.pathname.split('/')[3] || null,
    };

    // 수정시 데이터 Bind
    let Modify_data = {
        getData() {
            let returnData = null;
            $.ajax({
                async: false, type: 'get', dataType: 'json',
                url: '/global_claim/get_claim_data',
                data: {
                    idx: params.idx
                },
                success: function (data, status, xhr) {
                    returnData = data;
                },
            });
            return returnData;
        }
    };
    return (params.idx) ? Modify_data.getData() : null;
});


