(function () {
  function render(data) {
    var a = document.createElement('a');
    a.href= data.link;
    a.target = '_blank';
    var img = document.createElement('img');
    img.className = 'img';
    img.src = data.img;
    a.appendChild(img);
    document.body.appendChild(a);
    var imp = document.createElement('img');
    imp.width = 1;
    imp.height = 1;
    imp.src = data.imp;
    imp.className = 'imp';
    document.body.appendChild(imp);
  }
  window.TMM = render;
})(window)