/* eslint-disable no-undef */
/**
 * Created by 서정석 on 2017/06/16.
 * 공용 함수 목록
 */

define([
    'jquery',
], function ($) {
    'use strict';

    let webSpeech = function (obj) {
        let textarea = obj.closest('.box').find('textarea:eq(0)');              // 같은 form내의 1번째 textarea
        let button = obj.closest('button');

        if (!('webkitSpeechRecognition' in window)) {
            // alert('음성인식 기능을 지원하지 않습니다.\n\n크롬 브라우저를 사용해 주시기 바랍니다.');
            return false;
        } else {
            let recognizing = false;
            let ignore_onend;
            let final_transcript = '';
            let speech = new webkitSpeechRecognition();

            speech.continuous = true;                       // 연속 반환/단일 반환
            speech.interimResults = true;                   // 중간값 반환여부

            speech.onstart = function () {
                recognizing = true;
            };

            speech.onerror = function (event) {
                if (event.error == 'no-speech') {
                    speech.stop();
                    ignore_onend = true;
                }
                if (event.error == 'audio-capture') {
                    ignore_onend = true;
                }
                if (event.error == 'not-allowed') {
                    ignore_onend = true;
                }
                button.removeClass('btn-danger').addClass('btn-default');
            };

            speech.onend = function () {
                recognizing = false;
                if (ignore_onend) {
                    return;
                }
                if (!final_transcript) {
                    return;
                }
                button.removeClass('btn-danger').addClass('btn-default');
            };

            speech.onresult = function (event) {
                let interim_transcript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;

                        final_transcript = capitalize(final_transcript);
                        textarea.val(linebreak(final_transcript));
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                        textarea.val(linebreak(interim_transcript));
                    }
                }
            };

            button.on('click', function () {
                if (recognizing) {
                    $(this).removeClass('btn-danger').addClass('btn-default');
                    speech.stop();
                } else {
                    // speech.lang = 'en-US';
                    final_transcript = '';
                    $(this).removeClass('btn-default').addClass('btn-danger');
                    speech.start();
                }
            });

            // api Function 모음
            let capitalize = function (s) {
                let first_char = /\S/;
                return s.replace(first_char, function (m) {
                    return m.toUpperCase();
                });
            };

            let linebreak = function (s) {
                let two_line = /\n\n/g;
                let one_line = /\n/g;
                return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
            };
        }
    };

    // microphone 버튼이 있을 경우 자동 지정
    if ($('button i').is('.fa-microphone')) {
        webSpeech($('button .fa-microphone'));
    }
});