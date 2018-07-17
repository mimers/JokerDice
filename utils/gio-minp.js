"use strict";
class Uploader {
  constructor(t, e) {
    this.host = "https://wxapi.growingio.com", this.messageQueue = [], this.uploadingQueue = [], this.uploadTimer = null, this.projectId = t, this.appId = e, this.url = `${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`
  }
  setHost(t) {
    0 != t.indexOf("http") && (this.host = "https://" + t), this.url = `${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`
  }
  upload(t) {
    this.messageQueue.push(t), this.uploadTimer || (this.uploadTimer = setTimeout(() => {
      this._flush(), this.uploadTimer = null
    }, 1e3))
  }
  forceFlush() {
    this.uploadTimer && (clearTimeout(this.uploadTimer), this.uploadTimer = null), this._flush()
  }
  _flush() {
    this.uploadingQueue = this.messageQueue.slice(), this.messageQueue = [], this.uploadingQueue.length > 0 && wx.request({
      url: `${this.url}?stm=${Date.now()}`,
      header: {
        "content-type": "application/json"
      },
      method: "POST",
      data: this.uploadingQueue,
      success: () => {
        this.messageQueue.length > 0 && this._flush()
      },
      fail: () => {
        this.messageQueue = this.uploadingQueue.concat(this.messageQueue)
      }
    })
  }
}
var Utils = {
  sdkVer: "0.8",
  devVer: 1,
  guid: function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
      var e = 16 * Math.random() | 0;
      return ("x" == t ? e : 3 & e | 8).toString(16)
    })
  },
  getScreenHeight: function(t) {
    return Math.round(t.screenHeight * t.pixelRatio)
  },
  getScreenWidth: function(t) {
    return Math.round(t.screenWidth * t.pixelRatio)
  },
  getOS: function(t) {
    if (t) {
      var e = t.toLowerCase();
      return -1 != e.indexOf("android") ? "Weixin-Android" : -1 != e.indexOf("ios") ? "Weixin-iOS" : t
    }
  },
  getOSV: t => `Weixin ${t}`,
  isEmpty: t => {
    for (var e in t)
      if (t.hasOwnProperty(e)) return !1;
    return !0
  }
};
class Page$1 {
  constructor() {
    this.queries = {}
  }
  touch(t) {
    this.path = t.route, this.time = Date.now(), this.query = this.queries[t.route] ? this.queries[t.route] : void 0
  }
  addQuery(t, e) {
    this.queries[t.route] = e ? this._getQuery(e) : null
  }
  _getQuery(t) {
    return Object.keys(t).map(e => `${e}=${t[e]}`).join("&")
  }
}
const eventTypeMap = {
  tap: ["tap", "click"],
  longtap: ["longtap"],
  input: ["input"],
  blur: ["change", "blur"],
  submit: ["submit"],
  focus: ["focus"]
};

function getComKey(t) {
  return t && t.$attrs ? t.$attrs.mpcomid : "0"
}

function getVM(t, e) {
  void 0 === e && (e = []);
  var i = e.slice(1);
  return i.length ? i.reduce(function(t, e) {
    for (var i = t.$children.length, s = 0; i > s; s++) {
      var n = t.$children[s];
      if (getComKey(n) === e) return t = n
    }
    return t
  }, t) : t
}

function getHandle(t, e, i) {
  void 0 === i && (i = []);
  var s = [];
  if (!t || !t.tag) return s;
  var n = t || {},
    r = n.data;
  void 0 === r && (r = {});
  var a = n.children;
  void 0 === a && (a = []);
  var o = n.componentInstance;
  o ? Object.keys(o.$slots).forEach(function(t) {
    var n = o.$slots[t];
    (Array.isArray(n) ? n : [n]).forEach(function(t) {
      s = s.concat(getHandle(t, e, i))
    })
  }) : a.forEach(function(t) {
    s = s.concat(getHandle(t, e, i))
  });
  var h = r.attrs,
    u = r.on;
  return h && u && h.eventid === e && i.forEach(function(t) {
    var e = u[t];
    "function" == typeof e ? s.push(e) : Array.isArray(e) && (s = s.concat(e))
  }), s
}
class VueProxy {
  constructor(t) {
    this.vueVM = t
  }
  getHandle(t) {
    var e = t.type,
      i = t.target;
    void 0 === i && (i = {});
    var s = (t.currentTarget || i).dataset;
    void 0 === s && (s = {});
    var n = s.comkey;
    void 0 === n && (n = "");
    var r = s.eventid,
      a = getVM(this.vueVM, n.split(","));
    if (a) {
      var o = getHandle(a._vnode, r, eventTypeMap[e] || [e]);
      return o.length ? o[0].name : void 0
    }
  }
}
class Observer {
  constructor(t) {
    this.growingio = t, this.weixin = t.weixin, this.currentPage = new Page$1, this.scene = null, this.sessionId = null, this.cs1 = null, this.lastPageEvent = void 0, this.isOnShareAppMessage = !1, this.CLICK_TYPE = {
      tap: "clck",
      longpress: "lngprss",
      longtap: "lngprss"
    }
  }
  setUserId(t) {
    var e = t + "";
    e && 100 > e.length && (this.cs1 = e, this.lastPageEvent && this._sendEvent(this.lastPageEvent))
  }
  clearUserId() {
    this.cs1 = null
  }
  appListener(t, e, i) {
    this.isOnShareAppMessage || (this.growingio.debug && console.log("App.", e, Date.now()), "onShow" == e ? (this.sessionId = Utils.guid(), this.lastPageEvent = void 0, this.sendVisitEvent(i)) : "onHide" == e ? (this.growingio.forceFlush(), this.weixin.syncStorage(), this.isOnShareAppMessage || this.sendVisitCloseEvent()) : "onError" == e && this.sendErrorEvent(i))
  }
  pageListener(t, e, i) {
    if (this.growingio.debug && console.log("Page.", t.route, "#", e, Date.now()), "onShow" === e) this.isOnShareAppMessage ? this.isOnShareAppMessage = !1 : (this.currentPage.touch(t), this.sendPage(t));
    else if ("onLoad" === e) {
      Utils.isEmpty(s = i[0]) || this.currentPage.addQuery(t, s)
    } else if ("onShareAppMessage" === e) {
      var s = null,
        n = null;
      2 > i.length ? 1 === i.length && (i[0].from ? s = i[0] : i[0].title && (n = i[0])) : (s = i[0], n = i[1]), this.isOnShareAppMessage = !0, this.sendPageShare(t, s, n)
    } else if ("onTabItemTap" === e) {
      this.sendTabClick(i[0])
    }
  }
  actionListener(t, e) {
    if ("handleProxy" === e && this.growingio.vueRootVMs && this.growingio.vueRootVMs[this.currentPage.path]) {
      let i = new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]).getHandle(t);
      i && (e = i)
    }
    this.growingio.debug && console.log("Click on ", e, Date.now()), "tap" === t.type || "longpress" === t.type ? this.sendClick(t, e) : -1 !== ["change", "confirm", "blur"].indexOf(t.type) ? this.sendChange(t, e) : "getuserinfo" === t.type && (this.sendClick(t, e), t.detail && t.detail.userInfo && this.setVisitor(t.detail.userInfo))
  }
  track(t, e) {
    if (null !== t && void 0 !== t && 0 !== t.length) {
      var i = {
        t: "cstm",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query,
        n: t
      };
      null !== e && "object" == typeof e && (i.var = e), this._sendEvent(i)
    }
  }
  identify(t, e) {
    void 0 !== t && 0 !== t.length && (this.growingio.login(t), this._sendEvent({
      t: "vstr",
      var: {
        openid: t,
        unionid: e
      }
    }))
  }
  setVisitor(t) {
    this._sendEvent({
      t: "vstr",
      var: t
    })
  }
  setUser(t) {
    this._sendEvent({
      t: "ppl",
      var: t
    })
  }
  setPage(t) {
    this._sendEvent({
      t: "pvar",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      var: t
    })
  }
  setEvar(t) {
    this._sendEvent({
      t: "evar",
      var: t
    })
  }
  sendVisitEvent(t) {
    var e = this.weixin.systemInfo,
      i = {
        t: "vst",
        tm: Date.now(),
        av: Utils.sdkVer,
        db: e.brand,
        dm: e.model.replace(/<.*>/, ""),
        sh: Utils.getScreenHeight(e),
        sw: Utils.getScreenWidth(e),
        os: Utils.getOS(e.platform),
        osv: Utils.getOSV(e.version),
        l: e.language
      };
    if (this.growingio.appVer && (i.cv = this.growingio.appVer + ""), t.length > 0) {
      var s = t[0];
      i.p = s.path, Utils.isEmpty(s.query) || (i.q = this.currentPage._getQuery(s.query)), i.ch = `scn:${s.scene}`, s.referrerInfo && s.referrerInfo.appId && (i.rf = s.referrerInfo.appId), this.scene = s.scene
    }
    this.weixin.requestLocation().then(() => {
      null != this.weixin.location && (i.lat = this.weixin.location.latitude, i.lng = this.weixin.location.longitude), this._sendEvent(i)
    })
  }
  sendVisitCloseEvent() {
    this._sendEvent({
      t: "cls",
      p: this.currentPage.path,
      q: this.currentPage.query
    })
  }
  sendErrorEvent(t) {
    if (t.length > 0) {
      let e = t[0].split("\n");
      if (e.length > 1) {
        let t = e[1].split(";");
        if (t.length > 1) {
          let i = t[1].match(/at ([^ ]+) page (.*) function/),
            s = {
              key: e[0],
              error: t[0]
            };
          i.length > 2 && (s.page = i[1], s.function = i[2]), this._sendEvent({
            t: "cstm",
            ptm: this.currentPage.time,
            p: this.currentPage.path,
            q: this.currentPage.query,
            n: "onError",
            var: s
          })
        }
      }
    }
  }
  sendPage(t) {
    var e = {
      t: "page",
      tm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query
    };
    e.rp = this.lastPageEvent ? this.lastPageEvent.p : this.scene ? `scn:${this.scene}` : null, t.data && t.data.pvar && (e.var = t.data.pvar);
    var i = this.weixin.getPageTitle(t);
    i && i.length > 0 && (e.tl = i), this._sendEvent(e), this.lastPageEvent = e
  }
  sendPageShare(t, e, i) {
    this._sendEvent({
      t: "cstm",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      n: "onShareAppMessage",
      var: {
        from: e ? e.from : void 0,
        target: e && e.target ? e.target.id : void 0,
        title: i ? i.title : void 0,
        path: i ? i.path : void 0
      }
    })
  }
  sendClick(t, e) {
    var i = {
        t: this.CLICK_TYPE[t.type],
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
      s = t.currentTarget,
      n = {
        x: `${s.id}#${e}`
      };
    s.dataset.title ? n.v = s.dataset.title : s.dataset.src && (n.h = s.dataset.src), void 0 !== s.dataset.index && (n.idx = s.dataset.index), i.e = [n], this._sendEvent(i)
  }
  sendChange(t, e) {
    var i = {
        t: "chng",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
      s = t.currentTarget,
      n = {
        x: `${s.id}#${e}`
      };
    if (-1 !== ["blur", "change", "confirm"].indexOf(t.type) && s.dataset.growingTrack) {
      if (!t.detail.value || 0 === t.detail.value.length) return;
      "string" == typeof t.detail.value ? n.v = t.detail.value : "[object Array]" === Object.prototype.toString.call(t.detail.value) && (n.v = t.detail.value.join(","))
    }
    i.e = [n], this._sendEvent(i)
  }
  sendTabClick(t) {
    this._sendEvent({
      t: "clck",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      elem: [{
        x: "#onTabItemTap",
        v: t.text,
        idx: t.index,
        h: t.pagePath
      }]
    })
  }
  _sendEvent(t) {
    t.u = this.weixin.uid, t.s = this.sessionId, t.tm = t.tm || Date.now(), t.d = this.growingio.appId, t.b = "MinP", null !== this.cs1 && (t.cs1 = this.cs1), this.growingio.upload(t)
  }
}
class Weixin {
  constructor(t) {
    this._location = null, this._systemInfo = null, this._uid = wx.getStorageSync("_growing_uid_"), this._uid && 36 !== this._uid.length && (t.forceLogin = !1), this._esid = wx.getStorageSync("_growing_esid_")
  }
  get location() {
    return this._location
  }
  get systemInfo() {
    return null == this._systemInfo && (this._systemInfo = wx.getSystemInfoSync()), this._systemInfo
  }
  set esid(t) {
    this._esid = t, wx.setStorageSync("_growing_esid_", this._esid)
  }
  get esid() {
    return this._esid || (this._esid = 1), this._esid
  }
  set uid(t) {
    this._uid = t, wx.setStorageSync("_growing_uid_", this._uid)
  }
  get uid() {
    return this._uid || (this.uid = Utils.guid()), this._uid
  }
  syncStorage() {
    wx.getStorageSync("_growing_uid_") || wx.setStorageSync("_growing_uid_", this._uid)
  }
  requestLocation() {
    return new Promise(t => {
      this._getSetting().then(e => {
        if (!e || !e.authSetting["scope.userLocation"]) return t(null);
        this._getLocation().then(e => (this._location = e, t(e)))
      })
    })
  }
  getPageTitle(t) {
    var e = "";
    try {
      if (t.data.title && t.data.title.length > 0 && (e = t.data.title), 0 === e.length && __wxConfig) {
        if (__wxConfig.tabBar) {
          var i = __wxConfig.tabBar.list.find(e => e.pathPath == t.route || e.pagePath == `${t.route}.html`);
          i && i.text && (e = i.text)
        }
        if (0 == e.length) {
          var s = __wxConfig.page[t.route] || __wxConfig.page[`${t.route}.html`];
          e = s ? s.window.navigationBarTitleText : __wxConfig.global.window.navigationBarTitleText
        }
      }
    } catch (t) {}
    return e
  }
  _getSetting() {
    return new Promise((t, e) => {
      wx.getSetting({
        success: t,
        fail: e
      })
    })
  }
  _getLocation() {
    return new Promise((t, e) => {
      wx.getLocation({
        success: t,
        fail: e
      })
    })
  }
}
var VdsInstrumentAgent = {
  defaultPageCallbacks: {},
  defaultAppCallbacks: {},
  appHandlers: ["onShow", "onHide", "onError"],
  pageHandlers: ["onLoad", "onShow", "onShareAppMessage", "onTabItemTap"],
  actionEventTypes: ["tap", "longpress", "blur", "change", "confirm", "getuserinfo"],
  originalPage: Page,
  originalApp: App,
  hook: function(t, e) {
    return function() {
      var i, s = arguments ? arguments[0] : void 0;
      if (s && s.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(s.type)) try {
        VdsInstrumentAgent.observer.actionListener(s, t)
      } catch (t) {
        console.error(t)
      }
      if (this._growing_page_ && -1 !== ["onShow", "onLoad", "onTabItemTap"].indexOf(t) || (i = e.apply(this, arguments)), this._growing_app_ && -1 != VdsInstrumentAgent.appHandlers.indexOf(t)) try {
        VdsInstrumentAgent.defaultAppCallbacks[t].apply(this, arguments)
      } catch (t) {
        console.error(t)
      }
      if (this._growing_page_ && -1 != VdsInstrumentAgent.pageHandlers.indexOf(t)) {
        var n = Array.prototype.slice.call(arguments);
        i && n.push(i);
        try {
          VdsInstrumentAgent.defaultPageCallbacks[t].apply(this, n)
        } catch (t) {
          console.error(t)
        } - 1 != ["onShow", "onLoad", "onTabItemTap"].indexOf(t) && (i = e.apply(this, arguments))
      }
      return i
    }
  },
  instrument: function(t) {
    for (var e in t) "function" == typeof t[e] && (t[e] = this.hook(e, t[e]));
    return t._growing_app_ && VdsInstrumentAgent.appHandlers.map(function(e) {
      t[e] || (t[e] = VdsInstrumentAgent.defaultAppCallbacks[e])
    }), t._growing_page_ && VdsInstrumentAgent.pageHandlers.map(function(e) {
      t[e] || "onShareAppMessage" === e || (t[e] = VdsInstrumentAgent.defaultPageCallbacks[e])
    }), t
  },
  GrowingPage: function(t) {
    t._growing_page_ = !0, VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(t))
  },
  GrowingApp: function(t) {
    t._growing_app_ = !0, VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(t))
  },
  initInstrument: function(t) {
    VdsInstrumentAgent.observer = t, VdsInstrumentAgent.pageHandlers.forEach(function(t) {
      VdsInstrumentAgent.defaultPageCallbacks[t] = function() {
        this.__route__ && VdsInstrumentAgent.observer.pageListener(this, t, arguments)
      }
    }), VdsInstrumentAgent.appHandlers.forEach(function(t) {
      VdsInstrumentAgent.defaultAppCallbacks[t] = function() {
        VdsInstrumentAgent.observer.appListener(this, t, arguments)
      }
    }), Page = function() {
      return VdsInstrumentAgent.GrowingPage(arguments[0])
    }, App = function() {
      return VdsInstrumentAgent.GrowingApp(arguments[0])
    }
  }
};
class GrowingIO {
  constructor() {
    this.uploadingMessages = []
  }
  init(t, e, i = {}) {
    this.projectId = t, this.appId = e, this.appVer = i.version, this.debug = i.debug || !1, this.forceLogin = i.forceLogin || !1, this.weixin = new Weixin(this), this.esid = this.weixin.esid, this.uploader = new Uploader(this.projectId, this.appId), this.observer = new Observer(this), i.vue && (this.vueRootVMs = {}, this._proxyVue(i.vue)), this._start()
  }
  setHost(t) {
    this.uploader.setHost(t)
  }
  setVue(t) {
    this.vueRootVMs || (this.vueRootVMs = {}), this._proxyVue(t)
  }
  login(t) {
    if (this.forceLogin)
      for (var e of (this.weixin.uid = t, this.forceLogin = !1, this.uploadingMessages)) e.u = t, this._upload(e)
  }
  upload(t) {
    this.forceLogin ? this.uploadingMessages.push(t) : this._upload(t)
  }
  forceFlush() {
    this.weixin.esid = this.esid, this.uploader.forceFlush()
  }
  proxy(t, e) {
    try {
      "setVue" === t ? this.setVue(e[0]) : this.observer && this.observer[t] && this.observer[t].apply(this.observer, e)
    } catch (t) {
      console.error(t)
    }
  }
  _start() {
    VdsInstrumentAgent.initInstrument(this.observer)
  }
  _upload(t) {
    t.esid = this.esid++, this.debug && console.info("generate new event", JSON.stringify(t, 0, 2)), this.uploader.upload(t)
  }
  _proxyVue(t) {
    if (void 0 !== t.mixin) {
      let e = this;
      t.mixin({
        created: function() {
          if (!this.$options.methods) return;
          const t = Object.keys(this.$options.methods);
          for (let e of Object.keys(this)) 0 > t.indexOf(e) || Object.defineProperty(this[e], "name", {
            value: e
          })
        },
        beforeMount: function() {
          let t = this.$root;
          t.$mp && "page" === t.$mp.mpType && (e.vueRootVMs[t.$mp.page.route] = t)
        }
      })
    }
  }
}
var growingio = new GrowingIO,
  gio = function() {
    var t = arguments[0];
    if (t) {
      var e = 2 > arguments.length ? [] : [].slice.call(arguments, 1);
      if ("init" === t) {
        if (2 > e.length) return void console.log("初始化 GrowingIO SDK 失败。请使用 gio('init', '你的GrowingIO项目ID', '你的微信APP_ID', options);");
        growingio.init(e[0], e[1], e[2])
      } else growingio.proxy(t, e)
    }
  };
console.log("init growingio..."), module.exports = gio;