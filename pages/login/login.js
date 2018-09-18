// pages/login/login.js
var gio = require('../../utils/gio-minp.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  onShareAppMessage: function () {
    return {
      title: '首页',
      path: '/pages/login/login',
      success: function (res) {
        // 分享成功
        gio('track', 'shareSuccess', { 'sharedPage': this.title })//为啥页面title没拿到？
      },
      fail: function (res) {
        // 分享失败
        gio('track', 'shareFail')
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  alike: function(e) {
    console.log(e.detail.value);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  
})