/**
 * Created by 서정석 on 2016/07/29.
 */

"use strict";

// 표준노임단가
var user_pay = function (selector) {
	var that = selector;

	$.ajax({
		url: "/in_trade/ajax_intertrade/user_pay",
		type: "get",
		dataType: "json",
		data: {
			user_code: $(that).val()
		},
		success: function (data, status, xhr) {
			let cellAddress = that.parents('tr').find('td:eq(4)').children('input').data('cell');
			that.parents('table').calx('setValue', cellAddress, data.pay);
		}
	});
}

// 직접재료비의 경우 textbox 변경
var gubun_change = function (selector) {
	if (selector.val() !== '10') {
		if (selector.val() !== '20') {
			selector.parents('tr').find('.input-group-btn').css('display', 'none');
			selector.parents('tr').find('input[name|="title[]"]').attr('readonly', false).val('');
			selector.parents('tr').find('input[name|="unit_price[]"]').attr('readonly', false).val('');
		} else {
			selector.parents('tr').find('.input-group-btn').css('display', '');
			selector.parents('tr').find('input[name|="title[]"]').attr('readonly', true).val('');
			selector.parents('tr').find('input[name|="unit_price[]"]').attr('readonly', true).val('');
		}
	}
}

$.each($('.esti_article'), function(){
	$(this).change(function () {
		gubun_change($(this));
	});
});

// 원가단가표 검색 시
var ajax_product_code = function (selector) {
	if(!$('#modal_pop input[name|="keyword"]').val()){
		alert('검색어를 입력해주세요.');
		return;
	}

	if($('#modal_pop input[name|="keyword"]').val().length < 2){
		alert('2글자 이상 입력해주세요.');
		return;
	}

	$.ajax({
		url: '/in_trade/ajax_intertrade/select2_remote_product_code',
		// async: false,
		method: "get",
		data: {'q': $('#modal_pop input[name|="keyword"]').val()},
		dataType: 'json',
		beforeSend: function () {
			$("#product_table").faLoading('fa-cog');
		},
		success: function (data) {
			$('#product_table table tbody tr').remove();
			$.each(data, function(index, obj){
				$('#product_table table tbody').append('' +
					'<tr><td>'+obj.MODEL+'</td><td>'+obj.NAM+'</td><td>'+obj.SIZ+'</td><td>'+obj.DAN+'</td></tr>' +
					'');
			});
			$("#product_table").faLoadingStop();

			// 선택시 처리
			$('#modal_pop table tbody tr').click(function(){
				product_code_select($(this));
			});

			// 더블클릭시 처리 폼으로 전달
			$('#modal_pop table tbody tr').dblclick(function(){
				send_price($(this), selector);
			});
		},
	});
}

// 코드 선택시 처리
var product_code_select = function (selector) {
	selector.parent().children('tr').css('background-color', '').css('color', '#000000');
	selector.css('background-color', '#367fa9').css('color', '#FFFFFF');
}

// 코드 더블클릭 시 처리 폼으로 전달
var send_price = function (selector, parent_selector) {
	// 내용 입력
	let content = parent_selector.parents('tr').find('input[name|="title[]"]');
	content.val(selector.find('td:eq(1)').text() + '[' +
		selector.find('td:eq(2)').text() + ']');
	
	// 가격 입력
	let cellAddress = parent_selector.parents('tr').find('input[name|="unit_price[]"]').data('cell');
	parent_selector.parents('table').calx('setValue', cellAddress, selector.find('td:eq(3)').text());
	
	$('#modal_pop').modal('hide');
}

// 직접입력 버튼시 처리 폼으로 전달
var send_price2 = function (parent_selector) {
	// 내용 입력
	let content = parent_selector.parents('tr').find('input[name|="title[]"]');
	content.val($('#modal_pop #keyword_box').val());

	// 가격 입력
	let cellAddress = parent_selector.parents('tr').find('input[name|="unit_price[]"]').data('cell');
	parent_selector.parents('table').calx('setValue', cellAddress, $('#modal_pop #unit_price_box').val());

	$('#modal_pop').modal('hide');

}

// 직접재료비 선택
var product_code = function (selector) {
	selector.click(function (){
		$('#modal_pop').modal('show');
		$('#modal_pop .modal-title').html('원가단가표 검색');		// 헤더 생성
		$('#modal_pop .modal-body').html('' +
			'<div class="box-body pad">' +
			'   <div class="form-group">' +
			'       <blockquote>' +
			'       <p style="font-size: 14px;">제품명, 자재명 혹은 규격명을 검색해주시기 바랍니다.<br>' +
			'       ERP에 등록되지 않은 제품은 기타 선택후 단가를 기입해 주시기 바랍니다.<br>' +
			'		더블 클릭하시면 원가가 반영됩니다.</p>' +
			'       </blockquote>' +
			'	    <div class="col-sm-12 input-group text-center" style="margin-bottom: 10px;">' +
			'		    <label class="radio-inline">' +
			'				<input type="radio" name="inline_radio" id="inline_radio1" checked> 직접재료비 검색' +
			'			</label>' +
			'		    <label class="radio-inline" style="margin-left: 50px;">' +
			'				<input type="radio" name="inline_radio" id="inline_radio2"> 직접재료비 직접 입력' +
			'			</label>' +
			'	    </div>' +
			'	    <div class="col-sm-12 input-group form-inline hidden" id="modal_input_form">' +
			'			<div class="form-group col-sm-5">' +
			'		    	<input type="text" id="keyword_box" placeholder="직접재료비 내용" class="form-control">' +
			'			</div>' +
			'			<div class="form-group col-sm-3">' +
			'		    	<input type="number" id="unit_price_box" placeholder="단가" class="form-control" min="0">' +
			'			</div>' +
			'			<div class="form-group col-sm-2">' +
			'			    <button type="button" class="btn btn-primary btn-flat">직접 입력</button>' +
			'			</div>' +
			'	    </div>' +
			'	    <div class="col-sm-12 input-group" id="modal_search_form">' +
			'		    <input type="text" id="keyword" name="keyword" placeholder="제품명,자재명,규격명을 2자리 이상 입력해 주세요." class="form-control">' +
			'		    <span class="input-group-btn">' +
			'			    <button type="button" class="btn btn-primary btn-flat">검색</button>' +
			'		    </span>' +
			'	    </div>' +
			'	    <div id="product_table" class="col-sm-12" style="height: 200px; overflow-y: auto; border: 1px #CCC solid; margin-top: 5px;">' +
			'           <table class="table table-bordered table-condensed text-center" style="font-size: 12px;">' +
			'               <col style="width: 25%"><col style="width: 25%"><col style="width: 25%"><col style="width: 25%">' +
			'               <thead><tr><th>제품명</th><th>자재명</th><th>규격명</th><th>단가</th></tr></thead><tbody></tbody>' +
			'           </table>' +
			'	    </div>' +
			'   </div>' +
			'</div>' +
			'');
		$('#modal_pop .modal-footer').html('');

		$('#modal_pop #modal_search_form .btn-primary').click(function () {
			ajax_product_code(selector);
		});
		
		// 입력창/ 검색창 보이기/숨기기
		$('#modal_pop #inline_radio1').click(function () {
			$('#modal_pop #modal_search_form').addClass('show').removeClass('hidden');
			$('#modal_pop #product_table').addClass('show').removeClass('hidden');
			$('#modal_pop #modal_input_form').addClass('hidden').removeClass('show');
		});
		$('#modal_pop #inline_radio2').click(function () {
			$('#modal_pop #modal_search_form').addClass('hidden').removeClass('show');
			$('#modal_pop #product_table').addClass('hidden').removeClass('show');
			$('#modal_pop #modal_input_form').addClass('show').removeClass('hidden');
		});

		// 직접입력
		$('#modal_pop #modal_input_form .btn-flat').click(function () {
			send_price2(selector);
		});

		$('#modal_pop input[name|="keyword"]').keypress(function(e) {
			if (e.which == 13) {/* 13 == enter key@ascii */
				ajax_product_code(selector);
			}
		});
	});
}

// 항목 삭제 기증
var item_delete = function (selector) {
	$.each(selector, function(){
		$(this).parent().click(function(){
			ajax_item_delete($(this));
		});
	});
};

// 항목 DB 삭제
var ajax_item_delete = function (selector) {
	var tbl_name;
	// 견적서인지 비용계산서인지 확인
	if(selector.parents('form').find('#bbs_idx').val() == "2"){
		tbl_name = 'tb_intertrade_estimate';
	} else {
		tbl_name = 'tb_intertrade_cost';
	}
	$.ajax({
		async: false,
		url: "/in_trade/ajax_intertrade/item_delete",
		method: "post",
		data: {
			idx: selector.parents('tr').find('input:hidden').val(),
			tbl_name: tbl_name
		},
		success: function (data, status, xhr) {
			selector.parents('tr').remove();
			$form.calx();
		}
	});
}

// 협의견적가 삭제 기증
var item_delete2 = function (selector) {
	$.each(selector, function(){
		$(this).parent().click(function(){
			ajax_item_delete2($(this));
		});
	});
};

// 항목 DB 삭제
var ajax_item_delete2 = function (selector) {
	var tbl_name = 'tb_intertrade_consult';

	$.ajax({
		async: false,
		url: "/in_trade/ajax_intertrade/item_delete",
		method: "post",
		data: {
			idx: selector.parents('tr').find('input:hidden').val(),
			tbl_name: tbl_name
		},
		success: function (data, status, xhr) {
			selector.parents('tr').remove();
			$form2.calx();
		}
	});
}


/**
 1. 모듈 스코프 내에서 사용할 변수 작성
 2. 유틸리티 메소드 작성
 3. DOM 조작 메소드 작성
 4. 이벤트 핸들러 작성
 5. Public 메소드 작성
 http://www.nextree.co.kr/p4150/
 **/