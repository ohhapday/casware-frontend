/**
 * Created by 서정석 on 2016/12/27.
 * 게시판 쓰기
 */

requirejs([
    'jquery', 'session', 'app', 'myFn',
    'ckeditor', 'jquery-slimscroll', 'faloading', 'userUploadFiles_v2',
], function ($, session, app, myFn) {
    "use strict";

    var category_nm = location.pathname.split('/')[3];      // 카테고리명

    // 페이지 초기화
    (function () {
        // CK에디터 호출
        CKEDITOR.replace('content', {
            width: '100%',
            height: '300px',
            filebrowserImageUploadUrl: '/bower_components/ckeditor_no_bower/upload/php/upload.php?Type=Image' 	//여기 경로로 파일을 전달하여 업로드 시킨다.
        });

        $('.fileinput-area').userUploadFiles({
            // 저장경로가 필요시 path를 Get으로 전송(단, 일반 저장일 경우 - 기존 결재서류와 경로 동일하게 하기 위해)
            url: '/common/uploadfile_handle/up_file?path=approval/user_draft_file',
        });


    }());

    $(".fa-loading-wrapper").remove();
});

