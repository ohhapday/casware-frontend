/* eslint-disable no-undef,no-unused-vars,no-console */
/**
 * Created by 서정석 on 2017/05/24.
 * ES6 테스트 용도
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment'
], function ($, session, myFn, app, moment) {

    const sym = Symbol();
    const sym2 = Symbol();

    let data = {
        [sym]: 'test',
        'aa': 'aaaaaa',
    };

    console.log(data[sym]);
    console.log(data.sym);

    $.ajax({
        async: false,
        url: '/test/get_test',
        type: 'get',
        dataType: 'json',
        data: {
            [sym]: 'test',
            'aa': 'aaaaaa',
        },
        success: function (data, status, xhr) {
            returnData = data;
            console.log(data);
        }
    });
});

