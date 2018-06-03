/**
 * Created by 서정석 on 2016/11/24.
 */

requirejs([
    'session', 'userUploadFiles_v2', 'userRepoSelect_v2',
    'jquery', 'app',
], function (session) {

    let document_no = location.pathname.split('/')[3];              // 문서 번호
    let index = location.pathname.split('/')[4];                    // 대응대는 파일
    let deletable_file = null;              // 파일 리스트

    (function () {
        $.ajax({
            async: false,
            url: "/seal_doc/get_file_lists",
            type: "get",
            dataType: "json",
            data: {
                document_no: document_no,
                index: index,
            },
            success: function (data, status, xhr) {
                deletable_file = data;
                $('.fa-loading-wrapper').hide();
            }
        });
    })();

    $('.fileinput-area').userUploadFiles({
        // 저장경로가 필요시 path를 Get으로 전송(단, 일반 저장일 경우 - 기존 결재서류와 경로 동일하게 하기 위해)
        url: '/common/uploadfile_handle/up_file?path=userfile/hr',
        deletable_file: deletable_file,
        numberOfFiles: 1,
    });

    $('.btn-default').on('click', function () {
        window.close();
    });

    opener.$.fn.rend_table();

    $(".fa-loading-wrapper").remove();
});

