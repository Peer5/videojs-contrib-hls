(function(videojs){
  /**
   * Creates and sends an Peer5 Requests (Hybrid Http/P2P).
   *
   *  @param options {string | object} if this argument is a string, it
   * is intrepreted as a URL and a simple GET request is
   * inititated. If it is an object, it should contain a `url`
   * property that indicates the URL to request and optionally a
   * `method` which is the type of HTTP request to send.
   * @param callback (optional) {function} a function to call when the
   * request completes. If the request was not successful, the first
   * argument will be falsey.
   * @return {object} the XMLHttpRequest that was initiated.
   */
   videojs.Hls.xhr = function(url, callback) {
       var
      options = {
        method: 'GET',
        timeout: 45 * 1000
      },
      request,
      abortTimeout;

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    if (typeof url === 'object') {
      options = videojs.util.mergeOptions(options, url);
      url = options.url;
    }

   var request = {readyState:0};
    request.url = url;
    request.requestTime = new Date().getTime();

    if (options.timeout) {
      abortTimeout = window.setTimeout(function() {
        if (request.readyState !== 4) {
          request.timedout = true;
        }
      }, options.timeout);
    }

    function onerror() {
        // request aborted or errored
        request.readyState = 4;
        return callback.call(request, true, url);
    }
    function onload(data) {
        request.readyState=4;
      // clear outstanding timeouts
      window.clearTimeout(abortTimeout);

        request.response=data;
      // request timeout
      if (request.timedout) {
        return callback.call(this, 'timeout', url);
      }

      if (request.response) {
        request.responseText = request.response;
        request.responseTime = new Date().getTime();
        request.roundTripTime = request.responseTime - request.requestTime;
        request.bytesReceived = request.response.byteLength || request.response.length;
        request.bandwidth = Math.floor((request.bytesReceived / request.roundTripTime) * 8 * 1000);
      }

        if(!request.responseType){
            request.responseText = request.response;
        }

      return callback.call(request, false, url);
    };
    if(!options.responseType)
        peer5.getMedia(url,onload,{text:true,onerror:onerror});
    else
        peer5.getMedia(url,onload,{arraybuffer:true,onerror:onerror});
   return request;
   };


})(window.videojs);
