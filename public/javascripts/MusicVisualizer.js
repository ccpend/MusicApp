void function(imports, exports) {
  var MusicVisualizer, getInstance, bind, ac
  , _load, _decode, _visualize;
  // ac
  ac = new (imports.AudioContext || imports.webkitAudioContext)();

  bind = function(fun, context) {
    return function() {
      fun.apply(context, arguments)
      return fun;
    };
  };

  getInstance = function(options) {
    var instance;
    instance = new MusicVisualizer(options);
    return {
      'play': bind(instance.play, instance),
      'stop': bind(instance.stop, instance),
      'changeVolume': bind(instance.changeVolume, instance)
    };
  };

  // MusicVisualizer类
  MusicVisualizer = function(options) {
    this.source = null;
    this.count = 0;
    this.analyser = ac.createAnalyser();
    this.analyser.fftSize = options.size * 2;
    this.gainNode = (ac.createGain ? ac.createGain() : ac.crateGainNode());
    this.gainNode.connect(ac.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    _visualize(this.analyser, options.visualizer);
	};

  _load = function(xhr, url, callback) {
    xhr.abort();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      callback(xhr.response);
    };
    xhr.send();
  };

  _decode = function(arraybuffer, callback) {
    ac.decodeAudioData(arraybuffer, function(buffer) {
      callback(buffer);
    }, function(err) {
      console.log(err);
    });
  };

  _visualize = function(analyser, visualizer) {
    var arr, requestAnimationFrame;
    arr = new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame = imports.requestAnimationFrame ||
                            imports.webkitRequestAnimationFrame ||
                            imports.mozRequestAnimationFrame;
    requestAnimationFrame(function v () {
      analyser.getByteFrequencyData(arr);
      visualizer(arr);
      requestAnimationFrame(v);
    });
  };

  MusicVisualizer.prototype.play = function(url) {
    var bs, that, n;
    n = ++this.count;
    that = this;
    this.stop();
    _load(this.xhr, url, function(arraybuffer) {
      if (n !== that.count) return;
      _decode(arraybuffer, function(buffer) {
        if (n !== that.count) return;
        bs = ac.createBufferSource();
        bs.connect(that.analyser);
        bs.buffer = buffer;
        !!bs.start ? bs.start() : bs.noteOn() ;
        that.source = bs;
      });
    });
  };

  MusicVisualizer.prototype.stop = function() {
    !!this.source && (this.source.stop ? this.source.stop() : this.source.noteOff());
  };

  MusicVisualizer.prototype.changeVolume = function(percent) {
    this.gainNode.gain.value = percent * percent;
  };

  exports.MusicVisualizer = getInstance;

}(window, window);