void function(imports, exports) {
  var list, lis, triggerChange, random
  , volumeInput, mv, size;

  triggerChange = function(ele) {
    var event;
    event = document.createEvent("HTMLEvents");
    event.initEvent('change', true, true);
    ele.dispatchEvent(event);
  };

  random = function(m, n) {
    return Math.round(Math.random() * (n - m) + m);
  };

  list = document.getElementById('list');
  lis = list.querySelectorAll('li');
  list.addEventListener('click', function(e) {
    var i, len, curElement; 
    for (i = 0, len < lis.length; i < len; i ++) {
      lis[i].classList.remove('selected');
    }
    curLi = e.target;
    curLi.classList.add('selected');
    mv.play('/media/' + curLi.title);
  } ,false);
  
  size = 128;

  volumeInput = document.getElementById('volume');
  volumeInput.addEventListener('change', function() {
    mv.changeVolume(this.value / this.max);
  }, false);

  // canvas
  var canvasDraw = function() {
    var box, canvas, resizeHandle, canvasDraw
    , ctx, height, width, type
    , dots, getDots, radioChange;

    box = document.getElementById('box');
    canvas = document.createElement('canvas');
    box.appendChild(canvas);
    ctx = canvas.getContext('2d');
    dots = [];

    // 自执行
    radioChange = function() {
      var form, radios, radio, j;
      form = document.getElementsByTagName('form')[0];
      radios = document.querySelectorAll('input[name="ctype"]');
      form.addEventListener('change', function(e) {
        var thisEle;
        thisEle = e.target;
        if (thisEle.name === 'ctype') {
          if (thisEle.checked === true) {
            type = thisEle.value
          }
        }
      }, false);

      j = 0;
      for ( ; radio = radios[j]; j++) {
        triggerChange(radio);
      }
    }();

    getDots = function() {
      var i, x, y, color;
      dots = [];
      i = 0;
      for ( ; i < size; i++) {
        x = random(0, width);
        y = random(0, height);
        color = 'rgb('+ random(0, 255) +',' + random(0, 255) +',' + random(0, 255) +')';
        dots.push({
          x: x,
          y: y,
          color: color
        });
      }
    };

    // 自执行并返回函数保存到resizeHandle
    resizeHandle = function resizeHandle(){
      width = box.clientWidth;
      height = box.clientHeight
      canvas.width = width;
      canvas.height = height;
      getDots();
      imports.addEventListener('resize', resizeHandle, false);
    }();    
    
    return function(arr) {
      var i, w, h, r, o, g, line;
      ctx.clearRect(0, 0, width, height);
      i = 0;
      for ( ; i < size; i++) {
        if (type === 'column') {
          w = width / size;
          h = arr[i] / 256 * height;
          line = ctx.createLinearGradient(0, 0, 0, height);
          line.addColorStop(0, 'red');
          line.addColorStop(0.5, 'yellow');
          line.addColorStop(1, 'green');
          ctx.fillStyle = line;
          ctx.fillRect(w * i, height - h, w * 0.6, h);
        } else if (type === 'dot') {
          ctx.beginPath();
          o = dots[i];
          r = arr[i] / 256 * 100;
          ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
          g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
          g.addColorStop(0, '#FFFFFF');
          g.addColorStop(1, o.color);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }
    };
  }();

  mv = MusicVisualizer({
    'size': size,
    'visualizer': canvasDraw
  });
  triggerChange(volumeInput);

}(window, window);