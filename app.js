//app.js
var gio = require('vds-mina.js')
gio.projectId = "85864a8537ab43a2a066feb1855c1783"
gio.appId = "wxe3947a636f66ee7a"
gio.debug = true
App({
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              gio.setCS1("user", res.userInfo.nickName)
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  }
})