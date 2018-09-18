//index.js
//获取应用实例
const app = getApp()

function keep2Dot(num) {
  return Math.round(num * 100) / 100;
}

Page({
  data: {
    motto: '开始',
    userInfo: {},
    hasUserInfo: false,
    random: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    delta: "",
    startTime: 0
  },
  goCounter: function() {
    if (this.data.motto == '开始') {
      this.setData({
        motto: '停止',
        startTime: new Date().getTime()
      })
    } else if (this.data.motto == '停止') {
      let duration = keep2Dot((new Date().getTime() - this.data.startTime) / 1000);
      this.setData({
        motto: duration + '秒',
        delta: '你距离目标只有' + keep2Dot(Math.abs(this.data.random - duration)) + "秒"
      })
    } else {
      this.setData({
        motto: "开始",
        delta: "",
        random: Math.round(Math.random() * 10 + 5)
      })
    }
  },
  onLoad: function (param) {
    console.warn('param is ', param)
    if (param && param.random) {
      this.setData({
        random: parseInt(param.random)
      })
    } else {
      this.setData({
        random: Math.round(Math.random() * 10 + 5)
      })
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  onShareAppMessage: function() {
    return {
      title: '倒计时！',
      path: '/pages/counter/counter?random=' + this.data.random,
      success: function(res) {
        // 分享成功
        gio('track', 'shareSuccess', {
          'sharedPage': '倒计时！'
        });
      },
      fail: function(res) {
        // 分享失败
      }
    };
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})