//index.js
//获取应用实例
var MD5 = require('../../utils/md5')
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    translatedText: ''
  },
  originText: function (e) {
    this.value = e.detail.value;
  },
  translateIt: function () {
    if (this.value) {
      var appid = '20170331000043951';
      var key = 'ox3cqEJqQRRHpxENGq7q';
      var salt = (new Date).getTime();
      var query = this.value;
      var origin = 'auto';
      var to = 'zh';
      var str1 = appid + query + salt + key;
      var sign = MD5(str1);
      wx.request({
        url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
        data: {
          q: query,
          appid: appid,
          salt: salt,
          from: origin,
          to: to,
          sign: sign
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function (res) {
          this.setData({
            translatedText: res.data.trans_result.length > 1 ? res.data.trans_result.reduce(function (a, b) {
              return a.dst + '\n' + b.dst;
            }) : res.data.trans_result[0].dst
          })
        }.bind(this),
        fail: function (res) {
          // fail
        },
        complete: function (res) {
          // complete
        }
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '邦邦帮你翻译！',
      path: '/pages/index/index?origin=' + this.value,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
  onLoad: function (params) {
    console.log('onLoad')
    var that = this;
    if (params && params.origin) {
      this.value = params.origin;
      this.setData({ value: this.value })
      this.translateIt();
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      });
    })
  }
})
