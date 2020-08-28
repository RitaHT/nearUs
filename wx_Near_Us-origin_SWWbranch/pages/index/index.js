const app = getApp();
const defaultScale = 14;
var consoleUtil = require('../../utils/consoleUtil.js');
var constant = require('../../utils/constant.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

var datalist = require('./data.js');

console.log(datalist);
//定义全局变量
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'myMap';
var qqmapsdk;

var sizeType = [
  ['compressed'],
  ['original'],
  ['compressed', 'original']
]

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    personalizedCallback:false,
    showAuthorPage:true,
    
    //地图缩放级别
  
    
    currentFriend: {        //8.15修改：当前好友对象（currentFriend）
      wxid:"",
      name:"王境泽",
      latitude:31.2303722,
      longitude:121.4732,
    },

    friendmarkers: [      
                  
    ],
   
     //8.14修改：
     showFriend:false,

     //8.14修改：好友列表（空数组），用的时候动态添加
  friendList:[
     //{wxid:"",name:"我",signature:"不愧是我~",latitude:31.23037112,longitude:121.4787},
      {wxid:"",name:"王境泽", signature:"真香教父",latitude:31.23037162,longitude:121.4726},
      {wxid:"",name:"赵日天", signature:"断罪小学",latitude:31.23837152,longitude:121.4739},
       {wxid:"",name:"王大锤",signature:"万万没想到",latitude:31.23037832,longitude:121.4732}
      
  ],

    longitude: '',
    latitude: '',
    searchResult: {},
    //地图缩放级别
    scale: defaultScale,
    locationMarkers: [],
    flag:false,
    markers: [{
        longitude: 121.38206,
        latitude: 31.113066075190382,
        //id:1,
        width: 60,
        height: 60,
        iconPath: '../../img/me.png',
        callout: {
          content: "My Location", //文本
          color: 'pink', //文本颜色
          borderRadius: 7, //边框圆角
          borderWidth: 1, //边框宽度
          //borderColor: 'white', //边框颜色
          bgColor: 'white', //背景色
          padding: 5, //文本边缘留白
          textAlign: 'center', //文本对齐方式。有效值: left, right, center
          display:"ALWAYS"
        }
      }
      //friend图钉

    ],

    showTopTip: true,
    warningText: '顶部提示',
    showUpload: true,
    showConfirm: false,
    showComment: false,
    showPersonalizedLocation: false,
    //地图高度
    mapHeight: 0,
    infoAddress: '',
    commentCount: 0,
    praiseCount: 0,
    commentList: [],
    selectAddress: '',
    centerLongitude: '',
    centerLatitude: '',
    uploadImagePath: '',
    currentMarkerId: 0,

    warningIconUrl: '',
    infoMessage: '',
    isUp: false,
    //中心指针，不随着地图拖动而移动
    controls: [],
    //搜索到的中心区域地址信息,用于携带到选择地址页面
    centerAddressBean: null,
    //选择地址后回调的实体类
    callbackAddressInfo: null,
    //将回调地址保存
    callbackLocation: null,
    //当前省份
    currentProvince: '',
    //当前城市
    currentCity: '',
    //当前区县
    currentDistrict: '',
    showHomeActionIcon: true,
    homeActionLeftDistance: '0rpx',
    //单个 marker 情报
    currentTipInfo: '',

    
  },


//8.16修改：授权页面
bindGetUserInfo: function(e) {
  let that = this;
  // console.log(e)
  // 获取用户信息
  wx.getSetting({
   success(res) {
    // console.log("res", res)
    if (res.authSetting['scope.userInfo']) {
     console.log("已授权=====")
     // 已经授权，可以直接调用 getUserInfo 获取头像昵称
     wx.getUserInfo({
      success(res) {
       console.log("获取用户信息成功", res)
       that.setData({
         showAuthorPage:false,
        name: res.userInfo.nickName
       })
      },
      fail(res) {
       console.log("获取用户信息失败", res)
      }
     })
    } else {
     console.log("未授权=====")
     that.showSettingToast("请授权")
    }
   }
  })
 },
 
 // 打开权限设置页提示框
 showSettingToast: function(e) {
  wx.showModal({
   title: '提示！',
   confirmText: '去设置',
   showCancel: false,
   content: e,
   success: function(res) {
    if (res.confirm) {
     wx.navigateTo({
      url: '../setting/setting',
     })
    }
   }
  })
 },

     // 8.14修改：显示好友列表函数
     showFriendList:	function()	 {
      
       console.log("进入好友列表显示函数");
      this.setData({  showFriend:  !this.data.showFriend});
      },
  
      // 8.14修改：addFriend函数
 addFriend: function(){           //TODO：补充addFriend接口
  wx.showModal({
    title: '添加好友',
    content: '你点击了添加好友按钮',
    showCancel: false
  })
 },

//8.14修改：friend的构造函数
friend :function(wxid,name,latitude,longitude,address)
{
  this.address=address;       //地址
  this.longitude=longitude;   //经度
  this.latitude=latitude;   //纬度
  this.wxid=wxid;       //微信id
    this.name=name;     //好友名字
},

//8.15修改：setCurrentFriend函数：用来设置当前好友，在触发clickItem后调用

setCurrentFriend: function(e)
{
  console.log(e.currentTarget.dataset.wxid);
  console.log(e.currentTarget.dataset.name);
  console.log(e.currentTarget.dataset.latitude);
  console.log(e.currentTarget.dataset.longitude);
  this.setData({
    'currentFriend.wxid':e.currentTarget.dataset.wxid,    //1.设置currentFriend信息
    'currentFriend.name':e.currentTarget.dataset.name,
    'currentFriend.latitude':e.currentTarget.dataset.latitude,
    'currentFriend.longitude':e.currentTarget.dataset.longitude,

  });
},



//8.14修改：clickItem函数（点击Item的响应函数）
clickItem:function(e){
  
  this.setData({  showFriend:  !this.data.showFriend});   //点击Item后，收起列表
  
  console.log("进入了clickItem");
  this.setCurrentFriend(e);          //设置当前好友

 this.setData(              //地图位置跳转
   {latitude:e.currentTarget.dataset.latitude,
    longitude:e.currentTarget.dataset.longitude,
    scale:18,         //缩放
  },
   );
   console.log(e.currentTarget.dataset.latitude);
   console.log(e.currentTarget.dataset.longitude);
// that.updateCenterLocation(e.currentTarget.dataset.latitude, e.currentTarget.dataset.longitude);
},



  //}, !!

  moveTolocation: function () {
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.moveToLocation();
  },

  onLoad: function (options) {
    var that = this;

    if (app.globalData.userInfo) {
      consoleUtil.log(1);
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })

      console.log("进入了userifo---------------------------");
      console.log(app.globalData.userInfo);

    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      consoleUtil.log(2);
      app.userInfoReadyCallback = res => {
        consoleUtil.log(3);
        app.globalData.userInfo = res.userInfo;
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    that.scopeSetting();

  },

  onShow: function () {
    consoleUtil.log('onShow--------------------->');

    var that = this;
    that.changeMapHeight();
  
    if(this.data.locationMarkers.length==0){
      this.showPoints();
     }
     else{
       console.log(this.data.locationMarkers)
     }

    var that = this;
    that.changeMapHeight();
    
    consoleUtil.log(that.data.callbackAddressInfo)
    if (that.data.callbackAddressInfo == null) {
      that.getCenterLocation();
      //正在上传的话，不去请求地理位置信息
      if (that.data.showUpload) {
        that.requestLocation();
      }
    } else {
      that.setData({
        selectAddress: that.data.callbackAddressInfo.title,
        callbackLocation: that.data.callbackAddressInfo.location,
        latitude: that.data.callbackAddressInfo.location.lat,
        longitude: that.data.callbackAddressInfo.location.lng
      })
      console.log(that.data.selectAddress)
      that.updateCenterLocation(that.data.callbackLocation.lat, that.data.callbackLocation.lng);
      //that.moveTolocation();
      //置空回调数据，即只使用一次，下次中心点变化后就不再使用
      that.setData({
        callbackAddressInfo: null,
        personalizedCallback:false
      })
    }
  },

  /**
   * 页面不可见时
   */
  onHide: function () {

  },

  /**
   * 点击顶部横幅提示
   */
  showNewMarkerClick: function () {

    var that = this;
    that.setData({
      showPersonalizedLocation:!(that.data.showPersonalizedLocation)
    })
    
    
  },
  //convert data in datalist to markers
  showPoints: function () {
    var that = this;
    var markerList = that.data.markers;
              //8.16修改：将friendlist好友列表中的元素加到marker数组中
    for(let index=0;index<this.data.friendList.length;index++)
    {
      let modelMarker= {              //marker模板
        iconPath:'../../img/you.png',
      width:40,
      height:40,
        latitude:31.23844131,
        longitude:121.471131,
        name:"我",
        callout:{
          content:'是我~',
          color:'#fff',
          fontsize:15,
          borderRadius:10,
          bgColor:'#333',
          padding:5
        },
        label:{
          content:'小明',color:'#333',
          anchorX:0,anchorY:0,
          borderWidth:1,borderColor:'#000',borderRadius:5,
          bgColor:'#fff', padding:2,textAlign:'center'
        }
      };
       //将模板marker的属性，改成相应好友的属性，得到对应好友的marker
      modelMarker.latitude=this.data.friendList[index].latitude;       
      modelMarker.longitude=this.data.friendList[index].longitude;
      modelMarker.name=this.data.friendList[index].name;
      modelMarker.label.content=this.data.friendList[index].name;
      modelMarker.callout.content=this.data.friendList[index].signature;
      console.log(modelMarker.latitude);
      console.log(modelMarker.longitude);
      console.log(modelMarker.latitude);
      console.log(modelMarker.latitude);
      markerList.push(modelMarker);//!!!!
      console.log("现在marker数组的长度是："+markerList.length);
      // console.log("已将"+this.data.friendList[index].name+"添加到数组中，"+"现在数组长度为："+this.data.friendmarkers.length);
      // console.log("纬度："+this.data.friendmarkers[index].latitude+"经度："+this.data.friendmarkers[index].longitude);
    }//end for loop

    

    
    for (var event of datalist) {

      var searchkey = event.venue;
      var searchCity = event.venuecity;
      var name = event.name;
      var time=event.showtime;
      that.suggestionSearch(searchkey, searchCity,name,time).then(
        result => {
          var currentmarker = {
            latitude: result.location.lat,
            longitude: result.location.lng,
            width: 50,
            height: 50,
            iconPath: '../../img/bulb.png',
            callout: {
              content: result.eventName+'\n'+'\n'+result.showTime+'\n'+'\n'+result.address,
              borderRadius: 15,  //边框圆角
              borderWidth: 0,//边框宽度
              padding: 5,
              bgColor:"#715C88",
              color:"#ffffff",
              textAlign:'center',
              /*
              color:'#E5958E',
              bgColor:'ffffff'*/

            }
          }
          
          markerList.push(currentmarker);
          console.log(currentmarker);

          this.setData({
            locationMarkers: markerList
          })
          console.log(this.data.locationMarkers)

        }
      )



    }
    this.setData({
      scale:14
    })
  },

  suggestionSearch: function (searchValue, city,eventname,showtime) {
    return new Promise((resolve, reject) => {
      var that = this;
      consoleUtil.log(qqmapsdk);
      qqmapsdk.getSuggestion({
        keyword: searchValue,
        region: city,
        region_fix: 1,
        policy: 1,
        success: function (res) {
          console.log("bilbilbil");
          console.log(res.data[0]);
          res.data[0].eventName=eventname;
          res.data[0].showTime=showtime;
          res.data[0].address=searchValue;
          //return res.data[0];
          resolve(res.data[0])
        },
        fail: function (res) {
          console.log(res);
          //return {};
          reject();
        }
      });
    });
  },
  


  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        consoleUtil.log(res);
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        var query = wx.createSelectorQuery();
        query.select('#bottom-layout').boundingClientRect()
        query.exec(function (res) {
          consoleUtil.log(res);
          bottomHeight = res[0].height;
          that.setMapHeight();
        })
      },
    })
  },

  setMapHeight: function (params) {
    var that = this;
    that.setData({
      mapHeight: (windowHeight - bottomHeight) + 'px'
    })
    var controlsWidth = 40;
    var controlsHeight = 48;
    //设置中间部分指针
    // that.setData({
    //   controls: [{
    //     id: 1,
    //     : '../../img/personLocation.png',
    //     position: {
    //       left: (windowWidth - controlsWidth) / 2,
    //       top: (windowHeight - bottomHeight) / 2 - controlsHeight * 3 / 4,
    //       width: controlsWidth,
    //       height: controlsHeight
    //     },
    //     clickable: true
    //   }]
    // })

  },

  scopeSetting: function () {
    var that = this;

    that.initMap();
  },

  /** 
   * 初始化地图
   */
  initMap: function () {
    var that = this;
    qqmapsdk = new QQMapWX({
      key: constant.tencentAk
    });
    that.getCenterLocation();
  },

  //请求地理位置
  requestLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        that.moveTolocation();
      },
    })
  },

  /**
   * 点击marker
   */
  bindMakertap: function (e) {
    var that = this;
    //设置当前点击的id
    that.setData({
      currentMarkerId: e.markerId
    })
    //重新设置点击marker为中心点
    for (var key in that.data.markers) {
      var marker = that.data.markers[key];
      if (e.markerId == marker.id) {
        that.setData({
          longitude: marker.longitude,
          latitude: marker.latitude,
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: '你点击了marker',
      showCancel: false,
    })
  },

  /**
   * 移动视野tap
   */
  uploadInfoClick: function (e) {
    var that = this;
    that.adjustViewStatus(false, true);
    that.updateCenterLocation(that.data.latitude, that.data.longitude);
    that.regeocodingAddress();

    console.log(Number(e.currentTarget.id));
    if(Number(e.currentTarget.id)==1){
      that.setData({
        flag:true,
        latitude:this.data.locationMarkers[0].latitude,
        longitude:this.data.locationMarkers[0].longitude
      })
    }
    else{
      that.setData({
        flag:false
      })
    }
  },

  /**
   * 更新上传坐标点
   */
  updateCenterLocation: function (latitude, longitude) {
    var that = this;
    that.setData({
      centerLatitude: latitude,
      centerLongitude: longitude
    })
  },

  /**
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    //还原默认缩放级别
    that.setData({
      scale: defaultScale
    })
    //必须请求定位，改变中心点坐标
    that.requestLocation();
  },

  /**
   * 移动到中心点
   */


  cancelClick: function () {
    var that = this;
    that.adjustViewStatus(true,false);
  },


  /**
   * 点击控件时触发
   */
  controlTap: function () {

  },

  /**
   * 点击地图时触发
   */
  bindMapTap: function () {
    //恢复到原始页

    this.setData(       
      {
        showFriend:false,     //隐藏好友列表
        showPersonalizedLocation: false, //hide more menu
        showConfirm:false
      }
    )

    //this.adjustViewStatus(true, false, false);
  },

  adjustViewStatus: function (uploadStatus,confirmStatus) {
    var that = this;
    that.setData({
      showUpload: uploadStatus,
      showConfirm: confirmStatus
    })
    that.changeMapHeight();
  },


 

  onShareAppMessage: function (res) {
    
  },

  

  /**
   * 拖动地图回调
   */
  regionChange: function (res) {
    var that = this;
    // 改变中心点位置  
    if (res.type == "end") {
      that.getCenterLocation();
    }
  },

  /**
   * 得到中心点坐标
   */
  getCenterLocation: function () {

 
    var that = this;
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('getCenterLocation----------------------->');
        console.log(res);

        that.updateCenterLocation(res.latitude, res.longitude);
        that.regeocodingAddress();
        that.queryMarkerInfo();
      }
    })
  },

  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    //不在发布页面，不进行逆地址解析，节省调用次数，腾讯未申请额度前一天只有10000次
    if (!that.data.showConfirm) {
      return;
    }
    //通过经纬度解析地址
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      success: function (res) {
        console.log(res);
        that.setData({
          centerAddressBean: res.result,
          selectAddress: res.result.formatted_addresses.recommend,
          currentProvince: res.result.address_component.province,
          currentCity: res.result.address_component.city,
          currentDistrict: res.result.address_component.district,
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  confirmClick: function (res) {
    var that = this;
    consoleUtil.log(res);
    var message = res.detail.value.message.trim();
    if (!that.data.centerLatitude || !that.data.centerLongitude) {
      that.showModal('请选择上传地点~');
      return;

    }
  },

  /**
   * 查询 marker 信息
   */
  queryMarkerInfo: function () {
    var that = this;
    consoleUtil.log('查询当前坐标 marker 点信息')
    //调用请求 marker 点的接口就好了
  },

  /**
   * 创建marker
   */
  // createMarker: function (dataList) {
  //   var that = this;
  //   var currentMarker = [];
  //   var markerList = dataList.data;
  //   for (var key in markerList) {
  //     var marker = markerList[key];
  //     marker.id = marker.info_id;
  //     marker.latitude = marker.lat;
  //     marker.longitude = marker.lng;
  //     marker.width = 40;
  //     marker.height = 40;

  //     marker.iconPath = '../../img/dog-select.png';
     

  //   }
  //   currentMarker = currentMarker.concat(markerList);
  //   consoleUtil.log('-----------------------');
  //   consoleUtil.log(currentMarker);
  //   that.setData({
  //     markers: currentMarker
  //   })
  // },

  /**
   * 选择地址
   */
  chooseAddress: function () {
    var that = this;

    this.setData({
      showConfirm:false
    })
    if(that.data.flag){
      wx.navigateTo({
        url: '../personalizeAddress/personalizeAddress?city=' + that.data.centerAddressBean.address_component.city + '&street=' + that.data.centerAddressBean.address_component.street,
      })
    }else{
    wx.navigateTo({
      url: '../chooseAddress/chooseAddress?city=' + that.data.centerAddressBean.address_component.city + '&street=' + that.data.centerAddressBean.address_component.street,
    })}
    console.log("hahahahhah")
    //that.updateCenterLocation(callbackLocation.lat,callbackLocation.lng);
  },

  


  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})