/* eslint-disable no-undef,no-unused-vars,indent,no-console,no-extra-boolean-cast */
/**
 * Created by 서정석 on 2017/01/04.
 * 메인 페이지
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/claim/global_claim_data.js',
    '/dist/js/app/api/Erp_data.js',
    '/dist/js/app/api/Casware_data.js',
    'select2', 'select2-ko', 'datetimepicker',
    'ckeditor',
], function ($, session, myFn, app, moment, ClaimData, ErpData, CaswareData) {
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
    
    // 기본정보 입력
    let Basic_info = (function () {
        let Basic_info = function () {
            this.data = (ClaimData) ? ClaimData.base_info : null;

            this.init();
            this.initEvent();
        };

        Basic_info.prototype = {
            init() {
                this.setUser()
                    .then(this.setWriteUser)
                    .then(this.setModel())
                    .then(this.setNation())
                    .then(this.setSymptom())
                    .then(this.setEtc());

            },
            initEvent() {
            },
        };

        Basic_info.prototype = {
            ...Basic_info.prototype,
            setUser() {
                let user_code = !!this.data ? this.data.user_code : session.user_code;
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
                let obj = $('#basic-info');
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
            setModel() {
                // 모델 소분류 데이터 바인드
                let self = this;

                return new Promise(function (resolve, reject) {
                    ErpData.prod_model.get_data().then(function (data) {
                        $('#basic-info select[name="prod_model"]').select2({
                            data: data,
                            placeholder: 'Model',
                            width: '100%',
                            allowClear: true,
                        });
                        if (self.data !== null) {
                            $('#basic-info select[name="prod_model"]').val(self.data.prod_code).trigger('change');
                        }
                    });
                    resolve(true);
                });
            },
            setNation() {
                // 국가 데이터 바인드
                let self = this;

                return new Promise(function (resolve, reject) {
                    ErpData.nation.get_data().then(function (data) {
                        let select2 = $('#basic-info select[name="prod_nation"]');
                        select2.select2({
                            data: data,
                            placeholder: 'Nation',
                            width: '100%',
                            allowClear: true,
                        }).on('select2:select', function (e) {
                            let nation_code = e.params.data.id;
                            $('#basic-info select[name="prod_buyer"] option:not(:eq(0))').remove();
                            ErpData.buyer.get_data(nation_code).then(function (data) {          // 바이어 데이터 바인드
                                $('#basic-info select[name="prod_buyer"]').select2({
                                    data: data,
                                    placeholder: 'Buyer',
                                    width: '100%',
                                    allowClear: true,
                                }).select2('open');
                            });
                        });

                        if (self.data !== null) {
                            $('#basic-info select[name="prod_nation"]').val(self.data.nation_code).trigger('change');
                            ErpData.buyer.get_data(self.data.nation_code).then(function (data) {          // 바이어 데이터 바인드
                                $('#basic-info select[name="prod_buyer"]').select2({
                                    data: data,
                                    placeholder: 'Buyer',
                                    width: '100%',
                                    allowClear: true,
                                }).val(self.data.buyer_code).trigger('change');
                            });
                        }
                    });
                    resolve(true);
                });
            },
            setSymptom() {
                // 소분류 데이터 바인드
                let self = this;
                CaswareData.Symptom_code.get_data().then(function (data) {
                    $('#basic-info select[name="symptom"]').select2({
                        data: data,
                        placeholder: 'Symptom',
                        width: '100%',
                        allowClear: true,
                    });
                    if (self.data !== null) {
                        $('#basic-info select[name="symptom"]').val(self.data.symptom_cd).trigger('change');
                    }
                });
            },
            setEtc() {
                if (this.data) {
                    $('input[name="prod_ea"]').val(this.data.prod_ea);
                    $('input[name="prod_lot"]').val(this.data.prod_lot);
                    $('input:radio[name="prod_site"]:radio[value="' + this.data.prod_site + '"]').iCheck('check');
                }
            }
        };

        new Basic_info();
    })();

    // 접수내역 입력
    let Request_info = (function () {
        let Request_info = function () {
            this.data = (ClaimData) ? ClaimData.request_info : null;

            this.init();
            this.initEvent();
        };

        Request_info.prototype = {
            init() {
                this.setDatePicker();
                this.setTextarea();
                this.setDefective();
                this.setEtc();
            },
            initEvent() {
            },
        };

        Request_info.prototype = {
            ...Request_info.prototype,
            setDatePicker() {
                let defaultData = (this.data) ? moment(this.data.occurrence_date) : moment();
                $('#request-info input[name="occurrenceDate"]').datetimepicker({
                    defaultDate: defaultData,
                    format: 'YYYY-MM-DD',
                    useCurrent: false,
                });
            },
            setTextarea() {
                if (this.data !== null) {
                    $('textarea[name="symptomPhoto"]').val(this.data.symptom_photo);
                    $('textarea[name="results"]').val(this.data.results);
                    $('textarea[name="requestMechanism"]').val(this.data.requestMechanism);
                }

                CKEDITOR.replace('symptomPhoto', {
                    extraPlugins: 'image2,embed',
                    toolbarGroups: [{
                        name: 'editing', groups: ['find', 'selection'],
                    }, {
                        name: 'insert'
                    }],
                    width: '100%',
                    height: '200px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });

                CKEDITOR.replace('results', {
                    width: '100%',
                    height: '100px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });

                CKEDITOR.replace('requestMechanism', {
                    width: '100%',
                    height: '100px',
                    filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image'
                });
            },
            setDefective() {
                // 불량자재 데이터 바인드
                let self = this;
                CaswareData.Defective_code.get_data().then(function (data) {
                    $('#request-info select[name="defective"]').select2({
                        data: data,
                        placeholder: 'Defective Material',
                        width: '100%',
                        allowClear: true,
                    });

                    if (self.data !== null) {
                        $('#request-info select[name="defective"]').val(self.data.defective_code).trigger('change');
                    }
                });
            },
            setEtc() {
                if (this.data) {
                    $('input[name="detailedSymptom"]').val(this.data.detailed_symptom);
                    $('input[name="serialNumber"]').val(this.data.serial_number);
                    $('select[name="periodOfUse"]').val(this.data.period_of_use);
                }
            },
        };
        new Request_info();
    })();

    // Submit 이벤트
    let SubmitDoc = (function () {
        let SubmitDoc = function () {
            this.init();
            this.initEvent();
        };

        SubmitDoc.prototype = {
            init() {
            },
            initEvent() {
                this.submitEvent();
            }
        };

        SubmitDoc.prototype = {
            ...SubmitDoc.prototype,
            submitEvent() {
                let self = this,
                    form = $('form')[0],
                    isValid = false;
                let data = null;

                $('button').on('click', function (e) {
                    if (e.target.type === 'submit') {
                        isValid = form.checkValidity();
                        if (isValid === false) return;
                        e.preventDefault();
                        data = {
                            ...data,
                            basicData: self.setBasicData(),
                            requestData: self.setRequestData(),
                        };
                        self.postData(data);
                    }
                });
            },
            setBasicData() {
                return {
                    idx: params.idx || null,
                    prod_code: $('select[name="prod_model"]').select2('data')[0].id,
                    prod_model: $('select[name="prod_model"]').select2('data')[0].text,
                    nation_code: $('select[name="prod_nation"]').select2('data')[0].id,
                    nation_name: $('select[name="prod_nation"]').select2('data')[0].text,
                    buyer_code: $('select[name="prod_buyer"]').select2('data')[0].id || null,
                    buyer_name: $('select[name="prod_buyer"]').select2('data')[0].text || null,
                    prod_ea: $('input[name="prod_ea"]').val(),
                    prod_lot: $('input[name="prod_lot"]').val(),
                    prod_site: $('input[name="prod_site"]:checked').val(),
                    symptom: $('select[name="symptom"]').select2('data')[0].id,
                };
            },
            setRequestData() {
                return {
                    defective_code: $('select[name="defective"]').select2('data')[0].id,
                    occurrence_date: $('input[name="occurrenceDate"]').val(),
                    period_of_use: $('select[name="periodOfUse"]').val(),
                    detailed_symptom: $('input[name="detailedSymptom"]').val(),
                    serial_number: $('input[name="serialNumber"]').val(),
                    symptom_photo: CKEDITOR.instances.symptomPhoto.getData(),
                    results: CKEDITOR.instances.results.getData(),
                    requestMechanism: CKEDITOR.instances.requestMechanism.getData(),
                };
            }
        };

        SubmitDoc.prototype = {
            ...SubmitDoc.prototype,
            postData(data) {
                $.ajax({
                    async: false,
                    url: '/global_claim/post_claim_data',
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function (data, status, xhr) {
                        let idx = data;
                        if (idx > 0) {
                            alert('Compose Success!!');
                            location.href = '/global_claim/view/' + idx;
                        }
                    }
                });
            },
        };
        new SubmitDoc();
    })();
});


