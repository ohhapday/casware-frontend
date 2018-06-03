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
    let Organ_view = (function () {
        let Organ_view = function () {
            this.init();
        };

        Organ_view.prototype = {
            box: $('.my-content:eq(2) .box-view'),
            deptLists: null,
            prayDate: null,
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
                    format: 'YYYY-MM',
                    daysOfWeekDisabled: [
                        0, 1, 2, 3, 5, 6
                    ],
                    keepOpen: true,
                    locale: 'ko',
                });

                this.deptLists = data;
                this.prayDate = this.box.find('input[name="pray_date"]').val();
            },
            initEvent() {
                this.box.find('input[name="pray_date"]').on('dp.show', (e) => {
                    $('.datepicker-months .month:not(:eq(2)):not(:eq(4)):not(:eq(6)):not(:eq(8))')
                        .addClass('disabled').css('background-color', '#CCCCCC');
                });

                this.box.find('input[name="pray_date"]').on('dp.change', (e) => {
                    this.prayDate = this.box.find('input[name="pray_date"]').val();
                    this.setListBox();
                });
            },
        };

        Organ_view.prototype = Object.assign(Organ_view.prototype, {
            setListBox() {
                this.getData({
                    pray_date: this.prayDate,
                    bbs_idx: 73,
                    language: 'kr'
                }).then(data => {
                    this.putListData(data);
                });
            },
            putListData(data) {
                let table = this.box.find('table');

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

        Organ_view.prototype = Object.assign(Organ_view.prototype, {
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

        return Organ_view;
    })();

    // 쓰기 화면
    let Organ_write = (function () {
        let Organ_write = function () {
            this.init();
        };

        // 페이지 초기화
        Organ_write.prototype = {
            box: $('.my-content:eq(2) .box-write'),
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
                    allowClear: true,
                }).val(data[index].code_id).trigger('change');

                this.box.find('input[name="pray_date"]').datetimepicker({
                    format: 'YYYY-MM',
                    daysOfWeekDisabled: [
                        0, 1, 2, 3, 5, 6
                    ],
                    keepOpen: true,
                    locale: 'ko',
                });

                this.deptCode = this.box.find('select[name="dept_code"]').val();
                this.prayDate = this.box.find('input[name="pray_date"]').val();
            },
            initEvent() {
                this.box.find('input[name="pray_date"]').on('dp.show', (e) => {
                    $('.datepicker-months .month:not(:eq(2)):not(:eq(4)):not(:eq(6)):not(:eq(8))')
                        .addClass('disabled').css('background-color', '#CCCCCC');
                });

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

        // Data 처리
        Organ_write.prototype = Object.assign(Organ_write.prototype, {
            setAllPage() {
                this.getData({
                    bbs_idx: 73
                }).then(data => {
                    this.listsData = this.setListData(data);
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
                        pray_organ: {
                            kr: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_organ' && ele.language === 'kr';
                            }) || null,
                            en: tmp[key].find(ele => {
                                return ele.bbs_id === 'pray_organ' && ele.language === 'en';
                            }) || null,
                        },
                    });
                }
                return dataList;
            },
            getWriteData() {
                let data = this.listsData.find(element => {
                    return element.pray_date === this.prayDate;
                });
                return (!!data) ? data.pray_organ : {
                    kr: {
                        idx: null, gubun: 'pray_organ', bbs_idx: 73, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'kr', contents: null,
                    },
                    en: {
                        idx: null, gubun: 'pray_organ', bbs_idx: 73, article_idx: null,
                        dept_code: this.box.find('select[name="dept_code"]').val(),
                        pray_date: this.box.find('input[name="pray_date"]').val(),
                        language: 'en', contents: null,
                    }
                };
            }
        });

        // 쓰기 Box
        Organ_write.prototype = Object.assign(Organ_write.prototype, {
            setWriteBox() {
                let writeData = this.getWriteData();
                this.box.find('textarea[name="lang_kor"]').val(writeData.kr.contents);
                this.box.find('textarea[name="lang_eng"]').val(writeData.en.contents);
            },
            postWriteBox(e) {
                let writeData = this.getWriteData();
                e.preventDefault();

                writeData = {
                    kr: Object.assign(writeData.kr, {
                        contents: this.box.find('textarea[name="lang_kor"]').val(),
                    }),
                    en: Object.assign(writeData.en, {
                        contents: this.box.find('textarea[name="lang_eng"]').val(),
                    }),
                };

                this.postData(writeData).then(() => {
                    alert('Compose Success!!');
                    this.setAllPage();
                });
            }
        });

        // 리스트 Box
        Organ_write.prototype = Object.assign(Organ_write.prototype, {
            setListBox() {
                let data = this.listsData,
                    table = this.box.find('.table-lists'),
                    tr = table.find('tbody tr.hidden');

                table.find('tbody tr').not('.hidden').remove();

                data.forEach((v, i) => {
                    let clone = tr.clone(true);
                    clone.find('td div:eq(0)').text(v.pray_date);
                    clone.find('td div:eq(1)').html(v.pray_organ.kr.contents.replace(/\n/g, '<br>'));
                    if (i % 2) {
                        clone.addClass('odd');
                    }
                    clone.removeClass('hidden').animateCss('fadeIn');
                    table.find('tbody').append(clone);
                });
            },
        });

        // Ajax
        Organ_write.prototype = Object.assign(Organ_write.prototype, {
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

        return Organ_write;
    })();

    // 페이지 초기화
    (function () {
        let Tab_2 = function () {
            this.init();
            this.initEvent();
        };

        Tab_2.prototype = {
            viewTable: null,
            writeTable: null,
            init() {
                this.viewTable = new Organ_view();
                this.writeTable = new Organ_write();
            },
            initEvent() {
                $('.bg-purple.margin-bottom').on('click', (e) => {
                    if ($(e.target).closest('.box-view').length) {
                        $('.box-view').addClass('hidden');
                        $('.box-write').removeClass('hidden').animateCss('fadeIn');
                    } else {
                        $('.box-write').addClass('hidden');
                        $('.box-view').removeClass('hidden').animateCss('fadeIn');
                        this.viewTable.setListBox();
                    }
                });
            }
        };

        new Tab_2();
    })();
});