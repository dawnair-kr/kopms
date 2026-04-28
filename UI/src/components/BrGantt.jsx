import {
    defineComponent,
    shallowRef,
    toRefs,
    watch,
    computed,
    inject,
    onMounted,
    onBeforeUnmount,
    nextTick,
    watchEffect,
    getCurrentInstance,
    unref,
    ref,
} from 'vue';
import './ganttStyle.scss';
import { stateFromConfig, ganttApi, chartInit, BrGanttId, isBrGanttId, BrGanttSourceId, fromArray } from './BrGanttApi.jsx';
import dayjs from 'dayjs';
import { Resize } from 'vuetify/directives';
import State from 'deep-state-observer';
import List from './BrGantt/List.jsx';
import Chart from './BrGantt/Chart.jsx';

import { Plugin as TimelinePointer } from './BrGantt/TimelinePointer.js';
import { Plugin as Selection } from './BrGantt/Selection.jsx';
import { Plugin as CalendarScroll } from './BrGantt/CalendarScroll.js';
import { Plugin as DependencyLines } from './BrGantt/DependencyLines.jsx';
import { Plugin as ItemMovement } from './BrGantt/ItemMovement.js';
import { Plugin as ItemResizing } from './BrGantt/ItemResizing.jsx';
import { Plugin as HighlightWeekends } from './BrGantt/HighlightWeekends.js';
import { Plugin as ItemTypes } from './BrGantt/ItemTypes.jsx';
import { Plugin as TimeBookmarks } from './BrGantt/TimeBookmarks.jsx';
import { Plugin as ProgressBar } from './BrGantt/ProgressBar.jsx';


export default defineComponent({
    name: "br-gantt",
    directives: { Resize },
    props: {
        /*
        option: Object,
        theme: {
          type: [Object, String],
        },
        initOptions: Object,
        updateOptions: Object,
        group: String,
        manualUpdate: Boolean,
        autoresize: [Boolean, Object],
        loading: Boolean,
        loadingOptions: Object,
        */
    },
    emits: {},
    inheritAttrs: false,
    setup(props, { attrs }) {
        
      const iterations = 100;
      
      const colors = ['#E74C3C', '#DA3C78', '#7E349D', '#0077C0', '#07ABA0', '#0EAC51', '#F1892D'];

      function getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
      }

      const itemTypes = ['project', 'milestone', 'task'];

      function getRandomItemType() {
        return itemTypes[Math.floor(Math.random() * itemTypes.length)];
      }


      const rows = {};
      for (let i = 0; i < iterations; i++) {
        const withParent = i > 0 && i % 2 === 0;
        const id = BrGanttId(i);
        rows[id] = {
          id,
          label: `Row ${i}`,
          parentId: withParent ? BrGanttId(String(i - 1)) : undefined,
          expanded: false,
        };
      }

      rows[BrGanttId('11')].label = 'NESTED TREE HERE';
      rows[BrGanttId('12')].parentId = BrGanttId('11');
      rows[BrGanttId('13')].parentId = BrGanttId('12');
      rows[BrGanttId('14')].parentId = BrGanttId('13');

      const startDate = dayjs().subtract(2, 'month').valueOf();

      const bookmarks = {
        '1-st': {
          time: dayjs(startDate).add(2, 'day').startOf('day').valueOf(),
          color: '#3498DB',
          label: '1-st',
        },
      };
      
      for (let i = 1; i < 10; i++) {
        const id = `bookmark-${i}`;
        const time = dayjs(startDate)
          .add(i * 4, 'day')
          .startOf('day');
        bookmarks[id] = {
          time: time.valueOf(),
          label: `Bookmark ${time.format('YYYY-MM-DD')}`,
        };
      }

      const items = {};
      for (let i = 0; i < iterations; i++) {
        const si = String(i);
        let rowId = BrGanttId(si);
        let id = BrGanttId(si);
        let startDayjs = dayjs(startDate)
          .startOf('day')
          .add(Math.floor(Math.random() * 30), 'days');

        const type = getRandomItemType();
        items[id] = {
          id,
          label: type + ' id ' + BrGanttSourceId(id),
          progress: Math.round(Math.random() * 100),
          type,
          fill: getRandomColor(),
          time: {
            start: startDayjs.startOf('day').valueOf(),
            end: startDayjs
              .clone()
              .add(Math.floor(Math.random() * 20) + 4, 'days')
              .endOf('day')
              .valueOf(),
          },
          classNames: ['my-custom-item-class'],
          rowId,
        };
      }

      items[BrGanttId('0')].linkedWith = [BrGanttId('1')];
      items[BrGanttId('0')].label = 'Task 0 linked with 1 (clone)';
      items[BrGanttId('0')].type = 'task';
      items[BrGanttId('0')].fill = colors[0];
      items[BrGanttId('1')].fill = colors[0];
      items[BrGanttId('1')].label = 'Task 1 linked with 0 (clone)';
      items[BrGanttId('1')].type = 'task';
      items[BrGanttId('1')].time = { ...items[BrGanttId('0')].time };

      items[BrGanttId('3')].dependant = [BrGanttId('5')];
      items[BrGanttId('3')].time.start = dayjs(startDate).add(2, 'day').startOf('day').add(5, 'day').valueOf();
      items[BrGanttId('3')].time.end = dayjs(items[BrGanttId('3')].time.start).endOf('day').add(2, 'day').valueOf();

      items[BrGanttId('5')].time.start = dayjs(items[BrGanttId('3')].time.end).startOf('day').add(5, 'day').valueOf();
      items[BrGanttId('5')].time.end = dayjs(items[BrGanttId('5')].time.start).endOf('day').add(2, 'day').valueOf();
      items[BrGanttId('5')].dependant = [BrGanttId('7'), BrGanttId('9')];

      items[BrGanttId('7')].time.start = dayjs(items[BrGanttId('5')].time.end).startOf('day').add(3, 'day').valueOf();
      items[BrGanttId('7')].time.end = dayjs(items[BrGanttId('7')].time.start).endOf('day').add(2, 'day').valueOf();
      items[BrGanttId('9')].time.start = dayjs(items[BrGanttId('5')].time.end).startOf('day').add(2, 'day').valueOf();
      items[BrGanttId('9')].time.end = dayjs(items[BrGanttId('9')].time.start).endOf('day').add(3, 'day').valueOf();

      const columns = {
        data: {
          [BrGanttId('id')]: {
            id: BrGanttId('id'),
            data: ({ row }) => BrGanttSourceId(row.id),
            width: 80,
            sortable: ({ row }) => Number(BrGanttSourceId(row.id)),
            header: {
              content: 'ID',
            },
            resizer: false,
          },
          [BrGanttId('label')]: {
            id: BrGanttId('label'),
            data: 'label',
            sortable: 'label',
            expander: true,
            isHTML: false,
            width: 230,
            header: {
              content: 'Label',
            },
          },
        },
      };

      const config = {
        innerHeight: 500,
        plugins: [
          HighlightWeekends(),
          TimelinePointer(),
          Selection(),
          ItemResizing({
            snapToTime: {
              start({ startTime }) {
                return startTime;
              },
              end({ endTime }) {
                return endTime;
              },
            },
          }),
          ItemMovement({
            snapToTime: {
              start({ startTime }) {
                return startTime;
              },
              end({ endTime }) {
                return endTime;
              },
            },
            autoScroll: {
              speed: {
                horizontal: 1,
                vertical: 1,
              },
            },
          }),
          CalendarScroll(),
          //ProgressBar(),
          TimeBookmarks({
            bookmarks,
          }),
          DependencyLines(),
          ItemTypes(),
        ],
        list: {
          rows,
          columns,
        },
        chart: {
          items,
          spacing: 0,
        },
        scroll: {
          horizontal: {
            precise: true,
          },
          vertical: {
            precise: true,
          },
        },
        slots: {
          // item content slot that will show circle with letter next to item label
          'br-chart-timeline-items-row-item': {
            content: [
              (props) => {
                //const { onChange, html } = vido;
                /*
                onChange((newProps) => {
                  if (newProps && newProps.item) {
                    props = newProps;
                    letter = props.item.label.charAt(0).toUpperCase();
                  }
                });
                */
                return (data = {}, contentVNode) => {
                  const { itemInfo } = data;
                  if (!itemInfo || !itemInfo.item) return contentVNode;
                  const item = itemInfo.item;
                  let letter = item.label.charAt(0).toUpperCase();
                
                  return (<>
                        <div
                          class="item-img"
                          style={`width:24px;height:24px;background:${item.imgColor};border-radius:100%;text-align:center;line-height:24px;font-weight:bold;margin-right:10px;`}
                        >
                          {letter}
                        </div>
                        {contentVNode}
                        {item.progress != null ? " progress: " + item.progress + "%" : null}
                      </>
                    );
                };
              },
            ],
          },
        },
      };

      let state = new State(stateFromConfig(config));
      const gapi = new ganttApi(state, null);

      gapi.initializePlugins();

      chartInit(gapi);


      let unsubscribes = [];

      return {
          state,
          gapi,
          unsubscribes
      };
    },

    methods: {
        onResize() {
            
            console.log("resize", this.$el.offsetWidth, this.$el.offsetHeight);
            //this.state.update("config.initialWidth", this.$el.offsetWidth);
            this.state.update("config.innerHeight", this.$el.offsetHeight - this.state.get("config.headerHeight"));
            this.state.update("$data.dimensions.height", this.$el.offsetHeight);
            this.state.update("$data.dimensions.width", this.$el.offsetWidth);
            //this.state.update("$data.dimensionsParent.height", this.$el.offsetHeight);
            //this.state.update("$data.dimensionsParent.width", this.$el.offsetWidth);
            console.log("state", this.state);
            //this.gapi.heightChange();
            //this.listRender();
            //this.gapi.scrollToTime(this.gapi.time.date().valueOf());
            
        },
        onWheel(e) {
            let deltaX = e.deltaX || 0,
                deltaY = e.deltaY || 0,
                deltaZ = e.deltaZ || 0;

            const deltaMode = e.deltaMode,
                rowHeight = this.state.get("config.list.rowHeight");

            let inc = 1;
            switch (deltaMode) {
                case 1:
                    rowHeight && (inc = rowHeight);
                    break;
                case 2:
                    inc = window.height
            }

            deltaX *= inc;
            deltaY *= inc;
            deltaZ *= inc;
            /*
            console.log({
                x: deltaX,
                y: deltaY,
                z: deltaZ,
                event: e
            });
            */
            e.stopPropagation();
            e.preventDefault();
           if ( deltaY != 0 ) {
                const scrollTop = this.gapi.getScrollTop();
                if ( this.state.get("config.scroll.vertical.byPixels") ) {
                    this.gapi.setScrollTop(scrollTop.absolutePosPx + deltaY);
                } else {
                    const { dataIndex, row, rowData } = this.gapi.getRowInfoFromTop(scrollTop.absolutePosPx + deltaY);
                    this.gapi.setScrollTop(dataIndex, scrollTop.preciseOffset);
                }
           }
        },
        listRender() {
            
            /*
            this.gapi.unsubscribes.push((() => {
                w();
                console.log("1111", this.state);
            }));
            */

        },
        chartRender() {
            let d = [];
            d.push(o.subscribe("config.components.ChartCalendar", (t => h = t)));
            d.push(o.subscribe("config.components.ChartTimeline", (t => u = t)));
            d.push(o.subscribe("config.components.ScrollBar", (t => m = t)));
            
        },
        chartCalendarRender() {
            const style = {
                height: "",
                "--headerHeight": "",
                "margin-left": ""
            };
            let g;

            this.gapi.unsubscribes.push(this.state.subscribe("config.headerHeight", (t => {
                g = t;
                style.height = g + "px";
                style["--calendar-height"] = g + "px";
            })));

            let w = [],
                len = 0;
            this.gapi.unsubscribes.push(this.state.subscribe("$data.chart.time.levels", ((t, e) => {
                const levels = this.state.get("$data.chart.time.levels");
                let levelIndex = 0;
                /*
                if (levels.length !== len) {
                    len = levels.length;
                    //w.forEach((t => t.forEach((t => t.destroy()))));
                    //w = [];
                    for (let i = 0; i < len; i++) {
                        w.push([]);
                    }
                }
                */

                for (const level of levels) {
                    if (!level.length) continue;
                    let fmt = "YYYY-MM-DD HH";
                    switch (level[0].period) {
                        case "day":
                            fmt = "YYYY-MM-DD";
                            break;
                        case "week":
                            fmt = "YYYY-MM-ww";
                            break;
                        case "month":
                            fmt = "YYYY-MM";
                            break;
                        case "year":
                            fmt = "YYYY"
                    }
                    const dt = this.gapi.time.date().format(fmt);
                    /*
                    l(w[levelIndex], level, (t => t && {
                        level: levelIndex,
                        date: t,
                        currentDate: dt,
                        currentDateFormat: fmt
                    }), m, !0); 
                    
                    console.log(levelIndex, {
                        level: levelIndex,
                        date: t[levelIndex][0],
                        currentDate: dt,
                        currentDateFormat: fmt
                    })
                    */
                    w[levelIndex] = this.chartCalendarDateRender({
                        level: levelIndex,
                        date: level[0],
                        currentDate: dt,
                        currentDateFormat: fmt
                    });
                    console.log("levelIndex", levelIndex, w[levelIndex]);
                    levelIndex++;
                }
                //n()
                //this.$forceUpdate();
            })));

            /*
            i((() => {
                w.forEach((t => t.forEach((t => t.destroy()))))
            }));

            h.push((t => {
                o.update("$data.elements.chart-calendar", t)
            }));
            */
           console.log("W", w, w.length);

           const className = "chart-calendar";

           return (
            <div class={className} style={style}>
                {w.map((e, a) => (
                        <div class={className+"-dates "+ className +`-dates--level-${a}`}>
                            {e}
                        </div>
                    ))}
            </div>
           );
        },
        chartCalendarDateRender({ level, date, currentDate, currentDateFormat, classNames }) {
            if ( !date) return;
            const t = this.state.get(`config.chart.calendarLevels.${level}`);
            const style = {};
            const className = "chart-calendar-date";
            let classStr = "", f;

            this.gapi.unsubscribes.push(this.state.subscribe("config.chart.time", (t => f = t)));

            style.width = date.currentView.width + "px";
            style.left = date.currentView.leftPx + "px";

            const a = t.find((t => +f.zoom <= +t.zoomTo));
            let tmpClass = date.current ? " gstc-current" : date.next ? " gstc-next" : date.previous ? " gstc-previous" : "";
            classStr = className + "-content " + className + `-content--${date.period}` + tmpClass; 

            a.classNames && Array.isArray(a.classNames) ? (classStr += " " + a.classNames.join(" ")) : "";

            console.log("ssss", a, classStr);
            return (
                <div
                    class={classStr}
                    data-gstcid={date.id}
                    style={style}
                    
              >
                <div>{date.formatted}</div>
              </div>
            );
        }
    },

    render() {
        //{this.chartCalendarRender()}
        return (
            <div v-resize={this.onResize} ref="gantt" class={"br-gantt"} onWheel={this.onWheel}>
                <List state={this.state} gapi={this.gapi}></List>
                <Chart state={this.state} gapi={this.gapi} />
            </div>
        );
    }
});