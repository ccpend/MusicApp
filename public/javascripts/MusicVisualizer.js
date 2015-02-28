void function(imports, exports) {
  var MusicVisualizer, getInstance, bind, ac;
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
    this.visualizer = options.visualizer;
    this.visualize();
	};

  MusicVisualizer.prototype.load = function(url, callback) {
    var that;
    that = this;
    this.xhr.abort();
    this.xhr.open('GET', url);
    this.xhr.responseType = 'arraybuffer';
    this.xhr.onload = function() {
      callback(that.xhr.response);
    };
    this.xhr.send();
  };

  MusicVisualizer.prototype.decode = function(arraybuffer, callback) {
    ac.decodeAudioData(arraybuffer, function(buffer) {
      callback(buffer);
    }, function(err) {
      console.log(err);
    });
  };

  MusicVisualizer.prototype.visualize = function() {
    var arr, requestAnimationFrame, that;
    that = this;
    arr = new Uint8Array(this.analyser.frequencyBinCount);
    requestAnimationFrame = imports.requestAnimationFrame ||
                            imports.webkitRequestAnimationFrame ||
                            imports.mozRequestAnimationFrame;
    requestAnimationFrame(function v () {
      that.analyser.getByteFrequencyData(arr);
      that.visualizer(arr);
      requestAnimationFrame(v);
    });
  };

  MusicVisualizer.prototype.play = function(url) {
    var bs, that, n;
    n = ++this.count;
    that = this;
    this.stop();
    this.load(url, function(arraybuffer) {
      if (n !== that.count) return;
      that.decode(arraybuffer, function(buffer) {
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