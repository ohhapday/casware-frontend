/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2016/12/12.
 * Session 정보
 */

define(['jquery'], function ($) {
    'use strict';

    var session;
    session = JSON.parse(sessionStorage.getItem('session_data')) || null;

    if(session === null){
        // ajax 데이터 로드
        $.ajax({
            async: false,
            url: '/ajax_info/get_session_info',
            type: 'get',
            dataType: 'json',
            success: function (data, status, xhr) {
                session = data;
                sessionStorage.setItem('session_data', JSON.stringify(data));
            }
        });
    }

    return session;
});