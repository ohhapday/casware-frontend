/**
 * Created by 서정석 on 2016/12/10.
 * 공용 함수 목록
 */

define([
    'jquery', 'bootstrap', 'icheck',
    '/dist/js/common/fontsize_updown.js'
], function ($) {
    'use strict';

    // url에서 Get param 추출 함수
    var getQueryParam = function (param) {
        var result = window.location.search.match(
            new RegExp('(\\?|&)' + param + '(\\[\\])?=([^&]*)')
        );
        return result ? result[3] : false;
    }

    var magnify = function (imgID, zoom) {
        var img, glass, w, h, bw;
        img = document.getElementById(imgID);
        /*create magnifier glass:*/
        glass = document.createElement('DIV');
        glass.setAttribute('class', 'img-magnifier-glass');
        /*insert magnifier glass:*/
        img.parentElement.insertBefore(glass, img);
        /*set background properties for the magnifier glass:*/
        glass.style.backgroundImage = "url('" + img.src + "')";
        glass.style.backgroundRepeat = 'no-repeat';
        glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
        bw = 3;
        w = glass.offsetWidth / 2;
        h = glass.offsetHeight / 2;
        /*execute a function when someone moves the magnifier glass over the image:*/
        glass.addEventListener("mousemove", moveMagnifier);
        img.addEventListener("mousemove", moveMagnifier);
        /*and also for touch screens:*/
        glass.addEventListener("touchmove", moveMagnifier);
        img.addEventListener("touchmove", moveMagnifier);

        function moveMagnifier(e) {
            var pos, x, y;
            /*prevent any other actions that may occur when moving over the image*/
            e.preventDefault();
            /*get the cursor's x and y positions:*/
            pos = getCursorPos(e);
            x = pos.x;
            y = pos.y;
            /*prevent the magnifier glass from being positioned outside the image:*/
            if (x > img.width - (w / zoom)) {
                x = img.width - (w / zoom);
            }
            if (x < w / zoom) {
                x = w / zoom;
            }
            if (y > img.height - (h / zoom)) {
                y = img.height - (h / zoom);
            }
            if (y < h / zoom) {
                y = h / zoom;
            }
            /*set the position of the magnifier glass:*/
            glass.style.left = (x - w) + "px";
            glass.style.top = (y - h) + "px";
            /*display what the magnifier glass "sees":*/
            glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        }

        function getCursorPos(e) {
            var a, x = 0, y = 0;
            e = e || window.event;
            /*get the x and y positions of the image:*/
            a = img.getBoundingClientRect();
            /*calculate the cursor's x and y coordinates, relative to the image:*/
            x = e.pageX - a.left;
            y = e.pageY - a.top;
            /*consider any page scrolling:*/
            x = x - window.pageXOffset;
            y = y - window.pageYOffset;
            return {x: x, y: y};
        }
    }

    // RGB 코드를 헥사코드로 변환
    var RgbHex = {
        hexDigits: new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
        rgb2hex: function (rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return '#' + this.hex(rgb[1]) + this.hex(rgb[2]) + this.hex(rgb[3]);
        },
        hex: function (x) {
            return isNaN(x) ? '00' : this.hexDigits[(x - x % 16) / 16] + this.hexDigits[x % 16];
        }
    }

    // HTML 문서 초기화 자동 실행
    var default_init = {
        _init: function () {
            this.icheck();
            window.alert = this.alert;

            // 마무리 처리
            (function () {
                $('.fa-loading-wrapper').remove();
            })();
        },
        icheck: function () {
            //iCheck for checkbox and radio inputs
            $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
                checkboxClass: 'icheckbox_square-blue',
                radioClass: 'iradio_square-blue'
            });
            //Red color scheme for iCheck
            $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
                checkboxClass: 'icheckbox_square-red',
                radioClass: 'iradio_square-red'
            });
            //Flat red color scheme for iCheck
            $('input[type="checkbox"].minimal-green, input[type="radio"].minimal-green').iCheck({
                checkboxClass: 'icheckbox_square-green',
                radioClass: 'iradio_square-green'
            });
        },
        alert: function (message, action, url) {
            var html = ' \
                <div class="modal alert fade" id="my_alert"> \
                    <div class="modal-dialog"> \
                        <div class="modal-content" style="border-radius: 4px; margin: 0 auto"> \
                            <div class="alert alert-info alert-dismissible"> \
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> \
                                <h4><i class="icon fa fa-info"></i> Notice</h4> \
                                <span></span> \
                            </div> \
                        </div> \
                    </div> \
                </div>';

            if ($('#my_alert.modal .alert').length == 0) {
                $('body').append(html);
            }

            $('#my_alert.modal .alert .modal-content').width(400);
            $('#my_alert.modal .alert span').html(message);
            $('#my_alert.modal').modal('show');

            setTimeout(function () {
                $('#my_alert.modal').modal('hide');
            }, 5000);

            if (action === 'close') {
                setTimeout(function () {
                    window.close();
                }, 1000);
            }

            if (url) {
                setTimeout(function () {
                    $(location).attr('href', url);
                }, 2000);
            }
        },
    };

    // 파일 확장자 관련 함수
    var extention = {
        ext: {
            word: ['doc', 'docx'],
            powerpoint: ['ppt', 'pptx'],
            excel: ['xls', 'xlsx', 'csv'],
            archive: ['zip', 'rar'],
            picture: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'psd'],
            video: ['mp4', 'wmv', 'avi'],
            pdf: ['pdf'],
            text: ['hwp', 'txt'],
        },
        // 파일 확장자 추출
        get_ext: function (filename) {
            let extention = filename.split('.').pop().toLowerCase();
            let returnData = null;
            $.each(this.ext, function (key, value) {
                if ($.inArray(extention, value) > -1) {
                    returnData = key;
                    return;
                }
            });
            return returnData;
        },
        // awesome 파일 확장자 변경
        get_awesome: function (filename) {
            return 'fa-file-' + this.get_ext(filename) + '-o' || 'fa-text-o';
        },
    };

    // 자동실행해야할 함수 목록
    (function () {
        default_init._init();

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

        // 구글 번역기 색상 변경
        (function () {
            $('#google_translate_element').on('click', function () {
                let lang = $('iframe.goog-te-menu-frame').contents().find('.text');
                let favorLang = [
                    '한국어', '터키어', '러시아어', '독일어', '몽골어', '베트남어', '스페인어',
                    '아랍어', '영어', '일본어', '중국어(간체)', '폴란드어'
                ];

                $.each(lang, function () {
                    if (favorLang.indexOf($(this).text()) !== -1) {
                        $(this).css('color', '#ffffff').css('background', '#2d4072');
                    }
                });
            });
        })();
    })();

    return {
        default_init: default_init,
        getQueryParam: getQueryParam,
        rgb2hex: RgbHex.rgb2hex,
        hex: RgbHex.hex,
        extention: extention,
        magnify
    }
});