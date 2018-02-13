// https://gist.github.com/kindziora/b4a877a790cac97bd584dae182752c03
var http = function(method, url) {
    var _xhr = new XMLHttpRequest();
    
    _xhr.open(method, url);
    
    _xhr.setup = function(cb) { // hacky? maybe
        cb(_xhr);
        return _xhr;
    };
    
    _xhr.done = function(cb) { // hacky? maybe
        _xhr.onreadystatechange = function() {
            if (_xhr.readyState !== XMLHttpRequest.DONE) {
              return;
            }

            cb(_xhr.responseText, _xhr.status);
        };
        
        return _xhr;
    };
    
    return _xhr;
};
