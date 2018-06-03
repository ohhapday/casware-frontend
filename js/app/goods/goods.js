/* eslint-disable no-undef,no-unused-vars,indent,no-console */
/**
 * Created by 서정석 on 2017/06/12.
 * 전사 재고현황
 */

requirejs([
    'jquery', 'session', 'myFn', 'app', 'moment', 'noUiSlider', 'wNumb', 'jquery-slimscroll',
], function ($, session, myFn, app, moment, noUiSlider, wNumb) {
    'use strict';

    let nf = new Intl.NumberFormat(['en-US']);
    let goods_list;                                  // 상품 목록

    let Goods = (function () {
        let Goods = function (search_string) {
            this.table = $('ul.products-list');
            this.slider = document.getElementById('slider');

            this.search_string = search_string;
            this.lprice_array = null;
            this.goods_list = [];

            this.data = null;
            this.init();
        };

        Goods.prototype = {
            init: function () {
                this.goods_list = $.extend([], goods_list.get_data());
                this.data = $.extend({}, this.set_data());

                try {
                    $('#inven_list .box-title span:eq(1)')
                        .text('총 ' + nf.format(this.data.total) + '개')
                        .css('padding', '0px 0.25em');
                } catch (e) {
                    console.log(e);
                }

                this.initEvent();
                this.tr_add();
                this.create_slider();
            },
            initEvent: function () {

            },
            tr_add: function () {
                let self = this;
                let data = this.data;
                let clone = this.table.find('li:eq(0)');

                $.each(data.items, function () {
                    let tr_last = self.table.find('li:last');
                    let tr = clone.clone(true);

                    self.tr_data(tr, this);

                    tr_last.after(tr);
                    tr.css('display', '');
                });
            },
            tr_data: function (obj_tr, data) {
                obj_tr.find('.product-title').html(data.title);
                obj_tr.find('.product-description').text(data.mallName);
                obj_tr.find('.product-info .pull-right').text('￦ ' + nf.format(data.lprice));
                obj_tr.find('.product-info a').attr('href', data.link);
                obj_tr.find('.product-img img').attr('src', data.image);
            },
            create_slider: function () {
                let slider = this.slider;
                let search_string = this.search_string;
                let tmp = this.data.items.map(function (item) {
                    return parseInt(item.lprice);
                });

                let min = Math.min(...tmp);
                let max = Math.max(...tmp);

                // 적정가격 추출
                let lprice = this.get_lprice();

                this.lprice_array = $.extend([], tmp);

                if (typeof slider.noUiSlider !== 'object') {
                    noUiSlider.create(slider, {
                        start: [lprice, max],
                        connect: true,
                        tooltips: [wNumb({
                            decimals: 0,
                            prefix: '￦ ',
                            thousand: ',',
                        }), wNumb({
                            decimals: 0,
                            prefix: '￦ ',
                            thousand: ',',
                        })],
                        step: 1000,
                        range: {
                            'min': min,
                            'max': max
                        }
                    });
                } else {
                    slider.noUiSlider.updateOptions({
                        start: [lprice, max],
                        range: {
                            'min': min,
                            'max': max
                        }
                    });
                }

                this.sliderEvent();
            },
            sliderEvent: function () {
                let slider = this.slider;
                let lprice = this.lprice_array;
                let tr = this.table.find('li:not(:eq(0))');

                slider.noUiSlider.on('update', function () {
                    let price = slider.noUiSlider.get();
                    let min = parseInt(price[0]);
                    let max = parseInt(price[1]);

                    $.each(lprice, function (index) {
                        if (this < min || this > max) {
                            tr.eq(index).css('display', 'none');
                        } else {
                            tr.eq(index).css('display', '');
                        }
                    });
                });
            },
            get_lprice: function () {
                let search_string = this.search_string;
                let lprice;

                let lprice_item = this.goods_list.find(function (item) {
                    return search_string === item.search_string;
                });
                lprice = (lprice_item) ? lprice = lprice_item.low_price * 0.9 : 0;

                return lprice;
            },
            destory: function () {
                this.lprice_array = null;
                this.table.find('li').not(':eq(0)').remove();
            },
        };

        Goods.prototype.set_data = function () {
            let returnData = null;

            $.ajax({
                async: false,
                url: '/goods/get_data',
                type: 'get',
                dataType: 'json',
                data: {
                    goods: this.search_string,
                    lprice: this.get_lprice(),
                },
                success: function (data, status, xhr) {
                    returnData = data;
                    console.log(data);
                }
            });

            return returnData;
        };

        return Goods;
    })();

    let Goods_list = (function () {
        let Goods_list = function () {
            this.datalist = $('#search_area #product');

            this.data = [];

            this.init();
            this.initEvent();
        };

        Goods_list.prototype = {
            init: function () {
                this.data = $.extend([], this.set_data());
                this.add_list();
            },
            initEvent: function () {
                let Goods_table = null;

                // 검색
                $('#search_area .fa-search').parent().on('click', function () {
                    let string = $('#search_area input[name="spot"]').val();

                    if (!string) {
                        alert('검색어를 입력 또는 선택해 주세요.');
                        return;
                    }

                    if (Goods_table !== null) {
                        Goods_table.destory();
                    }
                    // 검색결과 출력
                    Goods_table = new Goods(string);

                    $('#inven_list .box-title span:eq(0)').text(string).css('padding', '0px 0.25em');
                });
            },
            add_list: function () {
                let datalist = this.datalist;
                let data = this.data;

                $.each(data, function () {
                    datalist.append('<option value="' + this.search_string + '">' +
                        '적정가: ￦' + nf.format(this.low_price) + '' +
                        '</option>');
                });
            },
            get_data: function () {
                return this.data;
            }
        };

        Goods_list.prototype.set_data = function () {
            let returnData = null;
            $.ajax({
                async: false,
                url: '/goods/get_goods_list',
                type: 'get',
                dataType: 'json',
                success: function (data, status, xhr) {
                    returnData = data;
                }
            });
            return returnData;
        };

        return Goods_list;
    })();

    // 페이지 처리
    (function () {
        // 포커스
        $('input[name="spot"]').on('focus', function () {
            $(this).val('');
        });

        // 프로그램 초기화
        (function () {
            $('.products-list').parent().slimScroll({
                height: '713',
            });

            goods_list = new Goods_list;
        })();
    })();

});


