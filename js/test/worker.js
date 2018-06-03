/**
 * Created by 서정석 on 2016/12/26.
 */

(function () {
    var messages = {
        doLargeLoop: function () {
            var i, sum = 0,
                start, end;
            console.log("Worker thread: Starting large loop");
            start = Date.now();
            for (i = 0; i < 5000000000; i++) {
                sum += i;
            }
            end = Date.now();
            postMessage(`Elapsed time
                        (${((end - start) / 1000).toFixed(2)} sec, sum=${sum})`);
        }
    };

    onmessage = function (msg) {
        if (messages.hasOwnProperty(msg.data)) {
            messages[msg.data]();
        }
    }
})();