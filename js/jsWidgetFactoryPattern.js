/**
 * Created by 서정석 on 2016/10/27.
 */

/**
 * --------------------------------------------
 * 연결된 스크립트나 다른 플러그인에서 스코프가
 * 제대로 닫혀져 있지 않을 경우를 대비하여 세미콜론을
 * 함수 호출 전에 작성하면 보다 안전해집니다.
 * --------------------------------------------
 */
/*!
 * jQuery UI Widget-factory plugin boilerplate (for 1.8/9+)
 * Author: @addyosmani
 * Further changes: @peolanha
 * Licensed under the MIT license
 */


;(function ( $, window, document, undefined ) {

	// 사용자가 원하는 네임스페이스에 사용자 위젯을 정의
	// 추가로 작성할 수 있는 파라미터(Parmeters)
	// 예) $.widget( "namespace.widgetname", (optional) - an
	// existing widget prototype to inherit from, an object
	// literal to become the widget's prototype );
	// 즉, 기존의 위젯 프로토타입을 상속받으며,
	// 사용자가 정의하는 객체 리터럴은 위젯의 프로토타입이 된다.

	$.widget( "namespace.widgetname" , {

		// 기본값으로 사용할 옵션값을 정의
		options: {
			someValue: null
		},

		// 위젯 설정정
		// 요소 초기화 및 요소 생성 & 이벤트 바인딩 등등...
		_create: function () {

			// 해당 위젯이 호출되기 위해 _create는 자동으로 한번 실행된다.
			// 이곳에 초기 위젯 설정 코드를 작성한다.
			// this.element를 통해 호출의 대상이 되는 요소에 접근할 수 있다.
			// 위에 정의된 options도 this.options을 통해 접근 가능
		},

		// Destroy an instantiated plugin and clean up
		// modifications the widget has made to the DOM
		// 인스턴스화 플러그인을 제거하고 변경된 위젯을 청소하여 DOM을 구성
		destroy: function () {

			// this.element.removeStuff();
			// For UI 1.8, destroy must be invoked from the
			// base widget
			$.Widget.prototype.destroy.call(this);
			// For UI 1.9, define _destroy instead and don't
			// worry about
			// calling the base widget
		},

		methodB: function ( event ) {
			//_trigger dispatches callbacks the plugin user
			// can subscribe to
			// signature: _trigger( "callbackName" , [eventObject],
			// [uiObject] )
			// eg. this._trigger( "hover", e /*where e.type ==
			// "mouseenter"*/, { hovered: $(e.target)});
			this._trigger('methodA', event, {
				key: value
			});
		},

		methodA: function ( event ) {
			this._trigger('dataChanged', event, {
				key: value
			});
		},

		// Respond to any changes the user makes to the
		// option method
		_setOption: function ( key, value ) {
			switch (key) {
				case "someValue":
					//this.options.someValue = doSomethingWith( value );
					break;
				default:
					//this.options[ key ] = value;
					break;
			}

			// For UI 1.8, _setOption must be manually invoked
			// from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// For UI 1.9 the _super method can be used instead
			// this._super( "_setOption", key, value );
		}
	});

})( jQuery, window, document );