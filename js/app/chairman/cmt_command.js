/* eslint-disable no-undef,no-unused-vars,quotes */

/**
 * Created by 서정석 on 2017/12/05.
 * 코멘트 지시 view
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    'datatables.net', 'dataTables-bootstrap',
], function ($, session, myFn, app, moment) {
    'use strict';

    // 테이블 생성
    (function () {
        let columns = [
            {
                data: 'idx', width: '100%',
                render: function (data, type, row, meta) {
                    let cmt = JSON.parse(
                        row.grp_cmt.replace(/\r\n|\n/g, '<br>')
                    );

                    let html_add = '';
                    $.each(cmt, function () {
                        html_add += `
                            <div class="info-box-content">
                                <span class="info-box-text">${this.cmt}</span>
                                <span class="info-box-number">${moment.unix(this.timestamp).format('YYYY-MM-DD HH:mm')}</span>
                            </div>
                            <div style="border-bottom: solid 1px #CCCCCC;"></div>
                        `;
                    });

                    let html = `
                        <div>
                            <div class="box-line">
                                <h4>
                                    <span class="badge bg-blue">${row.gubun_name}</span> 
                                    <span>${row.title}</span>
                                </h4>
                                <p>
                                    <span class="u-name" style="margin-left: 20px;">
                                         수신: ${row.to_user_name}
                                    </span>
                                </p>
                            </div>
                            <div class="row">
                                <div class="col-sm-10">
                                    <div class="info-box">
                                        ${html_add}
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <button type="button" class="btn btn-block btn-warning btn-flat"
                                        data-idx="${row.idx}">완료</button>
                                    <a href="${row.link}" target="_blank" class="btn btn-block btn-default btn-flat">상세보기</a>
                                </div>
                            </div>
                        </div>
                    `;

                    return html;
                }
            },
        ];

        let myTable = $('#bbs_lists_table').DataTable({
            ajax: {
                url: '/cmt_command/get_lists',
            },
            processing: true,
            serverSide: true,
            paging: true,
            pageLength: 5,
            lengthMenu: [[5, 10, 20, 25, 50], [5, 10, 20, 25, 50]],
            lengthChange: true,
            searching: false,
            // searchDelay: 500,
            // ordering: true,
            // order: [[0, 'desc']],
            // info: true,
            autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json'
            },
            columns: columns,
        });

        $.fn.extend({
            animateCss: function (animationName, callback) {
                let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
                this.addClass('animated ' + animationName).one(animationEnd, function () {
                    $(this).removeClass('animated ' + animationName);
                    if (callback) {
                        callback();
                    }
                });
                return this;
            }
        });

        myTable.on('draw', function () {
            $('#bbs_lists_table .btn-warning').on('click', function () {
                let self = this;
                $.ajax({
                    async: false,
                    url: '/cmt_command/put_completed',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        idx: $(self).data('idx')
                    },
                    success: function (data, status, xhr) {
                        $(self).closest('tr').animateCss('bounceOutRight', function () {
                            $(self).closest('tr').remove();
                            myTable.draw('page');
                        });
                    }
                });
            });
        });
    })();
});
