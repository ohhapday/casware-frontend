/**
 * Created by 서정석 on 2016/11/24.
 * 조직도 Tree 생성
 */

define([
    'session', 'orgInfo',
    'jqxcore', 'jqxgrid', 'jqxgrid.selection', 'jqxbuttons', 'jqxscrollbar', 'jqxdata', 'jqxtree',
], function (session, orgInfo) {

    var pluginName = 'organizationTree',
        defaults = {},
        html = {};

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.odata = this.options.odata;        // 생성할 Tree 데이터

        this._init();
        this._initEvent();
    }

    Plugin.prototype = {
        _init: function () {
            var source = {
                datatype: "json",
                datafields: [
                    {name: 'id'},
                    {name: 'parentid'},
                    {name: 'text'},
                    {name: 'value'},
                    {name: 'checked'}
                ],
                id: 'id',
                localdata: this.odata
            };
            var dataAdapter = new $.jqx.dataAdapter(source);
            dataAdapter.dataBind();
            var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{
                name: 'text',
                map: 'label'
            }]);

            $(this.element).jqxTree({
                theme: 'light',
                source: records,
                width: '100%',
                height: '250px'
            });
        },
        _initEvent: function () {
            $(this.element).jqxTree('expandItem', $('#' + session.dept_code)[0]);      // 소속된 조직Tab 펼쳐짐
            var test = $(this.element).find('li').is('#' + session.user_code);
            if (test) {
                $(this.element).jqxTree('selectItem', $('#' + session.user_code)[0]);      // 사원 선택
            } else {
                $(this.element).jqxTree('expandAll');      // 부서 선택
                $(this.element).jqxTree('selectItem', $('#' + session.dept_code)[0]);      // 부서 선택
            }
        },
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };
});

