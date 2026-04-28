<template>
    <div class="br-virtual-scroll br-comp" v-resize="onResize" v-scroll.self="onScroll" >
      <div class="br-virtual-head" v-for="(head, hIdx) in headItems" :key="'head-' + hIdx" >
		    <slot name="header" v-bind:item="head" v-bind:index="hIdx" v-bind:length="headItems.length"></slot>	
	    </div>
      
      <div class="br-virtual-scroll-space" :style="{height: startHeight + 'px', width: '100%'}"></div>
  
      <div v-for="row in visibleRows" 
          :key="row.index" 
          class="br-virtual-scroll__item"
          @click="select(row)"
      >
        <slot v-bind:item="row.item" v-bind:index="row.index" v-bind:selected="isSelected(row)"  v-bind:length="items.length"></slot>
      </div>
      <div class="br-virtual-scroll-space" :style="{height: endHeight + 'px', width: '100%'}"></div>
    </div>
  </template>  
  <script>
  //import Vue from 'vue';
  //import lodash from 'lodash';
  
  const accumulatorProp = "offset";
  const heightField = "height";
  const imsi_height = 100000;
  
  const ScrollPositions = {
      default: 'default',
      top: 'top',
      bottom: 'bottom',
      //topInset: 'topInset',
      //bottomInset: 'bottomInset',
  };
  
  class StoredScrollPosition {
      constructor(item, offset) {
          this.item = item;
          this.offset = offset;
      }
  }
  
  function getNestedValue (obj, path, fallback) {
    const last = path.length - 1;
    if (last < 0) return obj === undefined ? fallback : obj;
  
    for (let i = 0; i < last; i++) {
      if (obj == null) {
        return fallback;
      }
      obj = obj[path[i]];
    }
  
    if (obj == null) return fallback;
  
    return obj[path[last]] === undefined ? fallback : obj[path[last]];
  }
  
  function getObjectValueByPath (obj, path, fallback) {
    // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
    if (obj == null || !path || typeof path !== 'string') return fallback
    if (obj[path] !== undefined) return obj[path];
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, ''); // strip a leading dot
    return getNestedValue(obj, path.split('.'), fallback);
  }
  
  function deepEqual (a, b) {
    if (a === b) return true;
  
    if (
      a instanceof Date &&
      b instanceof Date &&
      a.getTime() !== b.getTime()
    ) {
      // If the values are Date, compare them as timestamps
      return false;
    }
  
    if (a !== Object(a) || b !== Object(b)) {
      // If the values aren't objects, they were already checked for equality
      return false;
    }
  
    const props = Object.keys(a);
  
    if (props.length !== Object.keys(b).length) {
      // Different number of props, don't bother to check
      return false;
    }
  
    return props.every(p => deepEqual(a[p], b[p]));
  }
  
  const keyCodes = Object.freeze({
    enter: 13,
    tab: 9,
    delete: 46,
    esc: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    end: 35,
    home: 36,
    del: 46,
    backspace: 8,
    insert: 45,
    pageup: 33,
    pagedown: 34,
    shift: 16,
  });
  
  export default {
    name: 'br-virtual-scroll',
    props: {
      bench: {
        type: [Number, String],
        default: 0,
      },
      itemHeight: {
        type: [Number, String],
        default: 'auto',
      },
      minItemHeight: {
        type: Number,
        default: 30,
      },
      items: {
        type: Array,
        default: () => [],
      },
      headItems: {
        type: Array,
        default: () => [],
      },
      singleSelect: {
          type: Boolean,
          default: true,
      },
      selectableKey: {
        type: String,
        default: 'index',
      },
      itemKey: {
        type: String,
        default: 'index',
      },
      debug: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
          visibleRows: [],
          startHeight: 0,
          endHeight: 0,
          /*
          scrollTop: 0,
          scrollHeight: 0,
          heightInvalidAfter: 0,
          currentStart: 0,
          currentEnd: 0,
          heightUpdateCounter: 0,
          clientHeight: 0,
          buffer: 200,
          */
          threshold: 50,
          shiftKeyDown: false,
          selection: {},
          lastEntry: -1,
          __clientHeight: null,
          headHeight: 0,
      };
    },
    mounted() {
      this.scrollTop = 0;
      this.currentStart = 0;
      this.currentEnd = 0;
      this.heightInvalidAfter = 0;
      this.heightUpdateCounter = 0;
  
      this.scrollHeight = 0;
  
      this.updateVisibleRows();
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
    },
    destroyed() {
      //unregisterScrollListener(this._scrollInfo);
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    },
    computed: {
      __bench () {
        return parseInt(this.bench, 10);
      },
      __itemHeight () {
        if ( this.itemHeight == "auto" ) {
          return this.minItemHeight;
        }
        return parseInt(this.itemHeight, 10);
      },
      selectableItems () {
        return this.items.filter(item => this.isSelectable(item))
      },
    },
    watch: {
      itemHeight: 'onScroll',
      items() {
          this.verifyRows();
          this.updateVisibleRows();
      },
      /*
      value: {
        handler (value) {
          if ( !Array.isArray(value) ) return [];
          this.selection = value.reduce((selection, item) => {
            selection[getObjectValueByPath(item, this.itemKey)] = item;
            return selection;
          }, {});
        },
        immediate: true,
      },
      */
      selection (value, old) {
        if (deepEqual(Object.keys(value), Object.keys(old))) return;
        this.$emit('input', Object.values(value));
      },
    },
    activated() {
      this.onResize();
    },
    methods: {
      onkeydown(e) {
        if (e.keyCode !== keyCodes.shift) return
        this.shiftKeyDown = true
      },
      onKeyUp(e) {
        if (e.keyCode !== keyCodes.shift) return
        this.shiftKeyDown = false
      },
      toggleSelectAll (value) {
        const selection = Object.assign({}, this.selection)
  
        for (let i = 0; i < this.selectableItems.length; i++) {
          const item = this.selectableItems[i];
          if (!this.isSelectable(item)) continue
          const key = getObjectValueByPath(item, this.itemKey);
          if (value) selection[key] = item;
          else delete selection[key];
        }
        this.selection = selection;
        this.$emit('toggle-select-all', { items: this.internalCurrentItems, value });
      },
      isSelectable (item) {
        return getObjectValueByPath(item, this.selectableKey) !== false;
      },
      isSelected (item) {
        return !!this.selection[getObjectValueByPath(item, this.itemKey)] || false;
      },
      select (item, value = true, emit = true) {
        if (!this.isSelectable(item)) return;
  
        const selection = this.singleSelect ? {} : Object.assign({}, this.selection);
        const key = getObjectValueByPath(item, this.itemKey);
  
        if (value) selection[key] = item;
        else delete selection[key];
  
        const index = this.selectableItems.findIndex(x => getObjectValueByPath(x, this.itemKey) === key);
        if (this.lastEntry === -1) this.lastEntry = index;
        else if (this.shiftKeyDown && !this.singleSelect && emit) {
          const lastEntryKey = getObjectValueByPath(this.selectableItems[this.lastEntry], this.itemKey);
          const lastEntryKeySelected = Object.keys(this.selection).includes(String(lastEntryKey));
          this.multipleSelect(lastEntryKeySelected, emit, selection, index);
        }
        this.lastEntry = index;
  
        if (this.singleSelect && emit) {
          const keys = Object.keys(this.selection);
          const old = keys.length && getObjectValueByPath(this.selection[keys[0]], this.itemKey);
          old && old !== key && this.$emit('item-selected', { item: this.selection[old], value: false });
        }
        this.selection = selection;
        emit && this.$emit('item-selected', { item, value });
      },
      multipleSelect (value = true, emit = true, selection, index) {
        const start = index < this.lastEntry ? index : this.lastEntry;
        const end = index < this.lastEntry ? this.lastEntry : index;
        for (let i = start; i <= end; i++) {
          const currentItem = this.selectableItems[i];
          const key = getObjectValueByPath(currentItem, this.itemKey);
          if (value) selection[key] = currentItem;
          else delete selection[key];
          emit && this.$emit('item-selected', { currentItem, value });
        }
      },
      scrollToPosition(y) {
        this.$el.scrollTop = y;
        this.scrollTop = this.$el.scrollTop;
        this.updateVisibleRows();
  
      },
      storeScrollPosition(index) {
          if ( index == null ) {
          index = this.currentStart;
          }
        
          if (index < 0 || index >= this.items.length) {
              throw new Error('Invalid index.');
          }
          return new StoredScrollPosition(this.items[index], this.getItemPosition(index) - this.scrollTop);
      },
      restoreScrollPosition(position) {
          if (!(position instanceof StoredScrollPosition)) {
              throw new Error('Invalid position.');
          }
          const index = this.items.indexOf(position.item);
          if (index === -1) {
              return;
          }
          let y = this.getItemPosition(index) - position.offset;
          const maxY = Math.max(0, this.scrollHeight - this.clientHeight());
          y < 0 && (y = 0);
          y > maxY && (y = maxY);
          if (this.scrollTop === y) {
              return;
          }
          this.scrollToPosition(y);
          this.$nextTick(() => {
              this.restoreScrollPosition(position);
          });
      },
      scrollTo(index, position) {
          if (index == null || index < 0 || index >= this.items.length) {
              return;
              //throw new Error('Invalid index.');
          }
          let c_height = this.clientHeight();
          if ( c_height == imsi_height ) {
              c_height = this.getRetryInnerClientHeight();
              if ( c_height === false  ) {
                  if ( this.debug ) console.log("stop scrollTo: clientHeight is not avaiable!", this.getInnerClientHeight());
                  return;
              }
          }
  
          const scrollHeight = this.scrollHeight;
          if ( isNaN(scrollHeight) || scrollHeight <= 0 ) {
              if ( this.debug ) console.log("stop scrollTo: scrollHeight is not avaiable!", scrollHeight);
              return;
          }
  
          position = position || ScrollPositions.default;
          let y = this.getItemPosition(index);
          let height = this.itemHeight != "auto" ? this.__itemHeight :  this.items[index][heightField] || this.__itemHeight;
          
          let isOversize = height > c_height;
          let endY = y + height;
          let scrollToY;
          switch (position) {
              case ScrollPositions.default:
                  if (endY > this.scrollTop + c_height && !isOversize) {
                      scrollToY = Math.max(0, endY - c_height);
                      position = ScrollPositions.bottom;
                  } else if (y < this.scrollTop || (isOversize && y > this.scrollTop)) {
                      scrollToY = y;
                      position = ScrollPositions.top;
                  }
              break;
              case ScrollPositions.top:
              //case ScrollPositions.topInset:
                  scrollToY = Math.max(0, Math.min(y, scrollHeight - c_height));
              break;
              case ScrollPositions.bottom:
              //case ScrollPositions.bottomInset:
                  scrollToY = Math.max(0, Math.min(endY - c_height, scrollHeight - c_height));
              break;
          }
          if (typeof scrollToY === 'undefined' || scrollToY === this.scrollTop) {
              return;
          }
          this.scrollToPosition(scrollToY);
          this.$nextTick(() => {
              this.scrollTo(index, position);
          });
      },
      scrollToBottom() {
          const scrollHeight = this.scrollHeight;
          if ( isNaN(scrollHeight) || scrollHeight <= 0 ) {
              if ( this.debug ) console.log("stop scrollToBottom: scrollHeight is not avaiable!", scrollHeight);
              return;
          }
          let c_height = this.clientHeight();
          if ( c_height == imsi_height ) {
              c_height = this.getRetryInnerClientHeight();
              if ( c_height === false ) {
                  if ( this.debug ) console.log("stop scrollToBottom: clientHeight is not avaiable!", this.getInnerClientHeight());
                  return;
              }
          }
          
          const bottomPosition = scrollHeight - c_height;
          if ( this.debug ) console.log("scrollToBottom: bottomPosition(", bottomPosition, ") scrollTop(", this.scrollTop, ")");
          if ( this.scrollTop === bottomPosition || scrollHeight < c_height) {
              return;
          }
          this.scrollToPosition(bottomPosition);
  
          this.$nextTick(() => {
              this.scrollToBottom();
          });
          
      },
      invalidateHeightAfter(index) {
          index < 0 && (index = 0);
              
          if (index < this.heightInvalidAfter) {
              this.heightInvalidAfter = index;
          }
      },
      getStartEnd() {
          if (!this.items.length) {
              return {start: 0, end: 0};
          }
  
          if ( this.scrollTop == null || isNaN(this.scrollTop) ) this.scrollTop = 0;
          let y = this.scrollTop - (this.__bench*this.__itemHeight);
          //console.log("getStartEnd 0 =>", y, this.scrollTop, this.__bench);
          y < 0 && (y = 0);
  
          let c_height = this.clientHeight();
          if ( c_height == imsi_height ) {
              c_height = this.getRetryInnerClientHeight();
              if ( c_height === false  ) {
                  if ( this.debug ) console.log("stop getStartEnd: clientHeight is not avaiable!", this.getInnerClientHeight());
                  return;
              }
          }
  
          let endY = this.scrollTop + c_height + (this.__bench*this.__itemHeight);
          if ( this.itemHeight != "auto") {	
              let start = Math.floor(y / this.__itemHeight);
              start < 0 && (start = 0);
              start > this.items.length && (start = this.items.length);
              let end = Math.ceil(endY / this.__itemHeight);
              end > this.items.length && (end = this.items.length);
              return {start, end};
          }
              
          // dynamic/automatic height
          // calculate approx start
          let start = Math.floor(y / c_height);
          start > this.heightInvalidAfter && (start = this.heightInvalidAfter);
          while (start > 0 && (
              this.items[start][accumulatorProp] === undefined ||
              this.items[start][accumulatorProp] > y
          )) {
              start--;
          }
          let accumulator = start === 0 ? 0 : this.items[start][accumulatorProp] || 0;
          while (true) {
              let item = this.items[start];
              let height = item[heightField] || this.__itemHeight;
                  
              item[accumulatorProp] = accumulator;
              accumulator += height;
  
              if (accumulator > y || start >= this.items.length-1) {
                  break;
              }
              start++;
          }
          let end = start;
          while (end < this.items.length-1 && accumulator < endY) {
              let item = this.items[++end];
              let height = item[heightField] || this.__itemHeight;
              item[accumulatorProp] = accumulator;
              accumulator += height;
          }
  
          if (end > this.heightInvalidAfter) {
              this.heightInvalidAfter = end;
          }
          end++;
          return {start: start, end: end};
      },
      updateVisibleRows() {
          let c_height = this.clientHeight();
          if ( this.debug ) {
              console.log("updateVisibleRows ==> this.clientHeight()", this.clientHeight(), "imsi_height", imsi_height);
          }
          
          if ( c_height == imsi_height ) {
              c_height = this.getRetryInnerClientHeight();
              if ( c_height === false  ) {
                  if ( this.debug ) console.log("stop updateVisibleRows: clientHeight is not avaiable!", this.getInnerClientHeight());
                  return;
              }
          }
          const {start, end} = this.getStartEnd();
          let i;
          let rowItem;
          //delete cells at the benning
          let deleteEnd = start < this.currentEnd ? start : this.currentEnd;
              
          for (i = this.currentStart; i < deleteEnd; i++) {
              rowItem = this.visibleRows.shift();
              // cell.prepareForDelete()?
          }
              
          //detele cells at the end
          let deleteStart = end > this.currentStart ? end : this.currentStart;
              
          for (i = deleteStart; i < this.currentEnd; i++) {
              rowItem = this.visibleRows.pop();
              // cell.prepareForDelete()?
          }
              
          //insert from at the beginning
          let insertTo = end < this.currentStart ? end : this.currentStart;
              
          if (insertTo > start) {
              //temporary array for added cells
              let rows = [];
              
              for (i = start; i < insertTo; i++) {
                  rowItem = {index: i, item: this.items[i]};
                  //add cell to temporary array so it's sorted correctly, as we go backwards
                  rows.push(rowItem);
              }
              
              if (this.visibleRows.length) {
                  this.visibleRows.unshift(...rows);
              } else {
                  this.visibleRows = rows;
              }
          }
              
          //insert from at the end
          let insertFrom = start > this.currentEnd ? start : this.currentEnd;
          
          if (insertFrom < end) {
              for (i = insertFrom; i < end; i++) {
                  rowItem = {index: i, item: this.items[i]};
                  this.visibleRows.push(rowItem);
              }
          }
          let changed = this.currentStart !== start || this.currentEnd !== end;
          
          this.currentStart = start;
          this.currentEnd = end;
              
              
          this.updateSizes();
          this.verifyScrollPosition();
          if (changed) {
              if ( this.itemHeight == "auto" ) {
                  this.scheduleUpdateHeights();
              }
              this.$emit('rowsChange', this.visibleRows, this.scrollTop, c_height);
          }
      },
      verifyRows() {
          let decreaseIndexBy = 0;
          let changed = false;
          for (let i = 0; i < this.visibleRows.length; i++) {
              if (decreaseIndexBy) {
                  this.visibleRows[i].index -= decreaseIndexBy;
              }
              if (this.items.indexOf(this.visibleRows[i].item) !== this.visibleRows[i].index) {
                  if (i === 0) {
                      this.invalidateHeightAfter(0);
                  } else {
                      this.invalidateHeightAfter(this.currentStart + i);
                  }
                  this.visibleRows.splice(i, 1);
                  i--;
                  decreaseIndexBy++;
                  changed = true;
              }
          }
          this.currentEnd -= decreaseIndexBy;
          if (this.heightInvalidAfter >= this.items.length) {
              this.invalidateHeightAfter(this.items.length-1);
          }
          if (changed) {
              if ( this.itemHeight == "auto" ) {
                  if ( this.debug ) console.log("verifyRows", this.visibleRows);
                  this.scheduleUpdateHeights();
              }
              this.$emit('rowsChange', this.visibleRows, this.scrollTop, this.clientHeight());
          }
      },
      updateSizes() {
          if ( this.itemHeight != "auto") {	
              this.startHeight = this.currentStart * this.__itemHeight;
              this.endHeight = ((this.items.length - this.currentEnd) * this.__itemHeight);
              this.scrollHeight = (this.items.length * this.__itemHeight);
          } else {
              let startHeight = 0;
              let endHeight = 0;
              let scrollHeight = endHeight + startHeight;
  
              const startItem = this.items[this.currentStart];
              if ( startItem ) {
                    startHeight += startItem[accumulatorProp];
              }
  
              const lastAccumulatedItem = this.items[this.heightInvalidAfter];
              if (lastAccumulatedItem) {
                  let totalHeight = lastAccumulatedItem[accumulatorProp];
                  totalHeight += lastAccumulatedItem[heightField] || this.__itemHeight;
                  totalHeight += (this.items.length - 1 - this.heightInvalidAfter) * this.__itemHeight;
                  let endItem = this.items[this.currentEnd-1];
                  endHeight += totalHeight - endItem[accumulatorProp] - (endItem[heightField] || this.__itemHeight);
                  scrollHeight += totalHeight;
              }
  
              this.startHeight = startHeight;
              this.endHeight = endHeight;
              this.scrollHeight = scrollHeight;
          }
      },
      clientHeight() {
        if ( this.debug ) {
          console.log("clientHeight", this.__clientHeight);
        }
        if ( this.__clientHeight > 0 ) {
          return this.__clientHeight;
        }
        let innerHeight = this.getInnerClientHeight();
        if ( isNaN(innerHeight) || innerHeight <= 0  ) {
          return imsi_height;
        }
        return innerHeight;
      },
      getInnerClientHeight() {
          const domElem = this.$el;
          if ( domElem.parentNode ) {
              const height = domElem.offsetHeight || 0;
              const style = getComputedStyle(domElem);
              const paddingTop = parseInt(style.paddingTop, 10) || 0;
              const paddingBottom = parseInt(style.paddingBottom, 10) || 0;
  
              const newHeight = height - paddingTop - paddingBottom;
              if ( this.debug ) {
                  console.log("getInnerClientHeight", domElem, newHeight);
              }
              return newHeight;
          }
          return NaN;
      },
      getRetryInnerClientHeight() {
          let c_height = this.getInnerClientHeight();
          if ( isNaN(c_height) || c_height <= 0 ) {
              return false;
          }
          return c_height;
          //return Math.max(c_height, this.__bench * this.__itemHeight);
      },
      isAtTop() {
          return this.scrollTop < this.threshold;
      },
      isAtBottom() {
          let c_height = this.clientHeight();
          if ( c_height == imsi_height ) {
              return false;
          }
          return this.scrollHeight - c_height - this.scrollTop < this.threshold;
      },
      isScrollable() {
          if ( this.$el ) {
              return this.$el.clientHeight != this.$el.scrollHeight;
          }
          return false;
      },
      getVisibleRecords() {
          const vRows = this.visibleRows;
          if ( vRows && vRows.length ) {
              let startOffset = this.scrollTop - Math.floor(this.__itemHeight/2) - this.threshold;
              let endOffset = this.scrollTop + this.clientHeight() + Math.floor(this.__itemHeight/2);
              
              let viewRecords = [];
              //console.log("getVisibleRecords", vRows, startOffset, endOffset);
              vRows.forEach(r => {
                  //console.log("loop getVisibleRecords", vRows, r.item.offset, r.item.offset + r.item.height, 
                  //	startOffset <= r.item.offset && endOffset > (r.item.offset + r.item.height));
                  if ( startOffset <= r.item.offset && endOffset > (r.item.offset + r.item.height) ) {
                      viewRecords.push(r);
                  }
              });
              return viewRecords;
          }
          return [];
      },
      verifyScrollPosition() {
          if (this.isAtTop()) {
              this.$emit('scrollToTop');
          }
          if (this.isAtBottom()) {
              this.$emit('scrollToBottom');
          }
      },
      scheduleUpdateHeights() {
          const counter = ++this.heightUpdateCounter;
          this.$nextTick(() => {
              // only update heights once after render, to avoid conflicts
              if ( this.debug ) console.log("scheduleUpdateHeights==> counter", counter, this.heightUpdateCounter)
              if ( counter === this.heightUpdateCounter ) {
                  if ( this.debug ) console.log("EXEC updateHeights");
                  this.updateHeights();
              }
          });
      },
      updateHeights() {
          //this._height = this.$el.clientHeight;
          let changed = false;
          const children_el = this.$el.querySelectorAll(".br-virtual-scroll__item");
          /*
          if ( children_el.length != this.visibleRows.length ) {
              if ( this.debug ) console.log("retry updateHeights", children_el.length, this.visibleRows.length);
              setTimeout(() => {
                  this.updateHeights();
              }, 100);
              return;
          }
          */
          const head_el = this.$el.querySelector(".br-virtual-head");
          if ( head_el ) {
			      let height = head_el.clientHeight;
			      let style = getComputedStyle(head_el);
          	height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
			      this.headHeight = height;
			      //console.log("this.headHeight", this.headHeight);
		      }

          for (let i = this.visibleRows.length-1; i >= 0; i--) {
              let row = this.visibleRows[i];
              let el = children_el[i];
              let height = el.clientHeight;
          
              if ( el.children && el.children[0] ) {
                    let style = getComputedStyle(el.children[0]);
                    height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
              }
              if ( this.debug ) {
                  console.log("updateHeights", i, height, "saved", row.item[heightField], el);
              }
              if (row.item[heightField] === height) {
                  continue;
              }
  
              row.item[heightField] = height;
              changed = true;
              this.invalidateHeightAfter(this.currentStart + i);
          }
  
          
          
          if (changed) {
              if ( this.debug ) console.log("updateHeights changed", this.visibleRows);
              this.updateVisibleRows();
          }
  
          
  
      },
      getItemPosition(index) {
          if (index < 0 || index >= this.items.length) {
              throw new Error('Invalid index.');
          }
          if (this.itemHeight != "auto") {
              return index * this.__itemHeight;
          } else {
              let lastCalculatedIndex = Math.min(index, this.heightInvalidAfter);
              return (this.items[lastCalculatedIndex][accumulatorProp] || 0) + ((index - lastCalculatedIndex) * this.__itemHeight);
          }
      },
      onScroll (event) {
          this.scrollTop = this.$el.scrollTop;
          if ( this.debug) console.log("onScroll!!", this.scrollTop);
          this.$emit('scroll', event);
          this.updateVisibleRows();
      },
      onResize() {
          setTimeout(() => {
              if ( this.debug ) console.log("onResize!!");
              let c_height = this.getRetryInnerClientHeight();
              if ( this.debug ) console.log("resize => c_height", c_height);
              this.__clientHeight = c_height;
              this.updateVisibleRows();
              this.__clientHeight = null;
          }, 100);
      },
    }
  };
  
  
  </script>

<style lang="scss">
.br-virtual-scroll.br-comp {
  display: block;
  flex: 1 1 auto;
  height: 100%;
  max-width: 100%;
  overflow: auto;
  position: relative;

  &__container {
    display: block;
  }
  &__item {
    left: 0;
    //position: absolute;
    right: 0;
  }

  .br-virtual-head {
		left: 0;
        position: sticky;
    	right: 0;
		top: 0;
		z-index: 2;
  }

  .br-virtual-scroll__item {
      left: 0;
      position: relative;
      right: 0;
  }
}
</style>