# picker
[![npm](https://img.shields.io/npm/v/better-picker.svg?style=flat-square)](https://www.npmjs.com/package/better-picker)

移动端最好用的的筛选器组件，高仿 ios 的 UIPickerView ，非常流畅的体验。
## 在[ustbhuangyi/picker](https://github.com/ustbhuangyi/picker) 的基础上根据自己的需求修改而来
## Fetures
- 支持单列、多列选择
- 支持动态更新每列的数据


## 如何使用
```shell script
git clone https://github.com/bxzhou2008/picker.git
cd picker
npm i
npm run build
```
把dist/picker.min.js放到自己的项目中即可使用

JS 部分：

```javascript
var nameEl = document.getElementById('chose');
const addressBtn = document.getElementById('address');

function range(size, start = 0) {
  return [...Array(size).keys()].map(i => i + start)
}

const today = new Date()
const dateData = range(30, today.getFullYear()).map(vy =>{
  return {
    text:vy,
    value:vy,
    sub:()=>range(12, 1).map(vm =>{
      let maxDate = vm === 12 ? 31 : (new Date(vy, vm, 0)).getDate()
      return {
        text:vm,
        value:vm,
        sub: ()=>range(maxDate, 1).map(v =>{ return {text:v,value:v} })
      }
    })
  }
})

var picker = new Picker({

  data: dateData,
    title: '选择日期'
});

picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
  nameEl.innerText = selectedVal.join('-')
});

nameEl.addEventListener('click', function () {
    picker.show();
});

picker.on('picker.select', function (selectedVal, selectedIndex) {
    nameEl.innerText = data1[selectedIndex[0]].text + ' ' + data2[selectedIndex[1]].text + ' ' + data3[selectedIndex[2]].text;
})

picker.on('picker.change', function (index, selectedIndex) {
    console.log(index);
    console.log(selectedIndex);
});

picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
    console.log(selectedVal);
    console.log(selectedIndex);
});



var address = new Picker({

  data: cityData,
  title: '选择地址'
});

address.on('picker.valuechange', function (selectedVal, selectedIndex) {
  addressBtn.innerText = selectedVal.filter(v=> !!v).join('-')
});

addressBtn.addEventListener('click', function () {
  address.show();
});
```

### options
options.title  (String)

筛选器标题，默认为空。

options.data  (Array)

筛选器的数据，是一个二维数组，第一维表示多少列数据，第二维表示每列的数据，单个数据是一个 object，由 text 和 value 两个字段组成，text 表示显示在筛选器的文本，value 表示数据的值。

options.selectedIndex (Array)

筛选器初始化默认选择的数据索引，是一个二维数组，第一维表示列的序号，第二维表示每列的行号，从 0 开始。

### 事件
picker.change

当一列滚动停止的时候，会派发 picker.change 事件，同时会传递列序号 index 及滚动停止的位置 selectedIndex。

picker.select

当用户点击确定的时候，会派发 picker.select 事件，同时会传递每列选择的值数组 selectedVal 和每列选择的序号数组 selectedIndex。

picker.cancel

当用户点击取消的时候，会派发picker.cancel事件。

picker.valuechange

当用户点击确定的时候，如果本次选择的数据和上一次不一致，会派发 picker.valuechange 事件，同时会传递每列选择的值数组 selectedVal 和每列选择的序号数组 selectedIndex。

### 编程接口
show (next)

显示筛选器，next 为筛选器显示后执行的回调函数。

hide ()

隐藏筛选器，一般来说，筛选器内部已经实现了隐藏逻辑，不必主动调用。

refill (datas)

重填全部数据，datas为二位数组，如[lists1, lists2, lists3]

refillColumn(index, data)

重填某一列的数据，index为列序号，data为数据数组。

scrollColumn(index, dist)

复位某一列的默认选项，index为列序号，dist为选项的下标，起始值为0

## 如何构建
picker的源码是基于webpack构建的

首先，clone项目源码
```bash
git clone https://github.com/bxzhou2008/picker.git
```

安装依赖
```bash
cd picker
npm install
```
测试demo页

```bash
npm run dev
```
打开浏览器访问如下地址, 查看效果

> localhost:9090

