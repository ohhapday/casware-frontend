/**
 * Created by 서정석 on 2017/12/12.
 * 대리점사이트 관리자 main 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/agency/sidebar.js',
    'datatables.net', 'dataTables-bootstrap',
], function ($, session, myFn, app, moment) {
    'use strict';

    (function () {
        $('#box_order .box-header').on('click', function () {
            let self = this;
            $('.box-primary').not(':eq(0)').animateCss('fadeOutDown', function () {
                $(self).closest('.col-md-6').addClass('col-md-12').removeClass('col-md-6');
            });
        });
    })();
});
