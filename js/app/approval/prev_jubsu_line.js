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
                url: "/approval/prev_approval_line/get_jubsu_line",
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
        this._init();
        this._initEvent();

        if (approval_line_data) this.set_line(approval_line_data);
    }

    Approval_line.prototype = {
        odata: orgInfo.get_organization(),      // 조직 + 사원 포함
        checkItem: orgInfo.key_value,      // 조직 + 사원(key: 값)
        userList: new Approval_userlist(),      // 결재선 목록 저장/삭제
        _init: function () {
            this.element.find('.jqxTree').organizationTree({
                odata: this.odata
            });
        },
        _initEvent: function () {           // 초기화 이벤트
            var self = this;

            // 결재선 tr 선택
            this.element.find('tr:not(:eq(0))').find('td:first').on('click', function () {
                $(this).parents('table').find('tr').find('td:first').each(function () {
                    $(this).removeClass('select_line_on');
                });
                $(this).addClass('select_line_on');
            });

            // 이벤트 등록
            this._buttonEvent();
            this._changeEvent();
        },
        set_line: function (line) {
            var self = this;
            var tr = self.element.find('tbody tr');

            $.each(line, function (i) {
                let add_tr = '<tr><td>' + (i + 1) + '</td><td>' + orgInfo.key_value[this.user_code] + '</td></tr>';
                self.element.find('tbody').append(add_tr);
            });
        },
        get_line: function () {
            var self = this;
            var tr = self.element.find('tbody tr');
            var approval_line_data = new Array;
            $.each(tr, function (index) {
                var user_code = $(this).find('select.select2').val();
                var agreement = $(this).find('input[type="radio"]').is(":checked");
                approval_line_data[index] = {};
                approval_line_data[index].user_code = user_code;
                approval_line_data[index].agreement = agreement;
            });
            // console.log(approval_line_data);
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
    };
    var approval_line = new Approval_line();


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

    // 로딩 삭제
    $(".fa-loading-wrapper").remove();

});

