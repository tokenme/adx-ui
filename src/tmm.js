(function () {
  var browser = require('adlibs/lib/detect/browser').detect();
  const environment = require('adlibs/lib/detect/environment').detect()
  function init(tmmId, w, h) {
    const uid = guid()
    wrap(uid)
    genifr(uid, tmmId, w, h)
  }
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }
  function wrap(uid) {
    document.write('<div id="' + uid + '"></div>')
  }
  function genifr(uid, tmmId, w, h) {
    let ifr = document.createElement('iframe')
    ifr.width = w
    ifr.height = h
    ifr.scrolling = 'no'
    ifr.frameBorder = 0
    ifr.marginHeight = 0
    ifr.marginWidth = 0
    const wrapper = document.getElementById(uid)
    wrapper.appendChild(ifr)
    const os = browser.os
    let browserType = 0
    if (browser.tablet) {
      browserType = 3
    } else if (browser.mobile) {
      browserType = 2
    } else if (browser.desktop) {
      browserType = 1
    } else if (browser.console) {
      browserType = 4
    }
    const link = 'https://adx.tokenmama.io/c?a=' + encodeURIComponent(tmmId) + 
      '&url=' + encodeURIComponent(window.location) +
      '&referrer=' + encodeURIComponent(document.referrer) + 
      '&sw=' + environment.screen_h + 
      '&sh=' + environment.screen_w + 
      '&adw=' + environment.ad_w + 
      '&adh=' + environment.ad_h + 
      '&os_name=' + os.name + 
      '&os_ver=' + os.version +
      '&bw_name=' + browser.name +
      '&bw_ver=' + browser.version +
      '&bw_type=' + browserType;
    const htm = '<body><style>*{margin:0;padding:0}.imp{width:1px;height:1px;display:absolute;top:-1px;;left:-1px;}.img{width:100%;height:100%}.logo{position:absolute;bottom:0;right:-4px;z-index:10000;}a img{width:20px;height16px;}a:hover.logo{right:0}</style><a href="https://adx.tokenmama.io" target="_blank" class="logo"><img src="https://adxcdn.tokenmama.io/img/logo/ad.png?v=20180428"></a><script src="https://adxcdn.tokenmama.io/js/tmm-c.js" type="text/javascript"></script><script src="' + link + '" type="text/javascript"></script></body>';
    const ifrdom = ifr.contentWindow.document;
    ifrdom.open();
    ifrdom.write(htm);
    ifrdom.close();
  }
  document.ready = init(window.tmm_id, window.tmm_width, window.tmm_height);
})(window)