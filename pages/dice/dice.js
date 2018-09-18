//logs.js
var gio = require('../../utils/gio-minp.js');
var util = require('../../utils/util.js')
Page({
  data: {
    dice: 1,
    diceAnimation: {}
  },
  onShareAppMessage: function () {
    return {
      title: '我的骰子！',
      path: '/pages/dice/dice',
      success: function (res) {
        // 分享成功
        gio('track', 'shareSuccess', { 'sharedPage': this.title })
      },
      fail: function (res) {
        // 分享失败
        gio('track', 'shareFail')
      }
    }
  },
  rethrow: function() {
      this.onLoad();
  },

  onLoad: function () {
    this.diceRollTimer = setTimeout(this.rollDice, this.rollDelay);
    this.diceRollCount = 10;
    this.diceRollTimer = null;
    this.rollDelay = 200;
    this.nums = [];
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      timingFunction: "ease-in-out"
    });
    animation.opacity(0.1).rotate(1).scale(0.1, 0.1).step({
      duration: 10
    });
    this.setData({
      diceAnimation: animation.export()
    });
    setTimeout(function () {
      animation.opacity(1).rotate(90 * 15).scale(1, 1).step({
        duration: 2500
      });
      this.setData({
        diceAnimation: animation.export()
      });
    }.bind(this), 100);
  },
  rollDice: function () {
    if (this.diceRollCount-- < 0) {
      clearTimeout(this.diceRollTimer);
      console.log(this.nums);
    } else {
      this.nums[this.data.dice] = this.data.dice;
      this.setData(
        { 'dice': Math.ceil((this.data.dice + Math.ceil(Math.random() * 5)) % 6) + 1 });
      setTimeout(this.rollDice, this.rollDelay);
    }
  }
})
