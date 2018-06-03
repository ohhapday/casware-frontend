/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/09/12.
 * 우리사주 조합장, 조합이사1, 조합이사2, 감사 투표
 */

define([
    'jquery', 'session', 'myFn', 'moment', 'bootstrap', 'icheck', 'jquery-popup-overlay',
], function ($, session, myFn, moment) {
    'use strict';

    let content = {
        union_head: {
            text: '조합장',
            unit: [{
                name: '김준락',
                user_code: '061032',
            }],
        },
        union_director1: {
            text: '조합이사 1',
            unit: [{
                name: '안창균',
                user_code: '911069',
            }],
        },
        union_director2: {
            text: '조합이사 2',
            unit: [{
                name: '홍의표',
                user_code: '001074',
            }],
        },
        union_auditor: {
            text: '감사',
            unit: [{
                name: '권경만',
                user_code: '091046',
            }],
        },
    };

    let pop_html = `
        <link rel="stylesheet" href="/bower_components/iCheck/skins/all.css">
        <link rel="stylesheet" type="text/css" href="/css/cas.css">
        <div id="stock_vote" class="well">
        <form method="post">
            <div class="row">
                <div class="col-md-12">
                    <div class="box-header bg-blue">
                        (주)카스 우리사주조합 임원선출 투표
                    </div>
                    <div class="box-body">
                        <ul class="text-left bg-yellow" style="font-size: 14px; padding: 5px 15px 5px 30px;
                                box-shadow: 3px 3px 5px #888888;">
                            <li>우리사주조합 조합장 및 임원 후보자에 대해 우리사주 조합원들의 소중한 한표를 부탁드리겠습니다.</li>
                            <li>조합장 1명, 조합이사 2명, 감사 1명 선출</li>
                        </ul>
                        <div style="margin-top: 40px;">
                            <table class="table table-condensed" style="border-collapse: collapse;" id="sheet1" data-calx-identifier="CALX1505191735547">
                                <colgroup>
                                    <col style="width: 20%;">
                                    <col style="width: 25%;">
                                    <col style="width: 15%;">
                                    <col style="width: 15%;">
                                    <col style="width: 15%;">
                                </colgroup>
                                <thead>
                                <tr>
                                    <td class="td_title border_bottom_double">구분</td>
                                    <td class="td_title border_bottom_double">후보자</td>
                                    <td class="td_title border_bottom_double">가(可)</td>
                                    <td class="td_title border_bottom_double">부(不)</td>
                                    <td class="td_title border_bottom_double border_right">비고</td>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="td_title border">조합장</td>
                                    <td class="border text-center">
                                        <div>김준락</div>
                                    </td>
                                    <td class="border text-center">
                                        <div>
                                            <input type="radio" name="조합장" class="minimal" value="true" checked required>
                                        </div>
                                    </td>
                                    <td class="border text-center">
                                        <div>
                                            <input type="radio" name="조합장" class="minimal" value="false" required>
                                        </div>
                                    </td>
                                    <td class="td_title border">단일후보</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            * 우리사주 조합원들께서만 투표하실 수 있습니다.
                        </div>
                    </div>
                </div>
            </div>
    `;
    pop_html += `
            <div class="row">
                <div class="col-md-12">
                    <button type="submit" class="btn btn-primary">투표</button>
                    <button type="button" class="btn btn-primary">집계</button>
                    <button type="button" class="slide_close btn btn-default pull-right">Close</button>
                </div>
            </div>
        </form>
        </div>
    `;

    let Popup = function () {
        this.init();
        this.initEvent();

        myFn.default_init.icheck();
    };

    Popup.prototype = {
        init: function () {
            let html = $(pop_html).clone(true);
            let tr = html.find('tbody tr').clone(true);

            html.find('tbody tr').remove();

            $.each(content, function (key) {
                let li = tr.clone(true);

                li.find('td:eq(0)').text(this.text);
                li.find('td:eq(1) div').text(this.unit[0].name);
                li.find('input[type="radio"]').attr('name', key);
                li.find('input[type="radio"]:eq(0)').attr('value', this.unit[0].user_code);

                html.find('tbody').append(li);
            });

            // 인사팀만 집계 버튼 활성화
            if (session.dept_code !== 'CAS0600') {
                html.find('button.btn-primary:eq(1)').remove();
            }

            $('body').append(html);
            $('#stock_vote').popup({
                autoopen: true,
                blur: false,
            });
        },
        initEvent: function () {
            let self = this;
            // 투표 버튼
            $('#stock_vote button[type="submit"]').on('click', function (e) {
                let form = $('#stock_vote').find('form'),
                    isValid = null, data = {};

                isValid = form[0].checkValidity();
                if (false === isValid) {
                    return;
                }
                e.preventDefault();

                $.each(content, function (key) {
                    let value = $('#stock_vote').find('input[name="' + key + '"]:checked').val();
                    data = {...data, [key]: value};
                });

                self.submit(data);
            });

            // 닫기 버튼
            $('#stock_vote .slide_close').on('click', function () {
                $('#stock_vote').popup('hide');
            });

            // 집계 버튼
            $('#stock_vote button.btn-primary:eq(1)').on('click', function () {
                window.open('/main_contents/empl_stock_vote/lists');
            });
        },
        submit: function (data) {
            $.ajax({
                async: false,
                url: '/main_contents/empl_stock_vote/post_empl_stock_vote',
                type: 'post',
                dataType: 'json',
                data: data,
                success: function (data, status, xhr) {
                    $('#stock_vote').popup('hide');
                    alert('투표가 완료되었습니다.');
                }
            });
        }
    };

    $.ajax({
        async: false,
        url: '/main_contents/empl_stock_vote/check_employ',
        type: 'get',
        dataType: 'json',
        data: {
            user_code: session.user_code
        },
        success: function (data, status, xhr) {
            if (data) {
                new Popup();
            }
        },
    });
});

