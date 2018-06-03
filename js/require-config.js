/* eslint-disable no-unused-vars */
/**
 * Created by 서정석 on 2016/11/24.
 * requirejs config 파일
 */
var requirejs = ({
    urlArgs: 'bust=' + new Date().getFullYear() + (new Date().getMonth() + 1) + new Date().getDate(),
    baseUrl: '/bower_components',
    paths: {
        // 플러그인 정의
        'jquery': 'jquery/dist/jquery.min',
        'jqueryui': 'jquery-ui/jquery-ui.min',
        'bootstrap': 'bootstrap/dist/js/bootstrap',
        'app': 'AdminLTE/dist/js/app.min',
        'icheck': 'iCheck/icheck.min',
        'select2': 'select2/dist/js/select2.min',
        'select2-ko': 'select2/dist/js/i18n/ko',
        'faloading': 'jQuery_loading/jquery.faloading-0.1',
        'moment': 'moment/min/moment-with-locales.min',
        'moment-timezone': 'moment-timezone/builds/moment-timezone-with-data.min',
        'fullcalendar': 'fullcalendar/dist/fullcalendar.min',
        'fullcalendar-ko': 'fullcalendar/dist/locale/ko',
        'datetimepicker': 'eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min',
        'ckeditor': 'ckeditor_no_bower/ckeditor',
        'jquery-slimscroll': 'jquery-slimscroll/jquery.slimscroll.min',
        'imagesloaded': 'imagesloaded/imagesloaded',
        'jmarquee': 'jquery.marquee/jquery.marquee.min',
        'datatables.net': 'datatables.net/js/jquery.dataTables.min',
        'dataTables-bootstrap': 'datatables.net-bs/js/dataTables.bootstrap.min',
        'dataTables-rowgroup': 'datatables-rowsgroup/dataTables.rowsGroup',
        'noUiSlider': 'nouislider/distribute/nouislider.min',
        'wNumb': 'nouislider/documentation/assets/wNumb',
        'chartjs': 'Chart.js/dist/Chart.bundle',
        'highchart': 'highcharts/highcharts',
        'highchart_exporting': 'highcharts/modules/exporting',
        'highchart-3d': 'highcharts/highcharts-3d',
        'rating': 'jquery-bar-rating/dist/jquery.barrating.min',
        'jquery-popup-overlay': 'jquery-popup-overlay/jquery.popupoverlay',
        'jVectorMap': 'jvectormap/jquery-jvectormap',
        'jVectorMap-world-mill': 'jvectormap/tests/assets/jquery-jvectormap-world-mill-en',
        /* blueimp-file-upload 플로그인 */
        'load-image': 'blueimp-load-image/js/load-image.all.min',
        'load-image-exif': 'blueimp-load-image/js/load-image-exif',
        'load-image-meta': 'blueimp-load-image/js/load-image-meta',
        'load-image-scale': 'blueimp-load-image/js/load-image-scale',
        'jquery.ui.widget': 'blueimp-file-upload/js/vendor/jquery.ui.widget',
        'jquery.iframe-transport': 'blueimp-file-upload/js/jquery.iframe-transport',
        'jquery.fileupload': 'blueimp-file-upload/js/jquery.fileupload',
        'jquery.fileupload-process': 'blueimp-file-upload/js/jquery.fileupload-process',
        'jquery.fileupload-image': 'blueimp-file-upload/js/jquery.fileupload-image',
        'canvas-to-blob': 'blueimp-canvas-to-blob/js/canvas-to-blob',
        /* 사용자 정의 플러그인 */
        'approval': '../dist/js/approval',
        'file-upload': '../dist/js/common/fileUpload',
        'myFn': '../dist/js/common/myFn',
        'orgInfo': '../dist/js/common/orgInfo',
        'organization_tree': '../dist/js/common/organizationTree',
        'rgb2hex': '../dist/js/js',
        'session': '../dist/js/common/session',
        'select2Search': '../dist/js/common/select2Search',
        'select2UserSearch': '../dist/js/common/select2UserSearch',
        'userUploadFiles_v2': '../dist/js/common/userUploadFiles_v2',
        'userRepoSelect_v2': '../dist/js/common/userRepoSelect_v2',
        'webSpeech': '../dist/js/common/webSpeech',
        'fontSizeUpdown': '../dist/js/common/fontsize_updown',
        /* jqx 플러그인 */
        'jqxcore': 'jqwidgets/jqwidgets/jqxcore',
        'jqxgrid': 'jqwidgets/jqwidgets/jqxgrid',
        'jqxbuttons': 'jqwidgets/jqwidgets/jqxbuttons',
        'jqxscrollbar': 'jqwidgets/jqwidgets/jqxscrollbar',
        'jqxmenu': 'jqwidgets/jqwidgets/jqxmenu',
        'jqxdata': 'jqwidgets/jqwidgets/jqxdata',
        'jqxdatatable': 'jqwidgets/jqwidgets/jqxdatatable',
        'jqxtree': 'jqwidgets/jqwidgets/jqxtree',
        'jqxgrid.sort': 'jqwidgets/jqwidgets/jqxgrid.sort',
        'jqxgrid.aggregates': 'jqwidgets/jqwidgets/jqxgrid.aggregates',
        'jqxgrid.columnsresize': 'jqwidgets/jqwidgets/jqxgrid.columnsresize',
        'jqxgrid.selection': 'jqwidgets/jqwidgets/jqxgrid.selection',
    },
    shim: {
        'bootstrap': ['jquery'],
        'app': ['jquery', 'bootstrap'],
        'icheck': ['jquery'],
        'select2': ['jquery'],
        'select2-ko': ['jquery', 'select2'],
        'faloading': ['jquery'],
        'moment': {
            deps: ['jquery']
        },
        'moment-timezone': {
            deps: ['jquery', 'moment']
        },
        'fullcalendar': ['jquery', 'moment'],
        'fullcalendar-ko': ['jquery', 'fullcalendar'],
        'ckeditor': {
            export: 'CKEDITOR',
            deps: ['jquery']
        },
        'jquery-slimscroll': ['jquery'],
        'dataTables-rowgroup': ['jquery', 'datatables.net'],
        'imagesloaded': ['jquery'],
        'wNumb': ['noUiSlider'],
        'jmarquee': ['jquery'],
        'highcharts': {
            export: 'Highcharts',
            deps: ['jquery']
        },
        'highchart-3d': ['highchart'],
        'highchart_exporting': ['highchart'],
        'jquery-popup-overlay': ['jquery', 'bootstrap'],
        'jVectorMap': ['jquery'],
        'jVectorMap-world-mill': ['jVectorMap'],
        /* blueimp-file-upload 플로그인 */
        'load-image': ['jquery'],
        'jquery.ui.widget': ['jquery', 'jqueryui'],
        'jquery.fileupload': ['jquery', 'load-image', 'jquery.ui.widget'],
        'jquery.fileupload-process': ['jquery', 'jquery.fileupload'],
        'jquery.fileupload-image': ['jquery', 'jquery.fileupload'],
        /* 사용자 정의 플러그인 */
        'approval': ['jquery'],
        'select2Search': ['jquery', 'select2'],
        'select2UserSearch': ['jquery'],
        'userUploadFiles_v2': [
            'jquery', 'load-image', 'jquery.ui.widget', 'jquery.iframe-transport',
            'jquery.fileupload', 'jquery.fileupload-process', 'jquery.fileupload-image'
        ],
        'file-upload': [
            'jquery', 'load-image', 'jquery.ui.widget', 'jquery.iframe-transport',
            'jquery.fileupload', 'jquery.fileupload-process', 'jquery.fileupload-image'
        ],
        /* jqx 플러그인 */
        'jqxcore': {
            export: '$',
            deps: ['jquery']
        },
        'jqxgrid': {
            export: '$',
            deps: ['jquery', 'jqxcore']
        },
        'jqxgrid.selection': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxbuttons': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxscrollbar': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxmenu': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxdata': {
            export: '$',
            deps: ['jquery', 'jqxcore']
        },
        'jqxdatatable': {
            export: '$',
            deps: ['jquery', 'jqxcore']
        },
        'jqxtree': {
            export: '$',
            deps: ['jquery', 'jqxcore']
        },
        'jqxgrid.sort': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxgrid.aggregates': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
        'jqxgrid.columnsresize': {
            export: '$',
            deps: ['jquery', 'jqxcore', 'jqxgrid']
        },
    }
});