import BScroll from 'better-scroll';
import EventEmitter from '../util/eventEmitter';
import {extend} from '../util/lang';
import {
  createDom,
  addEvent,
  addClass,
  removeClass
} from '../util/dom';
import pickerTemplate from './picker.handlebars';
import itemTemplate from './item.handlebars';
import './picker.styl';

export default class Picker extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      data: [],
      title: '',
      selectedIndex: [0, 0, 0],
      showCls: 'show'
    };

    extend(this.options, options);
    this.selectedIndex = [];
    this.selectedVal = [];
    if (this.options.selectedIndex) {
      this.selectedIndex = this.options.selectedIndex;
    } else {
      for (let i = 0; i < this.data.length; i++) {
        this.selectedIndex[i] = 0;
      }
    }
    this._original = this.options.data;
    this.data = this._fillData();
    console.log('p', this.data);
    this.pickerEl = createDom(pickerTemplate({
      data: this.data,
      title: this.options.title
    }));

    document.body.appendChild(this.pickerEl);

    this.maskEl = this.pickerEl.getElementsByClassName('mask-hook')[0];
    this.wheelEl = this.pickerEl.getElementsByClassName('wheel-hook');
    this.panelEl = this.pickerEl.getElementsByClassName('panel-hook')[0];
    this.confirmEl = this.pickerEl.getElementsByClassName('confirm-hook')[0];
    this.cancelEl = this.pickerEl.getElementsByClassName('cancel-hook')[0];
    this.scrollEl = this.pickerEl.getElementsByClassName('wheel-scroll-hook');

    this._init();
  }

  _fillData() {
    let data = [];
    let source = this._original;
    for (let i = 0; i < this.selectedIndex.length; i++) {
      data.push(this._getData(source, this.selectedIndex[i]));
      let subData = source[this.selectedIndex[i]] || [];
      source = (typeof subData.sub === 'function' ? subData.sub() : subData.sub) || [];
    }
    return data;
  }

  _getData(source, index) {
    let data = null;
    source.map((v, j) => {
      if (index === j) {
        data = source.map(({sub, ...v}) => {
          return v;
        });
        source = (typeof v.sub === 'function' ? v.sub() : v.sub) || [];
      }
    });
    return data;
  }

  _getDataByIndex(index) {
    let data = null;
    if (index >= this.data.length) {
      return [];
    }
    for (let i = 0; i < index; i++) {
      data = (this._value(data ? data.sub : false) || this._original)[this.selectedIndex[i]];
    }
    return (this._value(data.sub)).map(({sub, ...v}) => v);
  }

  _value(v, def = null) {
    if (typeof v === 'function') {
      return v() || def;
    }
    return v || def;
  }

  _checkSub(start) {
    let maxDepth = this.data.length;
    if (start + 1 >= maxDepth) {
      return;
    }
    const sub = this._getDataByIndex(start + 1);
    const newList = sub.map(({sub, ...v}) => v);
    this.refillColumn(start + 1, newList);
    this._checkSub(start + 1);
  }

  _init() {
    this._bindEvent();
  }

  _bindEvent() {
    addEvent(this.pickerEl, 'touchmove', (e) => {
      e.preventDefault();
    });

    addEvent(this.confirmEl, 'click', () => {
      this.hide();

      let changed = false;
      for (let i = 0; i < this.data.length; i++) {
        let index = this.wheels[i].getSelectedIndex();
        this.selectedIndex[i] = index;

        let value = null;
        if (this.data[i] && this.data[i].length) {
          value = this.data[i][index].value;
        }
        if (this.selectedVal[i] !== value) {
          changed = true;
        }
        this.selectedVal[i] = value;
      }

      this.trigger('picker.select', this.selectedVal, this.selectedIndex);

      if (changed) {
        this.trigger('picker.valuechange', this.selectedVal, this.selectedIndex);
      }
    });

    addEvent(this.cancelEl, 'click', () => {
      this.hide();
      this.trigger('picker.cancel');
    });
  }

  _createWheel(wheelEl, i) {
    this.wheels[i] = new BScroll(wheelEl[i], {
      wheel: true,
      selectedIndex: this.selectedIndex[i]
    });
    ((index) => {
      this.wheels[index].on('scrollEnd', () => {
        let currentIndex = this.wheels[index].getSelectedIndex();
        if (this.selectedIndex[i] !== currentIndex) {
          this.selectedIndex[i] = currentIndex;
          this.trigger('picker.change', index, currentIndex);
          console.log('picker.change', index, currentIndex);
          this._checkSub(index);
        }
      });
    })(i);
    return this.wheels[i];
  }

  show(next) {
    this.pickerEl.style.display = 'block';
    let showCls = this.options.showCls;

    window.setTimeout(() => {
      addClass(this.maskEl, showCls);
      addClass(this.panelEl, showCls);

      if (!this.wheels) {
        this.wheels = [];
        for (let i = 0; i < this.data.length; i++) {
          this._createWheel(this.wheelEl, i);
        }
      } else {
        for (let i = 0; i < this.data.length; i++) {
          this.wheels[i].enable();
          this.wheels[i].wheelTo(this.selectedIndex[i]);
        }
      }
      next && next();
    }, 0);
  }

  hide() {
    let showCls = this.options.showCls;
    removeClass(this.maskEl, showCls);
    removeClass(this.panelEl, showCls);

    window.setTimeout(() => {
      this.pickerEl.style.display = 'none';
      for (let i = 0; i < this.data.length; i++) {
        this.wheels[i].disable();
      }
    }, 500);
  }

  refillColumn(index, data) {
    let scrollEl = this.scrollEl[index];
    let wheel = this.wheels[index];
    if (scrollEl && wheel) {
      let oldData = this.data[index] || [];
      this.data[index] = data;
      scrollEl.innerHTML = itemTemplate(data);

      let selectedIndex = wheel.getSelectedIndex();
      let dist = 0;
      if (oldData.length) {
        let oldValue = oldData[selectedIndex].value;
        for (let i = 0; i < data.length; i++) {
          if (data[i].value === oldValue) {
            dist = i;
            break;
          }
        }
      }
      this.selectedIndex[index] = dist;
      wheel.refresh();
      wheel.wheelTo(dist);
      return dist;
    }
  }

  refill(datas) {
    let ret = [];
    if (!datas.length) {
      return ret;
    }
    datas.forEach((data, index) => {
      ret[index] = this.refillColumn(index, data);
    });
    return ret;
  }

  scrollColumn(index, dist) {
    let wheel = this.wheels[index];
    wheel.wheelTo(dist);
  }
}
