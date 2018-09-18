//app.js
// var gio = require('vds-mina.js')
// gio.projectId = "85864a8537ab43a2a066feb1855c1783"
// gio.appId = "wxe3947a636f66ee7a"
// gio.debug = true
var gio = require("utils/gio-minp.js");// version 是你的小程序的版本号 
gio('init', '85864a8537ab43a2a066feb1855c1783', 'wx3487bb98a8a5510e', {
  debug: true,
  version: '3.2.1'
});
App({
  onLaunch: function() {
    this.getUserInfo();
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              gio('setVisitor', res.userInfo);
              console.log(res);
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})