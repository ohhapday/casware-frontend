/**
 * Created by 서정석 on 2016/11/24.
 */

requirejs([
    'session', 'orgInfo', 'myFn', 'select2Search', 'organization_tree',
    'faloading', 'bootstrap', 'icheck'
], function (session, orgInfo, myFn, select2Search, a, b, faloading, iCheck) {


    var draftform_no = myFn.getQueryParam('draftform_no');          // 폼양식 번호
    var document_no = location.pathname.split('/')[4];              // 문서 번호

    // 페이지에 필요한 기초 데이터
    var My_data = function () {
        var st = (function () {
            var returnData;
            $.ajax({
                async: false,
                url: "/approval/prev_approval_line/get_approval_line",
                type: "get",
                dataType: "json",
                data: {
                    'document_no': document_no,
                },
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        })();

        var approval_user_line = (function () {         // 개인별 결재선 목록
            var returnData = new Array;
            $.each(st.user_line, function () {
                if (this.gubun == 1) {
                    returnData.push(this);
                }
            });
            return returnData;
        })();

        var agreement_user_line = (function () {        // 개인별 합의선 목록
            var returnData = new Array;
            $.each(st.user_line, function () {
                if (this.gubun == 2) {
                    returnData.push(this);
                }
            });
            return returnData;
        })();

        return {
            approval_user_line: approval_user_line,
            agreement_user_line: agreement_user_line,
            approval_line_data: st.approval_line,
            agreement_line_data: st.agreement_line,
            draft_class: st.draft_class,
        }
    }

    var approval_line_data = new Array();           // 결재선 정보
    var agreement_line_data = new Array();          // 합의선 정보

    var my_data = new My_data();
    var approval_user_line = my_data.approval_user_line;
    var agreement_user_line = my_data.agreement_user_line;

    approval_line_data = my_data.approval_line_data;
    agreement_line_data = my_data.agreement_line_data;


    /*----------------- 결재선 목록 저장/삭제 Object ----------------*/
    function Approval_userlist() {
        this.element = $('.approval-line-select');
        this._init();
        this._initEvent();
    }

    Approval_userlist.prototype = {
        _init: function () {
            var select = this.element.find('.user-list select');
            select.children('option:not(:first-child)').remove();
            $.each(approval_user_line, function (index) {
                select.append('<option value="' + index + '">' + this.title + '</option>');
            });
        },
        _initEvent: function () {
            this._change();
            this._save();
            this._delete();
        },
        _change: function () {
            var self = this;
            var select = this.element.find('.user-list select');
            select.on('change', function (event) {
                try {
                    var line = JSON.parse(approval_user_line[$(this).val()].user_line);
                    let tr = self.element.find('tbody tr')
                    tr.find('select.select2').val(null).trigger("change");      // select2 초기화
                    approval_line.set_line(line);
                } catch (e) {
                    console.log(e);
                }
            });
        },
        _save: function () {
            var self = this;
            this.element.find('.fa-save').parent().on('click', function () {
                var textbox = $(this).parents('.input-group').find('input[type|="text"]');
                var title = textbox.val();
                if (!title) {
                    alert('결재선 명칭을 입력해주세요.');
                    return;
                }

                approval_line_data = approval_line.get_line();
                $.ajax({
                    async: false,
                    url: "/approval/prev_approval_line/post_user_approval_line",
                    type: "post",
                    dataType: "json",
                    data: {
                        approval_line: approval_line_data,
                        title: title,
                    },
                    success: function (data, status, xhr) {
                        if (data.idx) {
                            alert(data.message);
                            textbox.val('');

                            var my_data2 = new My_data();
                            approval_user_line = my_data2.approval_user_line;
                            self._init();
                        }
                    }
                });
            });
        },
        _delete: function () {
            var self = this;
            this.element.find('.fa-trash').parent().on('click', function () {
                var select = self.element.find('.user-list select');
                var selected = select.children('option:selected');
                var index = select.children('option').index(selected);

                if (index === 0) {
                    alert('삭제할 결재선을 정확히 선택해 주세요.');
                    return;
                }

                $.ajax({
                    async: false,
                    url: "/approval/prev_approval_line/delete_user_approval_line",
                    type: "post",
                    dataType: "json",
                    data: {
                        idx: approval_user_line[selected.val()].idx,
                    },
                    success: function (data, status, xhr) {
                        if (data.status === true) {
                            alert(data.message);

                            var my_data2 = new My_data();
                            approval_user_line = my_data2.approval_user_line;
                            agreement_user_line = my_data2.agreement_user_line;
                            self._init();
                        }
                    }
                });
            });
        }
    }


    /*----------------- 결재선 목록 Object ----------------*/
    function Approval_line() {
        this.element = $('.approval-line-select');
        this.my_iCheck = this.element.find('input[type="radio"].minimal');
        this._init();
        this._initEvent();

        if (approval_line_data) this.set_line(approval_line_data);
    }

    Approval_line.prototype = {
        odata: orgInfo.get_organization(),              // 조직 + 사원 포함
        checkItem: orgInfo.key_value,                   // 조직 + 사원(key: 값)
        userList: new Approval_userlist(),              // 결재선 목록 저장/삭제
        is_agreement: false,                            // 합의선 오픈/미오픈 여부
        _init: function () {
            this.element.find('.jqxTree').organizationTree({
                odata: this.odata
            });
            this.element.find('.approval-line .select2')
                .select2Search({
                    option: orgInfo.get_select2_options(),
                    placeholder: '팀명 혹은 성명',
                    selected: [],
                });
            if (approval_line_data.length === 0) {
                this.element.find('.approval-line .select2:eq(0)').val(session.user_code).trigger("change");
            }
        },
        _initEvent: function () {           // 초기화 이벤트
            var self = this;
            // 사원(select2) 변경시
            this.element.find('.approval-line .select2').on('change', function () {
                self.iCheck_disable();
            });

            // 결재선 tr 선택
            this.element.find('tr:not(:last-child)').find('td:first').on('click', function () {
                $(this).parents('table').find('tr').find('td:first').each(function () {
                    $(this).removeClass('select_line_on');
                });
                $(this).addClass('select_line_on');
            });

            // 이벤트 등록
            this.iCheck_disable();
            this._buttonEvent();
            this._changeEvent();
            this._iCheckEvent();
        },
        set_line: function (line) {
            var self = this;
            var tr = self.element.find('tbody tr');

            $.each(line, function (index) {
                if (this.draft_line_seq === undefined) this.draft_line_seq = index;

                if (this.user_code) {
                    tr.eq(this.draft_line_seq).find('select.select2').val(this.user_code).trigger("change");
                }
                if (this.agreement === '1') {
                    tr.eq(this.draft_line_seq).find('input[type="radio"].minimal').iCheck('check');
                    $('.agreement-line-select').collapse('show');
                    self.is_agreement = true;
                }
            });

            // 회장님/ 사장님 결재선 체크
            (function () {
                let chairman = line.find(function (line) {
                    return (line.user_code === '831001' && line.draft_line_seq === '7');
                });

                if (chairman) {
                    $('input[name="chairman"]:eq(0)').iCheck('check');
                }

                // 경영지원부, 리테일본부 결재 추가 체크박스 추가 (사장님, 회장님)
                if (session.filler.substr(0, 2) === 'bb' || session.filler.substr(0, 2) === 'ax') {
                    $('.chk_ceo').removeClass('hidden');
                }
            })();

            // 업무협조전 확인
            if (agreement_line_data) {
                if (agreement_line_data.length > 0 && self.is_agreement === false) {
                    tr.last().find('input[type="radio"].minimal').iCheck('check');
                    $('.agreement-line-select').collapse('show');
                    self.is_agreement = true;
                }
            }
        },
        get_line: function () {
            var self = this;
            var tr = self.element.find('tbody tr');
            var approval_line_data = new Array;
            $.each(tr, function (index) {
                var user_code = $(this).find('select.select2').val();
                var agreement = $(this).find('input[type="radio"]').is(":checked");
                if (typeof user_code !== 'undefined' && user_code !== '') {
                    approval_line_data[index] = {};
                    approval_line_data[index].user_code = user_code;
                    approval_line_data[index].agreement = agreement;
                }
            });

            // 회장님 + 사장님 결재선 추가 (리테일 때문에)
            if ($('input[name="chairman"]:eq(0)').get(0).checked) {
                approval_line_data[6] = {
                    user_code: '131113',
                    agreement: false,
                };

                approval_line_data[7] = {
                    user_code: '831001',
                    agreement: false,
                };
            }

            return approval_line_data;
        },
        _buttonEvent: function () {         // 버튼 이벤트
            var self = this;
            // 결재라인 위쪽 button 처리
            this.element.find('.fa-arrow-right').parent().on('click', function () {
                var items = self.element.find('.jqxTree').jqxTree('getSelectedItem');
                var checkItem = self.checkItem;
                var returnData = null, status;
                var $select2 = self.element.find('select.select2');

                if (checkItem[items.id] === undefined) {
                    alert('항목은 정확히 선택해 주시기 바랍니다.')
                    return;
                }

                $.each($select2, function (index) {
                    let a = $(this).val();
                    if (items.id === a) {
                        status = 1;
                        return false;
                    } else {
                        returnData = index;
                        if (!a) {
                            return false;
                        }
                    }
                });
                if (status === 1) {
                    alert('이미 결재 라인에 포함되어 있습니다.');
                    return false;
                } else {
                    self.element.find('select.select2:eq(' + returnData + ')').val(items.id).trigger("change");
                    self.iCheck_disable();
                }
            });

            // 결재라인 아래쪽 button 처리
            this.element.find('.fa-arrow-left').parent().on('click', function () {
                var first_td = self.element.find('tr td:first-child');
                var returnData = null;
                first_td.each(function (index) {
                    if ($(this).hasClass('select_line_on')) {
                        returnData = index;
                    }
                });
                self.element.find('tr:eq(' + returnData + ') .select2').val(null).trigger("change");
                self.iCheck_disable();
            });
        },
        _changeEvent: function () {             // 순번변경 이벤트
            var self = this;
            this.element.find('.draft_line_change').on('change', function () {
                var value = $(this).val();
                var first_td = self.element.find('tr td:first-child');
                var returnData = null;
                first_td.each(function (index) {
                    if ($(this).hasClass('select_line_on')) {
                        returnData = index;
                    }
                });
                if (returnData === null) {
                    return false;
                }

                // 결재 순번 변경
                var user_code = self.element.find('tr:eq(' + returnData + ') select.select2').val();
                self.element.find('tr:eq(' + returnData + ') .select2').val(null).trigger("change");
                self.element.find('tr:eq(' + value + ')').find('select.select2').val(user_code).trigger("change");
                self.iCheck_disable();

                // 합의 위치 변경
                var checked = self.element.find('tr:eq(' + returnData + ') input[type="radio"]:checked').val();
                if (checked) {
                    self.element.find('tr:eq(' + value + ') input[type="radio"].minimal').iCheck('check');
                }

                self.element.find('tr:not(:last-child)').find('td:first').removeClass('select_line_on');
                $(this).children('option:first').attr('selected', 'selected');
            });
        },
        iCheck_disable: function () {           // iCheck 비활성화 함수
            var self = this;
            this.my_iCheck.each(function (index) {
                let select2 = $(this).parents('td').prev().find('select.select2');
                select2.val() === "" ? $(this).iCheck('disable') : $(this).iCheck('enable');
                /*
                if (index === 5) {
                    $(this).iCheck('disable');
                }
                */
            });

            // 일반기안문 합의 불가 처리
            if (my_data.draft_class === '4' || my_data.draft_class === '103') {
                this.my_iCheck.iCheck('disable');
            }

            // 합의기안문 협조 불가 처리
            if (my_data.draft_class === '5' || my_data.draft_class === '104') {
                this.my_iCheck.eq(6).iCheck('disable');
            }

            // 협조문 합의 불가 처리
            if (my_data.draft_class === '6') {
                this.my_iCheck.not(':eq(6)').iCheck('disable');
            }

            // 법인서류신청서 합의 불가 처리
            if (my_data.draft_class === '102') {
                this.my_iCheck.not(':eq(6)').iCheck('disable');
            }
        },
        _iCheckEvent: function () {
            this.my_iCheck.on('ifClicked', function (event) {
                let $select2 = $(this).parents('td').prev().find('select.select2');
                if (event.target.checked) {
                    $(this).iCheck('uncheck');
                    $('.agreement-line-select').collapse('hide');
                } else {
                    $('.agreement-line-select').collapse('show');
                    alert('하단의 합의선을 지정해주시기 바랍니다.');
                }
                agreement_line._init();
            });
        }
    };
    var approval_line = new Approval_line();


    /*----------------- 합의선 목록 저장/삭제 Object ----------------*/
    function Agreement_userlist() {
        this.element = $('.agreement-line-select');
        this._init();
        this._initEvent();
    }

    Agreement_userlist.prototype = {
        _init: function () {
            var select = this.element.find('.user-list select');
            select.children('option:not(:first-child)').remove();

            $.each(agreement_user_line, function (index) {
                select.append('<option value="' + index + '">' + this.title + '</option>');
            });
        },
        _initEvent: function () {
            this._change();
            this._save();
            this._delete();
        },
        _change: function () {
            var self = this;
            var select = this.element.find('.user-list select');
            select.on('change', function (event) {
                try {
                    var line = JSON.parse(agreement_user_line[$(this).val()].user_line);
                    agreement_line.set_line(line);
                } catch (e) {
                    console.log(e);
                }
            });
        },
        _save: function () {
            var self = this;
            this.element.find('.fa-save').parent().on('click', function () {
                var textbox = $(this).parents('.input-group').find('input[type|="text"]');
                var title = textbox.val();
                if (!title) {
                    alert('합의선 명칭을 입력해주세요.');
                    return;
                }

                agreement_line_data = agreement_line.get_line();
                $.ajax({
                    async: false,
                    url: "/approval/prev_approval_line/post_user_agreement_line",
                    type: "post",
                    dataType: "json",
                    data: {
                        approval_line: agreement_line_data,
                        title: title,
                    },
                    success: function (data, status, xhr) {
                        if (data.idx) {
                            alert(data.message);
                            textbox.val('');

                            var my_data2 = new My_data();
                            agreement_user_line = my_data2.agreement_user_line;
                            self._init();
                        }
                    }
                });
            });
        },
        _delete: function () {
            var self = this;
            this.element.find('.fa-trash').parent().on('click', function () {
                var select = self.element.find('.user-list select');
                var selected = select.children('option:selected');
                var index = select.children('option').index(selected);

                if (index === 0) {
                    alert('삭제할 합의선을 정확히 선택해 주세요.');
                    return;
                }

                $.ajax({
                    async: false,
                    url: "/approval/prev_approval_line/delete_user_approval_line",
                    type: "post",
                    dataType: "json",
                    data: {
                        idx: agreement_user_line[selected.val()].idx,
                    },
                    success: function (data, status, xhr) {
                        if (data.status === true) {
                            alert(data.message);

                            var my_data2 = new My_data();
                            approval_user_line = my_data2.approval_user_line;
                            agreement_user_line = my_data2.agreement_user_line;
                            self._init();
                        }
                    }
                });
            });
        }
    }


    /*----------------- 합의선 목록 Object ----------------*/
    function Agreement_line() {
        this.element = $('.agreement-line-select');
    }

    Agreement_line.prototype = {
        odata: orgInfo.dept_info,     // 조직정보만
        checkItem: orgInfo.key_value,    // 조직 + 사원(key: 값)
        userList: new Agreement_userlist(),      // 결재선 목록 저장/삭제
        _init: function () {
            $.each(this.odata, function () {
                if (this.hr_active == '1') {
                    this.text += " <b style='background-color: #0b58a2; color: #FFFFFF; border-radius: 5px;'> 합의 </b>";
                }
            });
            this.element.find('.jqxTree').organizationTree({
                odata: this.odata,     // 조직
            });

            // 이벤트 등록
            this._initEvent();
            this._buttonEvent();
            this._changeEvent();
            this.set_line(agreement_line_data);
        },
        _initEvent: function () {
            var self = this;

            // 결재선 tr 선택
            this.element.find('tr:not(:last-child)').find('td:first').on('click', function () {
                $(this).parents('table').find('tr').find('td:first').each(function () {
                    $(this).removeClass('select_line_on');
                });
                $(this).addClass('select_line_on');
            });
        },
        set_line: function (line) {
            var self = this;
            var tr = this.element.find('tbody');
            tr.find('tr').remove();

            $.each(line, function (index) {
                if (this.user_code) {
                    tr.append('' +
                        '<tr data-dept_code="' + this.user_code + '"><td>' + (index + 1) + '</td>' +
                        '<td>' + (this.gubun || '합의') + '</td>' +
                        '<td>' + self.checkItem[this.user_code] + '</td></tr>')
                        .on('click', 'tr', function () {
                            agreement_line.agreement_line_select($(this));
                        });
                }
            });
        },
        get_line: function () {
            var self = this;
            var tr = self.element.find('tbody tr');
            var approval_line_data = new Array;
            $.each(tr, function (index) {
                var user_code = $(this).data('dept_code');
                approval_line_data[index] = {};
                approval_line_data[index].user_code = user_code;
            });
            return approval_line_data;
        },
        _buttonEvent: function () {
            var self = this;
            // 합의라인 위쪽 button 처리
            this.element.find('.fa-arrow-right').parent().on('click', function () {
                var agree_line_no = self.element.find('tbody tr').length + 1;
                var items = self.element.find('.jqxTree').jqxTree('getSelectedItem');
                var checkItem = self.checkItem;

                if (items === null) {
                    alert('항목은 정확히 선택해 주시기 바랍니다.')
                    return;
                }
                var check = items.label.indexOf("합의");
                if (check < 0) {
                    alert('합의부서가 아닙니다. \n\n합의부서를 선택해 주세요.')
                    return;
                }

                // 합의 부서 중복 체크
                $select2 = self.element.find('tbody tr');
                var status;
                $.each($select2, function (index) {
                    let a = $(this).data('dept_code');
                    if (items.id === a) {
                        status = 1;
                        return false;
                    }
                });

                if (status === 1) {
                    alert('이미 합의 라인에 포함되어 있습니다.');
                    return false;
                } else {
                    self.element.find('tbody').append('' +
                        '<tr data-dept_code="' + items.id + '"><td>' + agree_line_no + '</td>' +
                        '<td>합의</td>' +
                        '<td>' + checkItem[items.id] + '</td></tr>')
                        .on('click', 'tr', function () {
                            self.agreement_line_select($(this));
                        });
                }
            });

            // 합의라인 아래쪽 button 처리
            this.element.find('.fa-arrow-left').parent().on('click', function () {
                var tr = self.element.find('tr');
                var returnData = null;
                tr.each(function (index) {
                    if ($(this).hasClass('select_line_on')) {
                        returnData = index;
                    }
                });
                self.element.find('tr:eq(' + returnData + ')').remove();
            });
        },
        _changeEvent: function () {

        },
        agreement_line_select: function (element) {
            element.parents('table').find('tr').each(function () {
                $(this).removeClass('select_line_on');
            });
            element.addClass('select_line_on');
        }

    };
    var agreement_line = new Agreement_line();
    if (approval_line.is_agreement === true) {
        agreement_line._init();
    }


    /*----------------- 결재선 지정 버튼 ----------------*/
    $('.info-box .btn-primary').on('click', function () {
        var a_line = approval_line.get_line();
        var ag_line = agreement_line.get_line();

        // 합의 지정했을 경우 합의부서 지정여부 확인
        var agreement = false;
        $.each(a_line, function () {
            if (this.agreement === true) {
                agreement = true;
            }
        });
        if (agreement === true && ag_line.length === 0) {
            alert('합의부서 지정이 필요합니다.');
            return;
        }

        $.ajax({
            async: false,
            url: "/approval/prev_approval_line/post_approval_line",
            type: "post",
            dataType: "json",
            data: {
                document_no: document_no,
                approval_line: a_line,
                agreement_line: ag_line,
            },
            success: function (data, status, xhr) {
                if (data.status === "success") {
                    if ($.isFunction(opener.$)) {        // todo 걷어내야할 곳
                        opener.$.get_draft_line();
                    }
                    alert(data.message, 'close');
                } else {
                    alert(data.message);
                }
            }
        });
    });

    // 창닫기
    $('.info-box .btn-default').on('click', function () {
        window.close();
    });

    // 로딩 삭제
    $(".fa-loading-wrapper").remove();

});

