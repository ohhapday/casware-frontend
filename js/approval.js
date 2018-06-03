/**
 * Created by 서정석 on 2016/03/15.
 */

"use strict";
/**
 * 모달 생성을 위한 jqxTree 바인드 함수 ( dept 구분 )
 * @param dept
 * @param user_code
 * @param dept_code
 */
var jqxTree_bind = function (dept, user_code, dept_code) {
    var odata = null;
    $.ajax({
        async: false,
        method: 'post',
        url: "/ajax_common/dept_user_list/" + dept,
        data: {user_code: user_code},
        success: function (data, status, xhr) {
            odata = jQuery.parseJSON(data);
        }
    });

    var source;
    source = {
        datatype: "json",
        datafields: [
            {name: 'id'},
            {name: 'parentid'},
            {name: 'text'},
            {name: 'value'},
            {name: 'checked'}
        ],
        id: 'id',
        localdata: odata
    };

    // create data adapter.
    var dataAdapter = new $.jqx.dataAdapter(source);
    dataAdapter.dataBind();
    var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{name: 'text', map: 'label'}]);

    // todolist records 바인딩시 시간 오래 걸림 (UI 변경 필요 - 부서별로)
    $('#modal_pop #jqxTree').jqxTree({
        source: records,
//            checkboxes: true,
        width: '100%',
        height: '300px'
    });
    var my_dept_code = dept_code;
    $("#modal_pop #jqxTree").jqxTree('expandItem', $('#' + my_dept_code)[0]);     // 소속된 조직Tab 펼쳐짐
    $("#modal_pop #jqxTree").jqxTree('selectItem', $('#' + my_dept_code)[0]);     	// 소속된 조직Tab 펼쳐짐
}

/**
 * 부서 선택 후 jqxTree 바인드 함수
 * @param dept
 * @param user_code
 */
var jqxTree_userbind = function (dept, user_code) {
    var odata = null;
    $.ajax({
        async: false,
        method: 'post',
        url: "/ajax_common/dept_user_list/" + dept,
        data: {user_code: user_code},
        success: function (data, status, xhr) {
            odata = jQuery.parseJSON(data);
        }
    });

    var source;
    source = {
        datatype: "json",
        datafields: [
            {name: 'id'},
            {name: 'parentid'},
            {name: 'text'},
            {name: 'value'},
            {name: 'checked'}
        ],
        id: 'id',
        localdata: odata
    };

    // create data adapter.
    var dataAdapter = new $.jqx.dataAdapter(source);
    dataAdapter.dataBind();
    var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{name: 'text', map: 'label'}]);

    // todolist records 바인딩시 시간 오래 걸림 (UI 변경 필요 - 부서별로)
    $('#modal_pop #jqxTree2').jqxTree({
        source: records,
        checkboxes: true,
        width: '100%',
        height: '300px'
    });
}

/**
 * 임직원 선택 모달 팝업 생성
 * @param dept_code
 * @param user_code
 */
var modal_user_select = function (dept_code, user_code) {
    $('#modal_pop').modal("show");
    $('#modal_pop .modal-title').html('사원 선택');		// 헤더 생성
    $('#modal_pop .modal-body').html('' +					// 바디 생성
        '<div style="margin-top: 7px; width: 49%; float: left;">' +
        '</div>' +
        '<div class="col-sm-6 radio" style="margin-top: 0px; margin-left: 10px; width: 49%; float: left;">' +
        '   <label>' +
        '       <input type="checkbox" id="check_all">전체선택' +
        '   </label>' +
        '   <label>' +
        '       <input type="checkbox" id="uncheck_all">전체해제' +
        '   </label>' +
        '</div>' +
        '<div id="jqxWidget" style="width: 49%; float: left;">' +
        '	<div>' +
        '		<div id="jqxTree"></div>' +
        '	</div>' +
        '</div>' +
        '<div id="jqxWidget2" style="width: 49%; float: left;">' +
        '	<div>' +
        '		<div id="jqxTree2" role="tree" data-role="treeview" tabindex="1" class="jqx-widget jqx-widget-content jqx-tree" style="margin-left: 10px; height: 300px; width: 100%;"></div>' +
        '	</div>' +
        '</div>' +
        '<div style="clear: both"></div>' +
        '<div style="margin-top: 7px; width: 100%; float: left;">' +
        '   <select class="form-control" id="select_box" multiple style="width: 100%; border: 1px solid #C0C0C0">' +
        '   </select>' +
        '</div>' +
        '<div style="clear: both"></div>' +
        '');
    $('#modal_pop .modal-footer').html('' +					// 푸터 생성
        '<div class="btn-group" role="group">' +
        '	<button type="button" class="btn btn-primary" id="select_user"><i class="fa fa-save"></i> 선택</button>' +
        '	<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-close"></i> 닫기</button>' +
        '</div>');

    jqxTree_bind('dept', user_code, dept_code);			// 조직정보 바인드
    jqxTree_userbind(dept_code, user_code);

    $('.jqx-checkbox').css('margin-top', '3.5px');
    $("#jqxTree").jqxTree('focus');

    // 담당자 선택
    /* $("#select_box").select2({
        placeholder: '지정된 담당자 ',
        multiple: true,
        closeOnSelect: false
    });*/

    $('#select_box').select2UserSearch({
        default_user_code: []
    });

    // 부서 선택
    $('#jqxTree').on('select', function (event) {
        var args = event.args;
        var item = $(this).jqxTree('getItem', args.element);
        var label = item.label;
        jqxTree_userbind(item.id);
        $('#check_all').attr('checked', false);
        $('#uncheck_all').attr('checked', false);
    });

    // 전체선택, 전체해제 처리
    $('#check_all').click(function () {
        var items = $('#jqxTree2').jqxTree('getItems');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            $("#jqxTree2").jqxTree('checkItem', item.element, true);
        }
        $('#uncheck_all').attr('checked', false);
    });
    $('#uncheck_all').click(function () {
        var items = $('#jqxTree2').jqxTree('getItems');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            $("#jqxTree2").jqxTree('checkItem', item.element, false);
        }
        $('#check_all').attr('checked', false);
    });

    // 담당자 체크
    var data = [];
    $('#jqxTree2').on('checkChange', function (event) {
        var args = event.args;
        var item = $(this).jqxTree('getItem', args.element);
        var checked = args.checked;
        var element = [{id: item.id, text: item.label}];
        if (checked) {
            data = $.extend(data, $("#select_box").val());
            $("#select_box").select2({
                data: element
            });

            data.push(item.id);
            $("#select_box").val(data).trigger("change");
        }
        else {
            $("#select_box option[value='" + item.id + "']").remove();
            $("#select_box").select2();
        }
    });
    $('#select_box').on("select2:unselect",
        function (e) {
            $("#select_box option[value='" + e.params.data.id + "']").remove();
        }
    );
}

/**
 * 직무분류 즐겨찾기 선택창 바인드
 */
var jqx_jobskill_bind = function () {
    var source =
        {
            dataType: "json",
            dataFields: [
                {name: 'idx', type: 'number'},
                {name: 'parent_id', type: 'string'},
                {name: 'code_id', type: 'string'},
                {name: 'code_name', type: 'string'},
                {name: 'memo', type: 'string'},
                {name: 'checked'}
            ],
            hierarchy: {
                keyDataField: {name: 'code_id'},
                parentDataField: {name: 'parent_id'}
            },
            id: 'idx',
            url: "/jobskill/ajax_jobskill/select"
        };

    var dataAdapter = new $.jqx.dataAdapter(source, {
        loadComplete: function () {
        }
    });

    $('#modal_pop #treeGrid').jqxTreeGrid({
        width: 700,
        source: dataAdapter,
        height: 300,
        filterable: true,
        checkboxes: true,
        hierarchicalCheckboxes: true,
        ready: function () {
            // called when the DatatreeGrid is loaded.
            $("#modal_pop #treeGrid").jqxTreeGrid('expandRow', 1);
        },
        pagerButtonsCount: 5,
        columns: [
            {text: '직무분류', dataField: "code_name", align: 'center', width: '270px', cellClassName: cellClass},
            {text: '비고', dataField: "memo", align: 'center', cellClassName: cellClass}
        ]
    });

    $('#modal_pop #treeGrid').on('bindingComplete', function (event) {
        // $("#modal_pop #treeGrid").jqxTreeGrid('expandAll');
    });
    $('#modal_pop #treeGrid').on('filter', function (event) {
        $("#modal_pop #treeGrid").jqxTreeGrid('expandAll');
        $("#modal_pop #treeGrid").jqxTreeGrid('uncheckRow', 1);
    });
}

/**
 * 직무분류 개인창 바인드
 * @param user_name
 */
var jqx_jobskill_bind2 = function (user_name) {
    var source =
        {
            dataType: "json",
            dataFields: [
                {name: 'idx', type: 'number'},
                {name: 'parent_id', type: 'string'},
                {name: 'code_id', type: 'string'},
                {name: 'code_name', type: 'string'},
                {name: 'memo', type: 'string'},
                {name: 'in_charge', type: 'string'},
                {name: 'in_charge_code', type: 'string'},
                {name: 'refer', type: 'string'},
                {name: 'refer_code', type: 'string'},
                {name: 'full_code_name', type: 'string'},
                {name: 'checked'}
            ],
            hierarchy: {
                keyDataField: {name: 'code_id'},
                parentDataField: {name: 'parent_id'}
            },
            id: 'idx',
            url: "/jobskill/ajax_jobskill/user_select"
        };

    var dataAdapter = new $.jqx.dataAdapter(source, {
        loadComplete: function () {
        }
    });

    // todolist records 바인딩시 시간 오래 걸림 (UI 변경 필요 - 부서별로)
    $('#modal_pop #treeGrid2').jqxTreeGrid({
        width: 700,
        source: dataAdapter,
        height: 300,
        filterable: true,
        selectionMode: "singleRow",
        ready: function () {
        },
        pagerButtonsCount: 5,
        columns: [
            {
                text: user_name + '님의 직무분류',
                dataField: "code_name",
                align: 'center',
                width: '270px',
                cellClassName: cellClass
            },
            {text: '비고', dataField: "memo", align: 'center', cellClassName: cellClass}
        ]
    });

    $('#modal_pop #treeGrid2').on('bindingComplete', function (event) {
        $("#modal_pop #treeGrid2").jqxTreeGrid('expandRow', 1);
        if (user_name == "김동진") {					// 회장님의 경우 전사프로젝트 펼침
            $("#modal_pop #treeGrid2").jqxTreeGrid('expandRow', 1826);
        }
        // $("#modal_pop #treeGrid2").jqxTreeGrid('uncheckRow', 1);
        $("#modal_pop #treeGrid2").jqxTreeGrid('expandAll');
    });

    $('#modal_pop #treeGrid2').on('filter', function (event) {
        $("#modal_pop #treeGrid2").jqxTreeGrid('expandAll');
        $("#modal_pop #treeGrid2").jqxTreeGrid('uncheckRow', 1);
    });
}

/**
 * 개인 직무분류 팝업 생성
 * @param user_name
 */
var jobskill_popup = function (user_name) {
    $('#modal_pop').modal("show");
    $('#modal_pop .modal-title').html('직무 분류');		// 헤더 생성
    $('#modal_pop .modal-body').html('' +					// 바디 생성
        '<div id="jqxWidget" style="width: 100%; display: none;">' +
        '	<div>' +
        '		<div id="treeGrid"></div>' +
        '	</div>' +
        '       <div class="btn-group pull-right" role="group" style="margin: 4px 0">' +
        '           <button type="button" class="btn btn-primary" id="code_plus"><i class="fa fa-plus"></i></button>' +
        '           <button type="button" class="btn bg-purple" id="code_minus"><i class="fa fa-minus"></i></button>' +
        '       </div>' +
        '</div>' +
        '<div id="treeGrid2" style="width: 100%; margin-top: 10px;">' +
        '</div>' +
        '');
    $('#modal_pop .modal-footer').html('' +					// 푸터 생성
        '<div class="btn-group pull-left" role="group">' +
        '   <button type="button" class="btn btn-success" id="btn_open"><i class="fa fa-folder-open"></i> 즐겨찾기추가' +
        '   </button>' +
        '   <button type="button" class="btn btn-primary" id="btn_expand"><i class="fa fa-expand"></i>' +
        '   </button>' +
        '   <button type="button" class="btn bg-purple" id="btn_collapse"><i class="fa fa-compress"></i>' +
        '   </button>' +
        '</div>' +
        '<div class="btn-group" role="group">' +
        '	<button type="button" class="btn btn-primary" id="select_code"><i class="fa fa-save"></i> 지정</button>' +
        '	<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-close"></i> 닫기</button>' +
        '</div>');

    $('.modal-content').css('width', '730px');

    jqx_jobskill_bind();			// 직무분류 바인드
    jqx_jobskill_bind2(user_name);			// 개인 직무분류 바인드

    // 직무분류표 열기
    $('#btn_open').click(function () {
        $('#jqxWidget').fadeIn('slow');
        $('#modal_pop #treeGrid2').jqxTreeGrid({
            checkboxes: true,
            hierarchicalCheckboxes: true
        });
    });

    $('#btn_expand').click(function () {
        $("#treeGrid2").jqxTreeGrid('expandAll');
    });

    $('#btn_collapse').click(function () {
        $("#treeGrid2").jqxTreeGrid('collapseAll');
        $("#treeGrid2").jqxTreeGrid('expandRow', 1);
    });

    // 직무코드 개인 등록
    $('#code_plus').click(function () {
        var checkedRows = $("#treeGrid").jqxTreeGrid('getCheckedRows');
        var rowData = new Array();
        for (var i = 0; i < checkedRows.length; i++) {
            rowData[i] = checkedRows[i].code_id;
        }
        $.ajax({
            url: "/jobskill/ajax_jobskill/user_update",
            type: "post",
            async: false,
            data: {
                code_id: rowData,
                mode: 'insert'
            },
            success: function (data) {
                if (data == 'error') alert('에러발생');
                else {
                    $("#treeGrid2").jqxTreeGrid('updateBoundData');
                    $("#treeGrid").jqxTreeGrid('uncheckRow', 1);
                }
            }
        });
    });

    // 직무분류 개인 삭제
    $('#code_minus').click(function () {
        var checkedRows = $("#treeGrid2").jqxTreeGrid('getCheckedRows');
        var rowData = new Array();
        for (var i = 0; i < checkedRows.length; i++) {
            rowData[i] = checkedRows[i].code_id;
        }
        $.ajax({
            url: "/jobskill/ajax_jobskill/user_update",
            type: "post",
            async: false,
            data: {
                code_id: rowData,
                mode: 'delete'
            },
            success: function (data) {
                if (data == 'error') alert('에러발생');
                else {
                    $("#treeGrid2").jqxTreeGrid('updateBoundData');
                }
            }
        });
    });

    var rowKey = null;
    var obj = null;
    $("#treeGrid2").on('rowSelect', function (event) {
        var selection = $("#treeGrid2").jqxTreeGrid('getSelection');
        var args = event.args;

        if (selection[0].level != 2 && selection[0].parent_id != 'BY') {
            alert('[실행업무]를 선택해 주시기 바랍니다.');
            return;
        }
        obj = event.args;
        rowKey = args.key;
    });

    // 직무코드 선택시
    $('#select_code').click(function () {
        $('#jobskill_code').val(obj.row.code_id);
        $('#jobskill').val(obj.row.full_code_name);
        // 프로젝트 담당자 지정
        if (obj.row.in_charge_code) {
            $('#from_user_code').val(obj.row.in_charge_code);
            $('#from_user').val(obj.row.in_charge);
            // 프로젝트 참조자 지정
            $('#refer_user_code').val(obj.row.refer_code);
            $('#refer_user').val(obj.row.refer);
        }
        $('#modal_pop').modal("hide");
    });

    // 직무코드 더블클릭시 자동 선택
    /*	$('#treeGrid2').on('rowDoubleClick', function (event) {
     var args = event.args;
     obj = event.args;

     $('#jobskill_code').val(obj.row.code_id);
     $('#jobskill').val(obj.row.code_name);
     // 프로젝트 담당자 지정
     if (obj.row.in_charge_code) {
     $('#from_user_code').val(obj.row.in_charge_code);
     $('#from_user').val(obj.row.in_charge);
     // 프로젝트 참조자 지정
     $('#refer_user_code').val(obj.row.refer_code);
     $('#refer_user').val(obj.row.refer);
     }
     $('#modal_pop').modal("hide");
     });*/
}

/**
 * 결재선 부서 정보
 * @param dept
 * @param user_code
 * @param dept_code
 */
var draft_bind = function (dept, user_code, dept_code) {
    var odata = null;
    $.ajax({
        async: false,
        method: 'post',
        url: "/ajax_common/dept_user_list2/" + dept,
        data: {user_code: user_code},
        success: function (data, status, xhr) {
            odata = jQuery.parseJSON(data);
        }
    });

    var source;
    source = {
        datatype: "json",
        datafields: [
            {name: 'id'},
            {name: 'parentid'},
            {name: 'text'},
            {name: 'value'},
            {name: 'checked'}
        ],
        id: 'id',
        localdata: odata
    };

    // create data adapter.
    var dataAdapter = new $.jqx.dataAdapter(source);
    dataAdapter.dataBind();
    var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{name: 'text', map: 'label'}]);

    $('#modal_pop #jqxTree').jqxTree({
        source: records,
//            checkboxes: true,
        width: '100%',
        height: '300px'
    });
    var my_dept_code = dept_code;
    $("#modal_pop #jqxTree").jqxTree('expandItem', $('#' + my_dept_code)[0]);     // 소속된 조직Tab 펼쳐짐
    $("#modal_pop #jqxTree").jqxTree('selectItem', $('#' + my_dept_code)[0]);     	// 소속된 조직Tab 펼쳐짐
}

/**
 * 결재선 사원 정보
 * @param dept
 * @param user_code
 */
var draft_userbind = function (dept, user_code) {
    var odata = null;
    $.ajax({
        async: false,
        method: 'post',
        url: "/ajax_common/dept_user_list/" + dept,
        data: {user_code: user_code},
        success: function (data, status, xhr) {
            odata = jQuery.parseJSON(data);
        }
    });

    var source;
    source = {
        datatype: "json",
        datafields: [
            {name: 'id'},
            {name: 'parentid'},
            {name: 'text'},
            {name: 'value'},
            {name: 'checked'}
        ],
        id: 'id',
        localdata: odata
    };

    var dataAdapter = new $.jqx.dataAdapter(source);
    dataAdapter.dataBind();
    var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{name: 'text', map: 'label'}]);

    $('#modal_pop #jqxTree2').jqxTree({
        source: records,
        width: '100%',
        height: '199px'
    });
}

/**
 * 결재선 지정 팝업 생성
 * @param user_info
 * @param draft_line
 * @returns {*[]}
 */
var draft_line_select = function (user_info, draft_line) {
    $('#modal_pop').modal("show");
    $('#modal_pop .modal-title').html('결재선 지정');		// 헤더 생성
    $('#modal_pop .modal-body').html('' +					// 바디 생성
        '<div id="jqxWidget" style="width: 30%; float: left;">' +
        '	<div>조직도' +
        '		<div id="jqxTree"></div>' +
        '	</div>' +
        '</div>' +
        '<div id="jqxWidget2" style="width: 26%; float: left;">' +
        '	<div>임직원' +
        '		<div id="jqxTree2" role="tree" data-role="treeview" tabindex="1" class="jqx-widget jqx-widget-content jqx-tree" style="margin-left: 10px; height: 300px; width: 100%;"></div>' +
        '	</div>' +
        '   <div class="btn-group pull-right" role="group" style="margin: 4px 0">' +
        '       <button type="button" class="btn btn-primary" id="user_plus"><i class="fa fa-plus"></i></button>' +
        '       <button type="button" class="btn bg-purple" id="user_minus"><i class="fa fa-minus"></i></button>' +
        '   </div>' +
        '</div>' +
        '<div style="margin-left: 20px; width: 40%; float: left;">' +
        '   <div>결재선</div>' +
        '	<div id="jqxgrid">' +
        '	</div>' +
        '   <div class="btn-group pull-right" role="group" style="margin: 4px 0">' +
        '       <select class="form-control" id="draft_line_change">' +
        '          <option value="">순번변경</option>' +
        '          <option value="1">1</option>' +
        '          <option value="2">2</option>' +
        '          <option value="3">3</option>' +
        '          <option value="4">4</option>' +
        '          <option value="5">5</option>' +
        '          <option value="6">6</option>' +
        '       </select>' +
        '   </div>' +
        '</div>' +
        '<div style="clear: both"></div>' +
        '');
    $('#modal_pop .modal-footer').html('' +					// 푸터 생성
        '<div class="btn-group" role="group">' +
        '	<button type="button" class="btn btn-primary" id="select_user"><i class="fa fa-save"></i> 지정</button>' +
        '	<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-close"></i> 취소</button>' +
        '</div>');
    $('.modal-dialog').css('width', '700px');

    draft_bind('dept', user_info.user_code, user_info.dept_code);			// 조직정보 바인드
    draft_userbind(user_info.dept_code, user_info.user_code);

    // 부서 선택
    $('#jqxTree').on('select', function (event) {
        var args = event.args;
        var item = $(this).jqxTree('getItem', args.element);
        var label = item.label;
        draft_userbind(item.id);
    });

    /*	var draft_line = [
     {
     "num": "1",
     "dept": user_info.dept,
     "user_name": user_info.position + user_info.user_name,
     "user_code": user_info.user_code
     },
     {"num": "2", "dept": "", "user_name": "", "user_code": ""},
     {"num": "3", "dept": "", "user_name": "", "user_code": ""},
     {"num": "4", "dept": "", "user_name": "", "user_code": ""},
     {"num": "5", "dept": "", "user_name": "", "user_code": ""},
     {"num": "6", "dept": "", "user_name": "", "user_code": ""}
     ];*/

    // 임직원 추가
    $('#user_plus').click(function () {
        var item = $('#jqxTree2').jqxTree('getSelectedItem');
        var dept_item = $('#jqxTree').jqxTree('getSelectedItem');
        if (!item) {
            alert('결재선에서 직원을 선택해 주시기 바랍니다.');
            return;
        }
        var line_check;
        $.each(draft_line, function () {
            if (item.id == this.user_code) {
                line_check = false;
            }
        });
        if (line_check == false) {
            alert('이미 결재선에 포함되어 있습니다.');
            return;
        }

        for (i = 0; i < draft_line.length; i++) {
            if (draft_line[i].user_code == "") {
                draft_line[i].dept = dept_item.label;
                draft_line[i].user_name = item.label;
                draft_line[i].user_code = item.id;
                break;
            }
        }
        $('#jqxgrid').jqxGrid('updatebounddata');
    });

    // 임직원 삭제
    $('#user_minus').click(function () {
        var rowindex = $('#jqxgrid').jqxGrid('getselectedrowindex');
        var item = $('#jqxgrid').jqxGrid('getrowdata', rowindex);
        if (!item) {
            alert('직원을 선택해 주시기 바랍니다.');
            return;
        }
        for (i = 0; i < draft_line.length; i++) {
            if (draft_line[i].user_code == item.user_code) {
                draft_line[i].dept = "";
                draft_line[i].user_name = "";
                draft_line[i].user_code = "";
                break;
            }
        }
        $('#jqxgrid').jqxGrid('updatebounddata');
    });

    // 결재순번 변경
    $('#draft_line_change').change(function (value) {
        var rowindex = $('#jqxgrid').jqxGrid('getselectedrowindex');
        var item = $('#jqxgrid').jqxGrid('getrowdata', rowindex);
        if (!item) {
            alert('직원을 선택해 주시기 바랍니다.');
            return;
        }
        if ($(this).val() == "") return;
        if (draft_line[$(this).val() - 1].user_code != "") {
            alert('결재순번이 중복됩니다.');
            return;
        }
        draft_line[$(this).val() - 1].dept = item.dept;
        draft_line[$(this).val() - 1].user_name = item.user_name;
        draft_line[$(this).val() - 1].user_code = item.user_code;

        draft_line[item.num - 1].dept = "";
        draft_line[item.num - 1].user_name = "";
        draft_line[item.num - 1].user_code = "";
        $('#jqxgrid').jqxGrid('selectrow', ($(this).val() - 1));
        $('#jqxgrid').jqxGrid('updatebounddata');
    });

    // 결재라인 Grid
    var source =
        {
            localdata: draft_line,
            datafields: [
                {name: 'num', type: 'string'},
                {name: 'dept', type: 'string'},
                {name: 'user_name', type: 'string'},
                {name: 'user_code', type: 'string'}
            ],
            datatype: "json"
        };
    var dataAdapter = new $.jqx.dataAdapter(source);

    $("#jqxgrid").jqxGrid({
        width: '100%',
        height: 199,
        source: dataAdapter,
        columns: [
            {text: '순번', datafield: 'num', width: 35, align: 'center', cellsAlign: 'center'},
            {text: '부서', datafield: 'dept', width: 112, align: 'center', cellsAlign: 'center'},
            {text: '성명', datafield: 'user_name', width: 120, align: 'center', cellsAlign: 'center'}
        ]
    });

    return draft_line;
}

/**
 1. 모듈 스코프 내에서 사용할 변수 작성
 2. 유틸리티 메소드 작성
 3. DOM 조작 메소드 작성
 4. 이벤트 핸들러 작성
 5. Public 메소드 작성
 http://www.nextree.co.kr/p4150/
 **/