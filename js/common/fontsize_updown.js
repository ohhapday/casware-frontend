define([
    'jquery',
], function ($) {
    'use strict';

    let degree = 100;
    let html = `
        <div class="row" id="my-btn-group">
            <div class="btn-group  btn-group pull-right" role="group">
                <label style="float: left;
                border-top: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                border-left: 1px solid #ddd;
                border-top-left-radius: 3px;
                border-bottom-left-radius: 3px;
                padding: 6px 10px;">
                    FONT
                </label>
                <button type="button" class="btn btn-default">
                    <i class="fa fa-search-plus"></i>
                </button>
                <button type="button" class="btn btn-default">
                    <i class="fa fa-search-minus"></i>
                </button>
            </div>
        </div>
    `;
    $('#contents:eq(0), .contents:eq(0)').before(html);

    $('#my-btn-group button:eq(0)').on('click', function (e) {
        degree += 20;
        if(degree > 200) {
            alert('최대 크기입니다.');
        } else {
            $('#contents:eq(0), .contents:eq(0)').css('font-size', degree + '%');
        }
    });

    $('#my-btn-group button:eq(1)').on('click', function (e) {
        degree -= 20;
        if(degree < 40) {
            alert('최소 크기입니다.');
        } else {
            $('#contents:eq(0), .contents:eq(0)').css('font-size', degree + '%');
        }
    });
});