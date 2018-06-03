/* eslint-disable no-undef,no-unused-vars,no-console */
/**
 * Created by 서정석 on 2017/08/18.
 * 합의 및 접수라인 처리
 */

define([
    'jquery', 'session', 'moment', 'bootstrap', 'icheck', 'jquery-popup-overlay',
], function ($, session, moment) {
    'use strict';

    let _html = `
        <div class="hidden" style="position: absolute; right: 0; bottom: 0;">
            <div style="width: 30px; height: 161px; border: 1px solid; display: table; float: left;">
                <p style="display:table-cell; text-align:center; vertical-align:middle;">접<br><br><br>수</p>
            </div>
            <div class="hidden jubsu-draft" style="float: left;">
                <table>
                    <tr>
                        <td style="border-left: 0;">
                            <div class="ellipsis" style="width: 80px;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-left: 0px; height: 100px;"></td>
                    </tr>
                    <tr>
                        <td style="border-left: 0px;"></td>
                    </tr>
                </table>
            </div>
        </div>
    `;

    let Jubsu_line = function (document_no) {
        this.document_no = document_no;
        this.html = null;

        this.data = this.get_data();
        this.init();
    };

    Jubsu_line.prototype = {
        init: function () {
            let jubsu_line = this.data.jubsu_line;
            let jubsu_dept = this.data.jubsu_dept;
            let line = [];
            let html = $(_html).clone(true);

            if (jubsu_line.length > 0) {
                let arr = jubsu_line.reduce(function (result, current) {
                    result[current.agree_member_no] = result[current.agree_member_no] || [];
                    result[current.agree_member_no].push(current);

                    return result;
                }, {});

                $.each(arr, function (key) {
                    let max = this.reduce(function (previous, current) {
                        return previous.draft_line_seq > current.draft_line_seq ? previous : current;
                    });

                    line.push(max);
                });
            } else {
                jubsu_dept.forEach((val, i) => {
                    let aaa = Object.assign(val, {draft_status: 0});
                    line.push(aaa);
                });
            }

            $.each(line, function () {
                let table = html.find('.jubsu-draft:eq(0)').clone(true);
                table.find('td:eq(0) div').text(this.code_name);

                if (this.draft_status === '1') {
                    try {
                        let img_path = '/approval/user_draft_sign/';
                        table.find('td:eq(1)').append('<img style="height: 70px;" />');

                        table.find('img').attr('src', img_path + this.draft_member_no + '.bmp');
                        table.find('img').error(function () {
                            table.find('td:eq(1)').text('결재');
                        });
                    } catch (e) {
                        console.log(e);
                    }
                    table.find('td:eq(2)').text(this.write_date);
                }
                html.append(table);
                table.removeClass('hidden');
            });
            html.removeClass('hidden');
            this.html = html;
        }
    };

    Jubsu_line.prototype = Object.assign(Jubsu_line.prototype, {
        get_data() {
            let returnData;
            $.ajax({
                async: false,
                url: '/approval/prev_draft/get_jubsu_line',
                type: 'get',
                dataType: 'json',
                data: {
                    document_no: this.document_no
                },
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        }
    });

    return Jubsu_line;
});