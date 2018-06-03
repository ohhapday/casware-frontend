/**
 * Created by 서정석 on 2016/09/05.
 * 파일 업로드 플러그인을 돕는 Js
 * 첨부파일 삭제 기능 / 폼 전송
 */

"use strict";

$(document).ready(function () {
	if ($('#fileupload').data("blueimp-fileupload")) {
		// 첨부 파일 삭제
		$('#files>p>i').click(function () {
			var obj = $(this).parent();
			$.ajax({
				async: false,
				url: "/common/uploadfile_handle/doc_file_delete/",
				type: "post",
				data: {
					idx: $(this).attr('data-idx')
				},
				success: function (data, status, xhr) {
					obj.fadeOut('slow');
				}
			});
		});

		// 폼 전송 (첨부파일 포함)
		$('.content form').submit(function (e) {
			e.preventDefault();
			var form = this;
			$(".box-footer").faLoading('fa-cog');

			// 직무분류코드 전달
			if ($('#job_code_1st').length > 0) {
				let job_code_3rd = ($('#job_code_3rd').length > 0) ? $('#job_code_3rd').val() + '/' : '';
				let job_code_list = $('#job_code_1st').val() + '/' +
					$('#job_code_2nd').val() + '/' +
					job_code_3rd;

				$('#fileupload').data("blueimp-fileupload").options.url
					= '/common/uploadfile_handle/up_file_use_job_code?file_path=' + job_code_list;
			}

			var obj = $('#fileupload').data("upFile").data_return();    // 파일 전송 처리
			if (obj.length != 0) {
				$.each(obj, function (index) {
					$(this).submit();
				});
				// 파일 업로드 완료후 폼 전송
				var file_cnt = 0;
				$(document).ajaxComplete(function () {
					file_cnt++;
					if (file_cnt == obj.length) {
						form.submit();
					}
				});
			} else {
				form.submit();
			}
		});
	}
});

