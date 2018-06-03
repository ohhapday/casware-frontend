/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 출근현황
 */

define([
    'jquery', 'session', 'moment', 'bootstrap', 'icheck',
], function ($, session, moment) {
    'use strict';

    // animation 활성화
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

    // let audio = new Audio('/images/Christmas_2017/Noel_Christmas_carrol.mp3');
    // audio.play();

    let pop_html = `
        <div id="chr_ani">
            <div id="slide_wrapper" class="popup_wrapper popup_wrapper_visible" 
                style="opacity: 1; visibility: visible; position: fixed; overflow: auto; z-index: 100001; width: 100%; 
                    height: 100%; top: -35%; left: 0px; text-align: right; display: block;">
                <div id="slide" class="popup_content"
                    style="opacity: 1; visibility: visible; display: inline-block; outline: none; 
                        text-align: left; position: relative; vertical-align: middle;"
                    data-popup-initialized="true" aria-hidden="false" role="dialog" tabindex="-1">
                    <img src="/images/Christmas_2017/Christmas.png" style="width: 200px;">
                </div>
                <div class="popup_align" style="display: inline-block; vertical-align: middle; height: 100%;"></div>
            </div>
        </div>
    `;

    let Popup = function () {
        this.interval = null;
        this.init();
        this.initEvent();
    };

    Popup.prototype = {
        init: function () {
            let aa = Math.floor(Math.random() * 9 + 1);
            $('body').append(pop_html);
            $('#chr_ani').find('img').attr('src', '/images/Christmas_2017/' + aa + '.png');

            $('#slide_wrapper').animateCss('jello');
            this.interval = setInterval(function () {
                $('#slide_wrapper').animateCss('tada');
            }, 3000);
        },
        initEvent: function () {
            $('#slide_wrapper').on('click', function () {
                let self = this;
                clearInterval(self.interval);
                $(self).animateCss('swing', function () {
                    $(self).animateCss('rubberBand', function () {
                        $('#chr_ani').addClass('hidden');
                        $('#canvas').addClass('hidden');
                    });
                });
            });
        },
    };

    new Popup();
});

