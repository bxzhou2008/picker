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
  selectedIndex: [0, today.getMonth(), today.getDate()-1],
	title: '选择日期'
});

picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
  nameEl.innerText = selectedVal.join('-')
});

nameEl.addEventListener('click', function () {
	picker.show();
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

