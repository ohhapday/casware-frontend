/* eslint-disable indent */
/**
 * Created by 서정석 on 2018/03/20.
 * 주간 감사 기도 view
 */

window.requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment',
    '/dist/js/app/pray/dept_lists.js',
    'select2'
], function ($, session, myFn, app, moment,
             dept_lists) {
    'use strict';

    // 보기 화면
    let Weekly_view = (function () {
        let Weekly_view = function () {
            this.init();
        };

        Weekly_view.prototype = {
            box: $('.my-content:eq(1) .box-view'),
            dept_lists: null,
            pray_data: null,
            init() {
                dept_lists.then(data => {
                    this.initPage(data);
                }).then(() => {
                    this.initEvent();
                    this.setListBox();
                });
            },
            initPage(data) {
                let li = this.box.find('table:eq(0) tr.hidden');
                data.forEach((v, i) => {
                    let clone = li.clone(true);
                    clone.find('td div:eq(0)').text(v.code_name);
                    if (i % 2) {
                        clone.addClass('odd');
                    }
                    clone.removeClass('hidden');
                    let clone2 = clone.clone(true);

                    this.box.find('table:eq(0) tbody').append(clone);
                    this.box.find('table:eq(1) tbody').append(clone2);
                });

                this.box.find('input[name="pray_date"]').datetimepicker({
                    format: 'YYYY-MM-DD',
                    daysOfWeekDisabled: [
                        0, 1, 2, 3, 5, 6
                    ],
                    keepOpen: false,
                    locale: 'ko',
                });

                this.deptLists = data;
                this.prayDate = this.box.find('input[name="pray_date"]').val();
            },
            initEvent() {
                this.box.find('input[name="pray_date"]').on('dp.change', (e) => {
                    this.prayDate = this.box.find('input[name="pray_date"]').val();
                    this.setListBox();
                });
            },
        };

        Weekly_view.prototype = Object.assign(Weekly_view.prototype, {
            setListBox() {
                this.getData({
                    pray_date: this.prayDate,
                    bbs_idx: 71,
                    language: 'kr'
                }).then(data => {
                    this.putListData({
                        table: this.box.find('.table-thanks'),
                        data
                    });
                });

                this.getData({
                    pray_date: this.prayDate,
                    bbs_idx: 72,
                    language: 'kr'
                }).then(data => {
                    this.putListData({
                        table: this.box.find('.table-vow'),
                        data
                    });
                });
            },
            putListData(options) {
                let table = options.table,
                    data = options.data;

                table.find('tbody tr div:odd').text('');
                data.forEach((v, i) => {
                    let index = this.deptLists.findIndex((ele) => {
                        return ele.code_id === v.dept_code;
                    });
                    table.find('tbody tr').not('.hidden').eq(index)
                        .find('div').eq(1).html(v.contents.replace(/\n/g, '<br>'));
                });
            },
        });

        Weekly_view.prototype = Object.assign(Weekly_view.prototype, {
            getData(data) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/pray/get_pray_list',
                        data,
                        success(data, status, xhr) {
                            resolve(data);
                        },
                        error(request, status, error) {
                            reject(request, status, error);
                        }
                    });
                });
            }
        });

        return Weekly_view;
    })();

    // 쓰기 화면
    let Weekly_write = (function () {
        let Weekly_write = function () {
            this.init();
        };

        Weekly_write.prototype = {
            box: $('.my-content:eq(1) .box-write'),
            deptCode: null,
            prayDate: null,
            init() {
                dept_lists.then(data => {
                    this.initPage(data);
                }).then(() => {
                    this.setAllPage();
                    this.initEvent();
                });
            },
            initPage(data) {
                let index = data.findIndex((element) => {
                    return element.filler === session.filler.substr(0, 2);
                }) || 0;

                let select2_data = data.reduce((result, current) => {
                    result.push({
                        id: current.code_id,
                        text: current.code_name,
                    });
                    return result;
                }, []);

                this.box.find('select[name="dept_code"]').select2({
                    data: select2_data,
                    placeholder: '부서선택',
                    width: '100%',
                    allowClear: false,
                }).val(data[index].code_id).trigger('change');

                this.box.find('input[name="pray_date"]').datetimepicker({
                    format: 'YYYY-MM-DD',
                    daysOfWeekDisabled: [
                        0, 1, 2, 3, 5, 6
                    ],
                    keepOpen: false,
                    locale: 'ko',
                });

                this.deptCode = this.box.find('select[name="dept_code"]').val();
                this.prayDate = this.box.find('input[name="pray_date"]').val();
            },
            initEvent() {
                this.box.find('input[name="pray_date"]').on('dp.change', (e) => {
                    this.prayDate = this.box.find('input[name="pray_date"]').val();
                    this.setWriteBox();
                });

                this.box.find('select[name="dept_code"]').on('select2:select', (e) => {
                    this.deptCode = this.box.find('select[name="dept_code"]').val();
                    this.setAllPage();
                });

                this.box.find('form:eq(0)').on('submit', (e) => {
                    this.postWriteBox(e);
                });
            },
        };

        Weekly_write.prototype = Object.assign(Weekly_write.prototype, {
            setAllPage() {
                Promise.all([
                    this.getData({
                        bbs_idx: 71
                    }),
                    this.getData({
                        bbs_idx: 72
                    })
                ]).then(data => {
                    let allData = data[0].concat(data[1]);
                    this.listsData = this.setListData(allData);
                }).then(() => {
                    this.setListBox();
                    this.setWriteBox();
                });
            },
            setListData(data) {
                let tmp = data.reduce((result, current, currentIndex) => {
                    result[current.pray_date] = result[current.pray_date] || [];
                    result[current.pray_date].push(current);
                    return result;
                }, {});

                let dataList = [];
                for (let key in tmp) {
                    dataList.push({
                        pray_date: key,
                        pray_thanks: {
                            kr: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_thanks' && ele.language === 'kr';
                            }) || null,
                            en: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_thanks' && ele.language === 'en';
                            }) || null,
                        },
                        pray_vow: {
                            kr: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_vow' && ele.language === 'kr';
                            }) || null,
                            en: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_vow' && ele.language === 'en';
                            }) || null,
                        },
                    });
                }
                return dataList;
            },
            getThanksWriteData() {
                let data = this.listsData.find(element => {
                    return element.pray_date === this.prayDate;
                });
                return (!!data) ? data.pray_thanks : {
                    kr: {
                        idx: null, gubun: 'pray_thanks', bbs_idx: 71, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'kr', contents: null,
                    },
                    en: {
                        idx: null, gubun: 'pray_thanks', bbs_idx: 71, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'en', contents: null,
                    }
                };
            },
            getVowWriteData() {
                let data = this.listsData.find(element => {
                    return element.pray_date === this.prayDate;
                });
                return (!!data) ? data.pray_vow : {
                    kr: {
                        idx: null, gubun: 'pray_vow', bbs_idx: 72, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'kr', contents: null,
                    },
                    en: {
                        idx: null, gubun: 'pray_vow', bbs_idx: 72, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'en', contents: null,
                    }
                };
            }
        });

        Weekly_write.prototype = Object.assign(Weekly_write.prototype, {
            setWriteBox() {
                let writeData1 = this.getThanksWriteData();
                let writeData2 = this.getVowWriteData();

                this.box.find('.table-thanks-w input[name="lang_kor"]').val(writeData1.kr.contents);
                this.box.find('.table-thanks-w input[name="lang_eng"]').val(writeData1.en.contents);

                this.box.find('.table-vow-w input[name="lang_kor"]').val(writeData2.kr.contents);
                this.box.find('.table-vow-w input[name="lang_eng"]').val(writeData2.en.contents);
            },
            postWriteBox(e) {
                let writeData1 = this.getThanksWriteData();
                let writeData2 = this.getVowWriteData();
                e.preventDefault();

                writeData1 = {
                    kr: Object.assign(writeData1.kr, {
                        contents: this.box.find('.table-thanks-w input[name="lang_kor"]').val(),
                    }),
                    en: Object.assign(writeData1.en, {
                        contents: this.box.find('.table-thanks-w input[name="lang_eng"]').val(),
                    }),
                };

                writeData2 = {
                    kr: Object.assign(writeData2.kr, {
                        contents: this.box.find('.table-vow-w input[name="lang_kor"]').val(),
                    }),
                    en: Object.assign(writeData2.en, {
                        contents: this.box.find('.table-vow-w input[name="lang_eng"]').val(),
                    }),
                };

                Promise.all([
                    this.postData(writeData1),
                    this.postData(writeData2)
                ]).then(() => {
                    alert('Compose Success!!');
                    this.setAllPage();
                });
            }
        });

        Weekly_write.prototype = Object.assign(Weekly_write.prototype, {
            setListBox() {
                this.setThanksListBox();
                this.setVowListBox();
            },
            setThanksListBox() {
                let data = this.listsData,
                    table = this.box.find('.table-thanks'),
                    tr = table.find('tbody tr.hidden');

                table.find('tbody tr').not('.hidden').remove();

                data.forEach((v, i) => {
                    let clone = tr.clone(true);
                    clone.find('td div:eq(0)').text(v.pray_date);
                    clone.find('td div:eq(1)').html(v.pray_thanks.kr.contents.replace(/\n/g, '<br>'));
                    if (i % 2) {
                        clone.addClass('odd');
                    }
                    clone.removeClass('hidden').animateCss('fadeIn');
                    table.find('tbody').append(clone);
                });
            },
            setVowListBox() {
                let data = this.listsData,
                    table = this.box.find('.table-vow'),
                    tr = table.find('tbody tr.hidden');

                table.find('tbody tr').not('.hidden').remove();

                data.forEach((v, i) => {
                    let clone = tr.clone(true);
                    clone.find('td div:eq(0)').text(v.pray_date);
                    clone.find('td div:eq(1)').html(v.pray_vow.kr.contents.replace(/\n/g, '<br>'));
                    if (i % 2) {
                        clone.addClass('odd');
                    }
                    clone.removeClass('hidden').animateCss('fadeIn');
                    table.find('tbody').append(clone);
                });
            },
        });


        Weekly_write.prototype = Object.assign(Weekly_write.prototype, {
            getData(data) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        async: true, type: 'get', dataType: 'json',
                        url: '/pray/get_pray_organ',
                        data: {
                            bbs_idx: data.bbs_idx,
                            dept_code: this.deptCode
                        },
                        success(data, status, xhr) {
                            resolve(data);
                        },
                        error(request, status, error) {
                            reject(request, status, error);
                        }
                    });
                });
            },
            postData(data) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        async: true, type: 'post', dataType: 'json',
                        url: '/pray/post_pray_data',
                        data,
                        success: function (data, status, xhr) {
                            resolve(true);
                        },
                        error(request, status, error) {
                            reject(request, status, error);
                        }
                    });
                });
            }
        });

        return Weekly_write;
    })();

    // 페이지 초기화
    (function () {
        let Tab_1 = function () {
            this.init();
            this.initEvent();
        };

        Tab_1.prototype = {
            weekly_view: null,
            weekly_write: null,
            init() {
                this.weekly_view = new Weekly_view();
                this.weekly_write = new Weekly_write();
            },
            initEvent() {
                $('.bg-purple.margin-bottom').on('click', (e) => {
                    if ($(e.target).closest('.box-view').length) {
                        $('.box-view').addClass('hidden');
                        $('.box-write').removeClass('hidden').animateCss('fadeIn');
                    } else {
                        $('.box-write').addClass('hidden');
                        $('.box-view').removeClass('hidden').animateCss('fadeIn');
                        this.weekly_view.setListBox();
                    }
                });
            }
        };

        new Tab_1();
    })();
});