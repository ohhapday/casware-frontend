/* eslint-disable no-undef,indent */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/claim/global_claim_authority.js',
    '/dist/js/app/claim/global_claim_data.js',
    '/dist/js/app/api/Erp_data.js',
    '/dist/js/app/api/Casware_data.js',
    '/dist/js/app/bbs/comment_v2.js',
    'select2', 'select2-ko', 'datetimepicker',
    'ckeditor',
], function ($, session, myFn, app, moment,
             Authority, ClaimData, ErpData, CaswareData, Comment) {
    'use strict';

    // 구글 번역 동적 로딩 (중국때문에)
    (function () {
        $.ajax({
            async: true,
            type: 'GET',
            url: '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
            dataType: 'script',
            timeout: 1000,
        });
    })();

    let params = {
        dir: window.location.pathname.split('/')[1] || null,
        mode: window.location.pathname.split('/')[2] || null,
        idx: window.location.pathname.split('/')[3] || null,
    };

    // 기본정보 내용
    let Basic_info = (function () {
        let Basic_info = function () {
            this.data = (ClaimData) ? ClaimData.base_info : null;

            this.init();
            this.initEvent();
        };

        Basic_info.prototype = {
            init() {
                this.setUser()
                    .then(this.setData());
            },
            initEvent() {
                this.btnEvent();
            },
        };

        Basic_info.prototype = {
            ...Basic_info.prototype,
            setUser() {
                let self = this;
                return new Promise(function (resolve, reject) {
                    CaswareData.User_info.get_data(self.data.user_code).then(function (data) {
                        $('#basic-info .profile-user-img').attr('src', '/approval/user_draft_hr/hr_s/' + data.user_code + '.jpg');
                        $('#basic-info .profile-username').text(`
                            ${data.post_name} ${data.user_name}
                        `).next().text(`
                            ${data.dept_1st_name} ${data.dept_name}
                        `);
                    });
                    resolve(true);
                });
            },
            setData() {
                let data = this.data,
                    obj = $('#basic-info');
                let aa;
                switch (data.prod_site) {
                    case '1':
                        aa = 'China(JiaShan)';
                        break;
                    case '2':
                        aa = 'Korea(YangJu)';
                        break;
                    case '3':
                        aa = 'OEM';
                        break;
                }

                obj.find('.prod_model').text(data.prod_model);
                obj.find('.prod_nation').text(data.nation_name);
                obj.find('.prod_buyer').text(data.buyer_name);
                obj.find('.prod_ea').text(data.prod_ea);
                obj.find('.prod_lot').text(data.prod_lot);
                obj.find('.prod_site').text(aa);
                obj.find('.symptom').text(data.symptom);

                obj.find('.time-insert div').text(moment.unix(data.timestamp_insert).format('YYYY-MM-DD H:mm'));
                obj.find('.time-putup div').text(moment.unix(data.timestamp_putup).format('YYYY-MM-DD H:mm'));

                if (this.data.is_putup === '0') {
                    obj.find('.box-footer button').removeClass('btn-danger')
                        .addClass('btn-success').text('게시 시작');
                } else {
                    obj.find('.box-footer button').removeClass('btn-success')
                        .addClass('btn-danger').text('게시 중지');
                }
            },
            btnEvent() {
                $('#basic-info .box-footer button').on('click', function () {
                    let status = $(this).hasClass('btn-success') ? 1 : 0;

                    $.ajax({
                        async: false,
                        url: '/global_claim/put_claim_data',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            idx: params.idx,
                            status: status
                        },
                        complete: function () {
                            if (status === 1) {
                                alert('게시 시작!!');
                                $('#basic-info .box-footer button').removeClass('btn-success')
                                    .addClass('btn-danger').text('게시 중지');
                                // $('#request-info .box-footer').addClass('hidden');
                                $('#response-info .box-footer').addClass('hidden');
                            } else {
                                alert('게시 중지!!');
                                $('#basic-info .box-footer button').removeClass('btn-danger')
                                    .addClass('btn-success').text('게시 시작');
                                // $('#request-info .box-footer').removeClass('hidden');
                                $('#response-info .box-footer').removeClass('hidden');
                            }
                        }
                    });
                });
            }
        };
        let basic_info = new Basic_info();
        return {
            data: basic_info.data,
        };
    })();

    // 접수내역 내용
    let Request_info = (function () {
        let Request_info = function () {
            this.data = (ClaimData) ? ClaimData.request_info : null;

            this.init();
            this.initEvent();
        };

        Request_info.prototype = {
            init() {
                this.setData();
            },
            initEvent() {
                this.btnEvent();
            },
        };

        Request_info.prototype = {
            ...Request_info.prototype,
            setData() {
                let data = this.data,
                    obj = $('#request-info');

                obj.find('.defective').text(data.defective);
                obj.find('.occurrenceDate').text(moment(data.occurrence_date).format('YYYY-MM-DD'));
                obj.find('.periodOfUse').text(data.period_of_use + ' Month');
                obj.find('.defective').text(data.defective);
                obj.find('.detailedSymptom').text(data.detailed_symptom);
                obj.find('.serialNumber').text(data.serial_number);
                obj.find('.symptomPhoto').html(data.symptom_photo);
                obj.find('.results').html(data.results);
                obj.find('.requestMechanism').html(data.requestMechanism);
            },
            btnEvent() {
                $('#request-info button').on('click', function (e) {
                    if ($(e.currentTarget).find('i').hasClass('fa-edit')) {             // 수정
                        location.href = '/global_claim/write/' + params.idx;
                    } else if ($(e.currentTarget).find('i').hasClass('fa-eye')) {       // 답변레포트
                        new Response_write('response-write');
                    } else if ($(e.currentTarget).find('i').hasClass('fa-trash')) {     // 삭제
                        $.ajax({
                            async: false,
                            url: '/global_claim/delete_claim_data',
                            type: 'post',
                            dataType: 'json',
                            data: {
                                idx: params.idx
                            },
                            complete: function () {
                                alert('삭제되었습니다.', 'close');
                            }
                        });
                    }
                });
            },
        };
        new Request_info();
    })();

    // 품질대책 내용
    let Response_info = (function () {
        let Response_info = function () {
            this.data = (ClaimData) ? ClaimData.response_info : null;

            this.init();
            this.initEvent();
        };

        Response_info.prototype = {
            init() {
                if (!!this.data) {
                    this.setUser()
                        .then(this.setWriteUser)
                        .then(this.setData())
                        .catch(function (err) {
                            console.info(err);
                        });
                }
            },
            initEvent() {
                this.btnEvent();
            },
        };

        Response_info.prototype = {
            ...Response_info.prototype,
            setUser() {
                let user_code = this.data.user_code;
                return new Promise(function (resolve, reject) {
                    CaswareData.User_info.get_data(user_code).then(function (data) {
                        resolve({
                            user_code: data.user_code,
                            user_position: data.post_name,
                            user_name: data.user_name,
                            dept_name_upper: data.dept_1st_name,
                            dept_name: data.dept_name,
                        });
                    });
                });
            },
            setWriteUser(user_info) {
                let obj = $('#response-info');
                return new Promise(function (resolve, reject) {
                    obj.find('.profile-user-img').attr(
                        'src', '/approval/user_draft_hr/hr_s/' + user_info.user_code + '.jpg'
                    );
                    obj.find('.profile-username').text(`
                        ${user_info.user_position} ${user_info.user_name}
                    `).next().text(`
                        ${user_info.dept_name_upper} ${user_info.dept_name}
                    `);
                    resolve(true);
                });
            },
            setData() {
                let data = this.data,
                    obj = $('#response-info');

                obj.removeClass('hidden');
                obj.animateCss('bounceInRight');

                obj.find('.improvedPhotos').html(data.improved_photos);
                obj.find('.interimMeasures').html(data.interim_measures);
                obj.find('.qualityImprovements').html(data.quality_improvements);
                obj.find('.defectiveCause').text(data.defective_cause);

                obj.find('.time-response div').text(moment.unix(data.timestamp_insert).format('YYYY-MM-DD H:mm'));
            },
            btnEvent() {
                let self = this;
                $('#response-info button').on('click', function (e) {
                    if ($(e.currentTarget).find('i').hasClass('fa-edit')) {                 // 수정
                        $('#response-info').addClass('hidden');
                        new Response_write('response-write');
                    } else if ($(e.currentTarget).find('i').hasClass('fa-trash')) {         // 삭제
                        $.ajax({
                            async: false,
                            url: '/global_claim/delete_response_info',
                            type: 'post',
                            dataType: 'json',
                            data: {
                                idx: self.data.idx,
                                user_code: self.data.user_code
                            },
                            complete: function () {
                                let obj = $('#response-info');
                                $('#response-info').animateCss('bounceOutRight', function () {
                                    $('#response-info').addClass('hidden');
                                    alert('삭제되었습니다.');

                                    $('#request-info').find('.box-footer').removeClass('hidden');
                                    $('#request-info').find('.fa-edit').parent().attr('disabled', true);
                                    $('#request-info').find('.fa-trash').parent().attr('disabled', true);
                                });
                            }
                        });
                    }
                });
            }
        };
        let response_info = new Response_info();
        return {
            data: response_info.data
        };
    })();

    // 품질대책 입력
    let Response_write = (function () {
        let Response_write = function (obj) {
            this.data = (ClaimData) ? ClaimData.response_info : null;
            this.obj = $('#' + obj);

            this.init();
            this.initEvent();
        };

        Response_write.prototype = {
            init() {
                this.setWriteUser()
                    .then(this.setDefective())
                    .then(this.setTextarea())
                    .then(this.submitResponse());

                this.obj.removeClass('hidden');
                document.documentElement.scrollTop = document.body.scrollHeight;
                this.obj.animateCss('bounceInRight');

            },
            initEvent() {
            },
        };

        Response_write.prototype = {
            ...Response_write.prototype,
            setUser() {
                return {
                    user_code: session.user_code,
                    user_position: session.position,
                    user_name: session.user_name,
                    dept_name_upper: session.upper_dept,
                    dept_name: session.dept,
                };
            },
            setWriteUser() {
                let self = this,
                    user_info = Object.assign({}, this.setUser());

                return new Promise(function (resolve, reject) {
                    self.obj.find('.profile-user-img').attr(
                        'src', '/approval/user_draft_hr/hr_s/' + user_info.user_code + '.jpg'
                    );
                    self.obj.find('.profile-username').text(`
                        ${user_info.user_position} ${user_info.user_name}
                    `).next().text(`
                        ${user_info.dept_name_upper} ${user_info.dept_name}
                    `);
                    resolve(true);
                });
            },
            setTextarea() {
                if (!!this.data) {
                    $('textarea[name="improvedPhotos"]').val(this.data.improved_photos);
                    $('textarea[name="interimMeasures"]').val(this.data.interim_measures);
                    $('textarea[name="qualityImprovements"]').val(this.data.quality_improvements);
                }

                CKEDITOR.replace('improvedPhotos', {
                    extraPlugins: 'image2,embed',
                    toolbarGroups: [
                        {
                            name: 'editing', groups: ['find', 'selection'],
                        }, {
                            name: 'insert'
                        }
                    ],
                    width: '100%',
                    height: '200px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });

                CKEDITOR.replace('interimMeasures', {
                    width: '100%',
                    height: '100px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });

                CKEDITOR.replace('qualityImprovements', {
                    width: '100%',
                    height: '100px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });
            },
            setDefective() {
                // 불량원인 데이터 바인드
                let self = this;
                CaswareData.Defective_cause_code.get_data().then(function (data) {
                    $('#response-write select[name="defectiveCause"]').select2({
                        data: data,
                        placeholder: 'Cause of Defective',
                        width: '100%',
                        allowClear: true,
                    });

                    if (!!self.data) {
                        $('#response-write select[name="defectiveCause"]')
                            .val(self.data.defective_cause_code).trigger('change');
                    }
                });
            },
        };

        Response_write.prototype = {
            ...Response_write.prototype,
            submitResponse() {
                let self = this,
                    form = $('form')[0],
                    isValid = false;
                let data = null;

                $('#response-write button').on('click', function (e) {
                    if (e.target.type === 'submit') {
                        isValid = form.checkValidity();
                        if (isValid === false) return;
                        e.preventDefault();
                        data = {
                            idx: (!!self.data) ? self.data.idx : null,
                            p_idx: params.idx || null,
                            improved_photos: CKEDITOR.instances.improvedPhotos.getData(),
                            interim_measures: CKEDITOR.instances.interimMeasures.getData(),
                            quality_improvements: CKEDITOR.instances.qualityImprovements.getData(),
                            defective_cause: $('select[name="defectiveCause"]').val(),
                        };
                        self.postData(data);
                    }
                });
            },
            postData(data) {
                $.ajax({
                    async: false,
                    url: '/global_claim/post_response_info',
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function (data, status, xhr) {
                        if (data > 0) {
                            alert('Compose Success!!');
                            setTimeout(function () {
                                location.href = '/global_claim/view/' + params.idx;
                            }, 500);
                        }
                    }
                });
            }
        };

        return Response_write;
    })();

    // 권한 처리
    let Auth = (function () {
        let Auth = function () {
            this.data = (ClaimData) ? ClaimData.base_info : null;
            this.auth = new Authority({
                user_code: this.data.user_code,
                response_info: Response_info.data || null,
            });

            this.init();
            this.initEvent();
        };

        Auth.prototype = {
            ...Auth.prototype,
            init() {
                this.btnUsed();
            },
            initEvent() {
            },
            btnUsed() {
                let auth = this.auth;

                if (auth.editStatus) {
                    $('#request-info').find('.box-footer').removeClass('hidden');
                    $('#request-info').find('.fa-eye').parent().attr('disabled', true);
                }

                if (auth.improveStatus) {
                    $('#request-info').find('.box-footer').removeClass('hidden');
                    $('#request-info').find('.fa-edit').parent().attr('disabled', true);
                    $('#request-info').find('.fa-trash').parent().attr('disabled', true);
                }

                if (auth.improveCompletedStatus) {
                    $('#response-info').find('.box-footer').removeClass('hidden');
                }

                if (auth.adminStatus) {
                    $('#basic-info').find('.box-footer').removeClass('hidden');
                    $('#request-info').find('.box-footer').removeClass('hidden');
                    $('#request-info').find('.fa-eye').parent().attr('disabled', true);
                }

                if (Basic_info.data.is_putup === '1') {
                    // $('#request-info').find('.box-footer').addClass('hidden');
                    $('#response-info').find('.box-footer').addClass('hidden');
                }
            },
        };

        new Auth();
    })();

    // 댓글 박스
    (function () {
        const bbs_idx = 56;             // 글로벌 클레임 레포트 게시판 고유 번호 (tb_bbs_info)
        new Comment({
            art_idx: Number(params.idx),
            bbs_idx: bbs_idx,
            obj: '#comment_area',
        });
    })();

    // 한국일 경우 기본 메뉴 한글로
    (function () {
        let nation_check = {
            init() {
                this.nationCheck()
                    .then(this.changeLabel)
                    .catch(error => {
                        console.error(error);
                    });
            },
            changeLabel(data) {
                if (data.country !== 'KR') {
                    $.each($('label'), function (i) {
                        if (!!$(this).data('tran')) {
                            $(this).text($(this).data('tran'));
                        }
                    });
                }
            },
            nationCheck() {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        async: true, type: 'get', dataType: 'jsonp',
                        url: 'http://ipinfo.io',
                        success(data, status, xhr) {
                            resolve(data);
                        },
                        error(xhr) {
                            reject(xhr);
                        },
                        timeout: 1000,
                    });
                });
            }
        };

        nation_check.init();
    })();
});


