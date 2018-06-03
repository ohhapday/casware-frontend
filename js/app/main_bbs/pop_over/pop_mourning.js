/* eslint-disable no-undef,no-unused-vars */
/**
 * Created by 서정석 on 2017/01/04.
 * 출근현황
 */

define([
    'jquery', 'session', 'moment', 'bootstrap', 'icheck', 'jquery-popup-overlay',
], function ($, session, moment) {
    'use strict';

    let pop_html = `
        <div id="slide" class="well" style="width: 800px;">
            <div class="row" style="height: 500px; overflow-y: auto;">
                <div class="col-md-12">    
                    <div class="box-header bg-blue">
                        최영희 부장을 애도하며 ... <br>
                        <i>Our deepest condolences to Choi, Young-Hee.</i>
                    </div>
                    <div class="box-body">                        
                        <div>
                            <div style="font-size: 15px; line-height: 170%; font-family: NanumBarunGothic,'나눔바른고딕','Nanum Barun Gothic',
                            'Malgun Gothic','맑은고딕','Apple SD Gothic Neo',Dotum,'돋움',sans-serif;">
                                <img alt="" height="200" src="/UserFiles/30582_a.jpg" style="margin-top: 20px; float:left" width="300" class="img-rounded">
                                <div style="margin-left: 320px;">
                                    <div>
                                        카스에 1994년 6월8일에 입사하여 2017년 10월 28일까지 회사를 위해 헌신한 
                                        최영희 부장의 부고를 전합니다.<br>
                                        <i>I am sharing the most unfortunate new: Mr. Choi had passed away on last Saturday,
                                         October 28th, 2017. Mr. Choi was born in 1968 and began working with CAS since June 8th, 1994.</i>
                                    </div>
                                    <div style="margin-top: 20px;">
                                        최영희 부장은 국내영업부문 마산, 울산, 부산, 대구 지역에서 근무하였고 국내영업관리팀, 
                                        대리점사업팀을 거쳐 리테일사업본부, 계측솔루션사업본부 본부장까지 역임하였습니다.<br>
                                        <i>He had worked in various positioned in Korea: Masan, Ulsan, Busan, Daegu, Domestic Management team, 
                                        Dealer Management team, Retail HQ and Measurement and Solution HQ.</i>
                                     </div>
                                </div>
                                <img alt="" height="200" src="/UserFiles/30762_a.jpg" style="float: right; margin-top: 30px;" width="300" class="img-rounded">
                                <div style="margin-right: 320px;">
                                    <div style="margin-top: 20px;">
                                        최영희 부장, 그는 회사에 헌신하는 카스 가족이었으며, 한 아내의 남편, 두 아들의 
                                        아버지였습니다.<br>
                                        <i>
                                            He was a husband of one wife, father of two sons, and a dedicated CAS family member.
                                        </i>
                                    </div>
                                    <div style="margin-top: 20px;">
                                        지난 3년간 암으로 투병하면서도 체력이 허락하는 순간까지 항상 긍정적으로 
                                        일을 하였고, 병세가 나아지지 않을 때에 회사에 누가 되지 않을까 고심했습니다. <br>
                                        <i>
                                            He was diagnosed with cancer 3 years ago and throughout his treatment, he had continued to work positively, and he did not want to cause any trouble to the company as he knew he was not recovering.
                                        </i>
                                    </div>
                                </div>
                                <img alt="" height="200" src="/UserFiles/39382_a.jpg" style="margin-top: 20px; float:left" width="300" class="img-rounded">
                                <div style="margin-left: 320px;">
                                    <div>
                                        우리 곁을 떠났지만 지금은 예수님 품에 평안히 쉬고 있습니다. 그리고 미래에 다시 함께 천국에서 만날 것을 확신합니다.
                                        <br>
                                        <i>Now, he is not with us, but is now resting in the arms of Jesus. Also, in future, we are certain that we will meet Mr. Choi again.
                                           </i>
                                    </div>
                                    <div style="margin-top: 20px;">
                                        회사는 최영희 부장이 카스에 남긴 많은 역사들을 기억하며, 카스 가족 함께 애도하기를 바랍니다.<br>
                                        <i>We want to remember history that Mr. Choi had left for us in CAS, and we will all mourn together for him and his family.</i>
                                     </div>
                                </div>
                                
                                <div class="pull-right" style="margin-top: 20px; font-size: 1.5em; color: #9d9d9d;">
                                    카스 대표이사 사장 김태인
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row" style="margin-top: 30px;">
                <div class="col-md-12" style="text-align: center;">
                    <a href="/cas_movie/reply?idx=186" target="_blank">
                        <button class="btn bg-purple">추모 예배 함께하기</button>
                    </a>
                </div>
            </div>
            
            <div class="row" style="margin-top: 30px;">
                <div class="col-md-12">    
                    <button class="slide_close standalone_open btn btn-warning">오늘 하루 열지않음</button>
                    <button class="slide_close btn btn-default pull-right">Close</button>
                </div>
            </div>
        </div>
    `;

    let Popup = function () {
        this.init();
        this.initEvent();
    };

    Popup.prototype = {
        init: function () {
            let autoopen = JSON.parse(localStorage.getItem('autoopen')) || {expired: ''};
            let now = moment(new Date()).format('YYYY-MM-DD');

            console.log(now);

            if (moment(autoopen.expired).isSame(now) === false) {
                let html = $(pop_html).clone(true);

                $('body').append(html);
                $('#slide').popup({
                    autoopen: true,
                    blur: false,
                });
            }
        },
        initEvent: function () {
            let self = this;

            $('#slide .btn-default').on('click', function () {
                $('#slide iframe').attr('src', '');
            });

            $('#slide .btn-warning').on('click', function () {
                let autoopen = {
                    expired: moment().format('YYYY-MM-DD'),
                };

                localStorage.setItem('autoopen', JSON.stringify(autoopen));
                $('#slide iframe').attr('src', '');
            });
        },
    };

    new Popup();
});

