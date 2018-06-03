/**
 * Created by 서정석 on 2016/11/24.
 */

requirejs([
    'session', 'userUploadFiles_v2', 'userRepoSelect_v2',
    'jquery', 'app',
], function (session) {

    var deletable_file = window.myVar.deletable_file || null,
        recent_file = window.myVar.recent_file || null;

    $('.fileinput-area').userUploadFiles({
        // 저장경로가 필요시 path를 Get으로 전송(단, 일반 저장일 경우 - 기존 결재서류와 경로 동일하게 하기 위해)
        url: '/common/uploadfile_handle/up_file?path=approval/user_draft_file',
        deletable_file: deletable_file,         // 삭제 처리 가능 파일 (문서 수정시)
    });

    $('.btn-default').on('click', function () {
        if ($.isFunction(opener.$)) {        // todo 걷어내야할 곳
            opener.$.get_doc_files();
        }
        window.close();
    });

    /*
    // 저장소 업로드 Plugin
    $('.fileinput-area').userRepoSelect({
        recent_file: recent_file,
    });
    */

    // 로딩 삭제
    $(".fa-loading-wrapper").remove();
});

