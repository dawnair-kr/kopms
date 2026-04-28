import lodash from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);


/*
    time API
*/
export class timeApi {
    constructor(state, gantt) {
        this.utcMode = false;
        this.unsubs = [];
        this.currentDateLastCheck = 0;
        this.state = state;
        this.gantt = gantt;
        /*
        this.unsubs.push(o.subscribe("config.utcMode", (t => {
            this.utcMode = t
        }))), this.unsubs.push(o.subscribe("config.locale", (t => {
            if (!t.name) throw new Error("Locale must have a name property.");
            this.locale = t, this.dayjs.locale(this.locale, null, !0)
        })))
        */
    }
    destroy() {
        for (const t of this.unsubs) t();
    }
    date(time) {
        //return this.utcMode ? t.utc(e).locale(this.locale.name) : e ? t(e).locale(this.locale.name) : t().locale(this.locale.name)
        return dayjs(time);
    }
    recalculateTime() {
        this.gantt.recalculateTimes([{
            name: "all"
        }]);
    }
    recalculateFromTo(dataChartTime, force = false) {
        const period = dataChartTime.period;

        dataChartTime = Object.assign({}, dataChartTime);
        dataChartTime.from = +dataChartTime.from;
        dataChartTime.to = +dataChartTime.to;
        dataChartTime.fromDate = dayjs(dataChartTime.from).startOf(period);
        dataChartTime.from = dataChartTime.fromDate.valueOf();
        dataChartTime.toDate = dayjs(dataChartTime.to).endOf(period);
        dataChartTime.to = dataChartTime.toDate.valueOf();

        if ( !dataChartTime.autoExpandTimeFromItems || dataChartTime.calculatedZoomMode ) {
            return dataChartTime;
        }
           
        let maxInt = Number.MAX_SAFE_INTEGER,
            minInt = 0;
        const items = this.state.get("config.chart.items");
        if (Object.keys(items).length > 0 && (0 === dataChartTime.from || 0 === dataChartTime.to || force)) {
            for (const idx in items) {
                const task = items[idx];
                if ( task.time.start < maxInt && task.time.start ) {
                    maxInt = task.time.start;
                }
                if ( task.time.end > minInt ) {
                    minInt = task.time.end;
                }
            }
            if ( maxInt < dataChartTime.from ) {
                dataChartTime.fromDate = this.date(maxInt).startOf(period);
                dataChartTime.from = dataChartTime.fromDate.valueOf();
            }
            if ( minInt > dataChartTime.to ) {
                dataChartTime.toDate = this.date(minInt).endOf(period);
                dataChartTime.to = dataChartTime.toDate.valueOf();
            }
        }
        return dataChartTime;
    }
    getCenter(dataChartTime) {
        return dataChartTime.leftGlobal + Math.round((dataChartTime.rightGlobal - dataChartTime.leftGlobal) / 2);
    }
    isInCurrentView(date, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        const dtNum = date.valueOf();
        return !(dtNum < dataChartTime.leftGlobal || dtNum > dataChartTime.rightGlobal);
    }
    recalculateDatesWidths(dataChartTimeLevelDateArr, dataChartTime) {

        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        if (!dataChartTime.timePerPixel) {
            throw new Error("[gantt-schedule-timeline-calendar] No timePerPixel");
        }
        for (const dataChartTimeLevelDate of dataChartTimeLevelDateArr) {
            if (!dataChartTimeLevelDate.leftGlobal || !dataChartTimeLevelDate.rightGlobal) {
                throw new Error("[gantt-schedule-timeline-calendar] No date leftGlobal or rightGlobal.");
            }
            dataChartTimeLevelDate.width = (dataChartTimeLevelDate.rightGlobal + 1 - dataChartTimeLevelDate.leftGlobal) / dataChartTime.timePerPixel;
        }
        return dataChartTimeLevelDateArr;
    }
    recalculateDatesPositions(dataChartTimeLevelDateArr, dataChartTime, relativeToTime = true, cloneDates = false) {

        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        let pos = 0;
        if (relativeToTime) {
            for (const dataChartTimeLevelDate of dataChartTimeLevelDateArr) {
                if (dataChartTimeLevelDate.leftGlobal >= dataChartTime.leftGlobal) break;
                if (isNaN(dataChartTimeLevelDate.width)) {
                    throw new Error("[gantt-schedule-timeline-calendar] NaN date width.");
                }
                pos -= dataChartTimeLevelDate.width;
            }
        }

        for (let dataChartTimeLevelDate of dataChartTimeLevelDateArr) {
            if ( cloneDates ) {
                dataChartTimeLevelDate = lodash.clone(dataChartTimeLevelDate);
            }
            dataChartTimeLevelDate.leftPx = pos;
            dataChartTimeLevelDate.rightPx = pos + dataChartTimeLevelDate.width;
            if ( isNaN(dataChartTimeLevelDate.leftPx) || isNaN(dataChartTimeLevelDate.rightPx) ) {
                throw new Error("[gantt-schedule-timeline-calendar] Date leftPx or rightPx is a NaN.");
            }
            if ( dataChartTimeLevelDate.currentView ) {
                dataChartTimeLevelDate.currentView.leftPx = dataChartTimeLevelDate.leftPx - dataChartTime.leftPx;
                dataChartTimeLevelDate.currentView.rightPx = dataChartTimeLevelDate.rightPx - dataChartTime.leftPx;
                dataChartTimeLevelDate.currentView.width = dataChartTimeLevelDate.currentView.rightPx - dataChartTimeLevelDate.currentView.leftPx;
            }
            pos += dataChartTimeLevelDate.width;
        }
        return dataChartTimeLevelDateArr;
    }
    setDatesCacheLevel(levelIndex, dataChartTimeLevelDateArr, dataChartTime) {
        if (!dataChartTimeLevelDateArr.length) return;

        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        if ( !dataChartTime.datesCache ) {
            dataChartTime.datesCache = {
                timePerPixel: 0,
                levels: []
            };
        }
        dataChartTime.datesCache.timePerPixel = dataChartTime.timePerPixel;
        if ( !dataChartTime.datesCache.levels[levelIndex] ) {
            dataChartTime.datesCache.levels[levelIndex] = {
                leftTime: 0,
                rightTime: 0,
                dates: []
            };
        }
        const dataChartTimeLevelDate = dataChartTime.datesCache.levels[levelIndex];
        dataChartTimeLevelDate.leftTime = dataChartTimeLevelDateArr[0].leftGlobal;
        dataChartTimeLevelDate.rightTime = dataChartTimeLevelDateArr[dataChartTimeLevelDateArr.length - 1].rightGlobal;
        dataChartTimeLevelDate.dates = [...dataChartTimeLevelDateArr];
    }
    addDatesToCacheLevel(levelIndex, dataChartTimeLevelDateArr, dataChartTime) {
        if (!dataChartTimeLevelDateArr.length) return;

        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        if (!dataChartTime.datesCache) return;
        if (dataChartTime.datesCache.timePerPixel !== dataChartTime.timePerPixel) return dataChartTimeLevelDateArr;

        const firstDataChartTimeLevelDate = dataChartTimeLevelDateArr[0],
            lastDataChartTimeLevelDate = dataChartTimeLevelDateArr[dataChartTimeLevelDateArr.length - 1],
            dataChartTimeLevelDate = dataChartTime.datesCache.levels[levelIndex];

        if (!dataChartTimeLevelDate) return dataChartTimeLevelDateArr;
        if (dataChartTimeLevelDate.leftTime <= firstDataChartTimeLevelDate.leftGlobal && 
            dataChartTimeLevelDate.rightTime >= lastDataChartTimeLevelDate.rightGlobal
            ) return dataChartTimeLevelDate.dates;

        if (dataChartTimeLevelDate.dates.length >= 1e6) throw new Error("[gantt-schedule-timeline-calendar] To many dates.");

        const dates = [];
        if (firstDataChartTimeLevelDate.leftGlobal < dataChartTimeLevelDate.leftTime) {
            for (const levelDate of dataChartTimeLevelDateArr) {
                if (!(levelDate.leftGlobal < dataChartTimeLevelDate.leftTime)) break;
                dates.push(levelDate);
            }
            dataChartTimeLevelDate.leftTime = dates[0].leftGlobal;
        }
        for (const levelDate of dataChartTimeLevelDate.dates) dates.push(levelDate);

        if (lastDataChartTimeLevelDate.rightGlobal > dataChartTimeLevelDate.rightTime) {
            for (const levelDate of dataChartTimeLevelDateArr) {
                if ( levelDate.rightGlobal > dataChartTimeLevelDate.rightTime ) {
                    dates.push(levelDate);
                }
            }
            dataChartTimeLevelDate.rightTime = dates[dates.length - 1].rightGlobal;
        }
        dataChartTimeLevelDate.dates = dates;
        return dataChartTimeLevelDate.dates;
    }
    isLevelDateInCache(levelIndex, dateTime, dataChartTime) {

        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        if (!dataChartTime.datesCache) return false;

        if (dataChartTime.datesCache.timePerPixel !== dataChartTime.timePerPixel) return false;
        const levelDate = dataChartTime.datesCache.levels[levelIndex];

        return !(!levelDate || !levelDate.dates.length) && (dateTime >= levelDate.leftTime && dateTime <= levelDate.rightTime);
    }
    getLevelDatesFromCache(levelIndex, leftTime, rigthTime, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        
        if (dataChartTime.datesCache.timePerPixel !== dataChartTime.timePerPixel) return [];
        const levelDate = dataChartTime.datesCache.levels[levelIndex];
        if (!levelDate) return [];
        if (!(leftTime >= levelDate.leftTime && rigthTime <= levelDate.rightTime)) return [];

        let r_len = 0,
            cur = 0,
            isInc = false;
        const len = levelDate.dates.length;
        for (; cur < len; cur++) {
            const l_dts = levelDate.dates[cur];
            if ( l_dts.rightGlobal >= leftTime ) {
                isInc = true;
            }
            if (l_dts.rightGlobal >= rigthTime) break;
            if ( isInc ) {
                r_len++;
            }
        }
        return {
            [Symbol.iterator]() {
                let tmpLen = r_len;
                return {
                    next: () => tmpLen <= cur ? {
                        value: levelDate.dates[tmpLen++],
                        done: false
                    } : (tmpLen = r_len, {
                        done: true
                    })
                }
            },
            length: cur - r_len + 1
        }
    }
    getLevelDateFromCache(levelIndex, dateTime, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (!this.isLevelDateInCache(levelIndex, dateTime, dataChartTime)) return null;
        for (const time of dataChartTime.datesCache.levels[levelIndex].dates)
            if (time.rightGlobal >= dateTime) return time;
        return null;
    }
    getAllLevelDatesFromCache(levelIndex, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        return dataChartTime.datesCache.levels[levelIndex].dates;
    }
    findOrCreateMainDateAtTime(dateTime, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (this.isLevelDateInCache(dataChartTime.level, dateTime, dataChartTime)) {
            return this.getLevelDateFromCache(dataChartTime.level, dateTime, dataChartTime);
        }
        let dates = [];
        if ( dataChartTime.datesCache.levels[dataChartTime.level] ) {
            dates = dataChartTime.datesCache.levels[dataChartTime.level].dates;
        }
        dates = this.addMissingDates(dates, dateTime, dataChartTime);
        for (const dts of dates)
            if (dts.rightGlobal >= dateTime) return dts;
        return null;
    }
    addMissingDates(dataChartTimeLevelDateArr, dt, dataChartTime, cloneDates) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        cloneDates = cloneDates == null ? cloneDates = true : cloneDates;

        if (!dataChartTimeLevelDateArr.length) return [];

        const start = dataChartTimeLevelDateArr[0],
              end = dataChartTimeLevelDateArr[dataChartTimeLevelDateArr.length - 1];

        if (!(dt.valueOf() < start.leftGlobal || dt.valueOf() > end.rightGlobal)) {
            return dataChartTimeLevelDateArr;
        } 
        if (this.isLevelDateInCache(dataChartTime.level, dt.valueOf(), dataChartTime)) {
            return this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
        }
        const timeLen = dataChartTimeLevelDateArr.length;
        let oTimes = dataChartTimeLevelDateArr;
        if (cloneDates) {
            oTimes = new Array(timeLen);
            for (let i = 0; i < timeLen; i++) {
                oTimes[i] = lodash.cloneDeep(dataChartTimeLevelDateArr[i]);
            }
        }

        const timeLevel = this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
            calendarLevelFormat = this.getCurrentFormatForLevel(timeLevel, dataChartTime);

        let dec = 1;
        if ( "number" == typeof calendarLevelFormat.periodIncrement ) {
            dec = calendarLevelFormat.periodIncrement;
        }
        if (dt.valueOf() < start.leftGlobal) {
            if ("function" == typeof calendarLevelFormat.periodIncrement) return dataChartTimeLevelDateArr;
            const sdt = start.leftGlobalDate.subtract(1, "ms");
            let edt = start.leftGlobalDate.subtract(dec, dataChartTime.period).startOf(dataChartTime.period);
            for (; dt.valueOf() < edt.valueOf();) {
                edt = edt.subtract(dec, dataChartTime.period).startOf(dataChartTime.period);
            }
            let tmpDates = [];
            do {
                tmpDates = this.generatePeriodDates({
                    leftDate: edt,
                    rightDate: sdt,
                    period: dataChartTime.period,
                    level: this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
                    levelIndex: dataChartTime.level,
                    callOnDate: true,
                    callOnLevelDates: true,
                    time: dataChartTime
                });
                edt = edt.subtract(1, dataChartTime.period);
            } while (!tmpDates.length || tmpDates[0].leftGlobal > dt.valueOf());

            tmpDates = tmpDates.filter((t => !oTimes.find((e => e.leftGlobal === t.leftGlobal))));
            dataChartTimeLevelDateArr = [...tmpDates, ...oTimes];
            dataChartTimeLevelDateArr = this.recalculateDatesWidths(dataChartTimeLevelDateArr, dataChartTime);
            dataChartTimeLevelDateArr = this.recalculateDatesPositions(dataChartTimeLevelDateArr, dataChartTime, true, cloneDates);
            
            return this.addDatesToCacheLevel(dataChartTime.level, dataChartTimeLevelDateArr, dataChartTime);
        }

        if (dt.valueOf() > end.rightGlobal) {
            let edt = end.rightGlobalDate.add(dec, dataChartTime.period).endOf(dataChartTime.period);
            for (; dt.valueOf() > edt.valueOf();) {
                edt = edt.add(dec, dataChartTime.period).endOf(dataChartTime.period);
            }
            let tmpDates = this.generatePeriodDates({
                leftDate: end.rightGlobalDate.add(1, "ms"),
                rightDate: edt,
                period: dataChartTime.period,
                level: this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
                levelIndex: dataChartTime.level,
                callOnDate: true,
                callOnLevelDates: true,
                time: dataChartTime
            });
            tmpDates = tmpDates.filter((t => !oTimes.find((e => e.leftGlobal === t.leftGlobal))));
            dataChartTimeLevelDateArr = [...oTimes, ...tmpDates];
            dataChartTimeLevelDateArr = this.recalculateDatesWidths(dataChartTimeLevelDateArr, dataChartTime);
            dataChartTimeLevelDateArr = this.recalculateDatesPositions(dataChartTimeLevelDateArr, dataChartTime, !0, cloneDates);
            return this.addDatesToCacheLevel(dataChartTime.level, dataChartTimeLevelDateArr, dataChartTime);
        }
        return oTimes;
    }
    getGlobalOffsetPxFromDates(date, addMissingDates = true, dataChartTime, dataChartTimeLevelDateArr = null) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        const time = date.valueOf();
        if (!dataChartTime.allDates || 0 === dataChartTime.allDates.length) return -100;
        if ( dataChartTimeLevelDateArr == null ) {
            dataChartTimeLevelDateArr = dataChartTime.allDates[dataChartTime.level];
        }
        if ( addMissingDates ) {
            dataChartTimeLevelDateArr = this.addMissingDates(dataChartTimeLevelDateArr, date, dataChartTime);
        }
        if ( !dataChartTimeLevelDateArr || 0 === dataChartTimeLevelDateArr.length ) return -1;
        let timeLevelDate;
        for (let level = 0, levelLen = dataChartTimeLevelDateArr.length; level < levelLen; level++) {
            const dataChartTimeLevelDate = dataChartTimeLevelDateArr[level];
            if (level <= dataChartTimeLevelDate.rightGlobal + 1) {
                timeLevelDate = dataChartTimeLevelDate;
                break;
            }
        }
        
        return timeLevelDate ? time < timeLevelDate.leftGlobal ? timeLevelDate.leftPx : 
          timeLevelDate.rightPx - (timeLevelDate.rightGlobal - time) / dataChartTime.timePerPixel : 
          time <= dataChartTime.leftGlobal ? 0 : time >= dataChartTime.rightGlobal ? dataChartTime.totalViewDurationPx + 
         (time - dataChartTime.rightGlobal + 1) / dataChartTime.timePerPixel : -1;
    }
    getViewOffsetPxFromDates(dt, limitToView, dataChartTime, dataChartTimeLevelDate, addMissingDates) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        limitToView = limitToView == null ? true : limitToView;
        addMissingDates = addMissingDates == null ? true : addMissingDates;
        dataChartTimeLevelDate = dataChartTimeLevelDate || dataChartTime.allDates[dataChartTime.level];

        if ( addMissingDates ) {
            dataChartTimeLevelDate = this.addMissingDates(dataChartTimeLevelDate, dt, dataChartTime);
        }

        const pos = this.getDatesDiffPx(dataChartTime.leftGlobalDate, dt, dataChartTime, true, dataChartTimeLevelDate);
        return limitToView ? this.limitOffsetPxToView(pos) : pos;
    }
    limitOffsetPxToView(pos, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (pos < 0) return 0;
        if (!dataChartTime.levels.length) return dataChartTime.width;
        const timeRange = dataChartTime.levels[dataChartTime.level];
        if (!timeRange.length) return dataChartTime.width;
        const lastTime = timeRange[timeRange.length - 1];
        return pos > lastTime.currentView.rightPx ? lastTime.currentView.rightPx : pos;
    }
    findDateAtViewOffsetPx(offsetPx, allPeriodDates) {
        return allPeriodDates.find((dts => dts.currentView.rightPx >= offsetPx));
    }
    findDateIndex(time, dates) {
        let index = 0;
        for (const dts of dates) {
            if (dts.rightGlobal >= time) return index;
            index++;
        }
        return -1;
    }
    findDateAtTime(milliseconds, allPeriodDates = null) {
        if (!allPeriodDates) {
            const dataChartTime = this.state.get("$data.chart.time");
            allPeriodDates = dataChartTime.allDates[dataChartTime.level];
        }
        return allPeriodDates.find((dts => dts.rightGlobal >= milliseconds))
    }
    getMainDateFromRelativePosition(fromDate, relativePosPx) {
        const offsetPx = fromDate.leftPx + relativePosPx,
            dataChartTime = this.state.get("$data.chart.time"),
            chartdates = dataChartTime.allDates[dataChartTime.level];
        for (const dt of chartdates)
            if (dt.rightPx > offsetPx) return dt;
    }
    getTimeFromOffsetPx(offsetPx, isViewOffset = true, dataChartTime, dates = null) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        let tmpOffset = offsetPx;
        if ( isViewOffset ) {
            tmpOffset += dataChartTime.leftPx;
        }
        if ( !dates ) {
            dates = dataChartTime.allDates[dataChartTime.level];
        }
        const levelInfo = this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
            levelFmt = this.getCurrentFormatForLevel(levelInfo, dataChartTime);


        let dec = 1;
        if ( "number" == typeof levelFmt.periodIncrement ) {
            dec = levelFmt.periodIncrement;
        }
        if ( tmpOffset < 0 ) {
            if ("function" == typeof levelFmt.periodIncrement) return dataChartTime.from;

            let curDt, firstDt = dataChartTime.fromDate.subtract(dec, dataChartTime.period).startOf(dataChartTime.period),
                offset = 0;
            for (let i = 0; i < 1e3; i++) {
                const dates = this.generatePeriodDates({
                    leftDate: firstDt,
                    rightDate: firstDt.add(dec, dataChartTime.period).subtract(1, "ms"),
                    period: dataChartTime.period,
                    time: dataChartTime,
                    level: this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
                    levelIndex: dataChartTime.level,
                    callOnDate: true,
                    callOnLevelDates: true,
                    expandIfMissing: false
                });
                if ( dates.length ) {
                    curDt = dates[0];
                    offset -= curDt.width;
                }
                if ( offset <= tmpOffset ) {
                    return curDt.leftGlobal + (tmpOffset - offset) * dataChartTime.timePerPixel;
                }
                firstDt = firstDt.subtract(dec, dataChartTime.period).startOf(dataChartTime.period);
            }
        } else if (tmpOffset > dataChartTime.totalViewDurationPx) {
            let curDt, firstDt = dataChartTime.toDate.add(1, dataChartTime.period).startOf(dataChartTime.period),
                offset = dataChartTime.totalViewDurationPx;
            for (let i = 0; i < 1e3; i++) {
                const dates = this.generatePeriodDates({
                    leftDate: firstDt,
                    rightDate: firstDt.add(dec, dataChartTime.period).subtract(1, "ms"),
                    period: dataChartTime.period,
                    time: dataChartTime,
                    level: this.state.get(`config.chart.calendarLevels.${dataChartTime.level}`),
                    levelIndex: dataChartTime.level,
                    callOnDate: true,
                    callOnLevelDates: true,
                    expandIfMissing: false
                });
                if ( dates.length ) {
                    curDt = dates[0];
                    offset += curDt.width;
                }
                if ( offset > tmpOffset ) {
                    return curDt.rightGlobal + 1 - (offset - tmpOffset) * dataChartTime.timePerPixel;
                }
                firstDt = firstDt.add(dec, dataChartTime.period).startOf(dataChartTime.period);
            }
        }
        for (let i = 0, len = dates.length; i < len; i++) {
            const dt = dates[i];
            if (dt.rightPx > tmpOffset) {
                const offset = (dt.rightPx - tmpOffset) * dataChartTime.timePerPixel;
                return dt.rightGlobal + 1 - offset;
            }
        }
        const lastDt = dates[dates.length - 1];
        return lastDt.rightGlobal + 1 - (lastDt.rightPx - tmpOffset) * dataChartTime.timePerPixel;
    }
    getCurrentFormatForLevel(level, time) {
        return level.find((t => +time.zoom <= +t.zoomTo));
    }
    alignLevelToMain(levelIndex, currentLevelDates, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");

        if (levelIndex === dataChartTime.level) return currentLevelDates;
        if (!this.state.get("config.chart.time.alignLevelsToMain")) return currentLevelDates;

        const dates = dataChartTime.allDates[dataChartTime.level];
        if (!dates || !dates.length) return currentLevelDates;
        if (!currentLevelDates || !currentLevelDates.length) return currentLevelDates;
        const len = currentLevelDates.length;
        for (let i = 0; i < len; i++) {
            const levelDt = currentLevelDates[i];
            let tmpDt, check = false,
                offset = 0;
            for (const dt of dates) {
                if (dt.rightGlobal >= levelDt.leftGlobal) {
                    if (!check) 
                        if (dt.leftGlobal >= levelDt.leftGlobal) {
                            levelDt.leftGlobal = dt.leftGlobal;
                            levelDt.leftGlobalDate = this.date(levelDt.leftGlobal);
                            levelDt.leftPx = dt.leftPx;
                        } else {
                            const tmpW = (dt.rightGlobal - levelDt.leftGlobal) / dataChartTime.timePerPixel;
                            offset = -(dt.width - tmpW);
                        }
                        check = true;
                }
                if (dt.leftGlobal > levelDt.rightGlobal) break;
                if ( check ) {
                    offset += dt.width;
                    tmpDt = dt;
                }
            }
            if (tmpDt) {
                if (tmpDt.rightGlobal <= levelDt.rightGlobal) {
                    levelDt.rightGlobal = tmpDt.rightGlobal;
                    levelDt.rightGlobalDate = this.date(levelDt.rightGlobal);
                    levelDt.width = offset;
                    levelDt.rightPx = levelDt.leftPx + levelDt.width;
                } else {
                    const tmpW = (tmpDt.rightGlobal - levelDt.rightGlobal) / dataChartTime.timePerPixel;
                    levelDt.width = offset - tmpW;
                    levelDt.rightPx = levelDt.leftPx + levelDt.width;
                }
            }
        }
        return currentLevelDates;
    }
    stopCheckingCurrentDates() {
        this.checkCurrentDateTimeoutId && clearTimeout(this.checkCurrentDateTimeoutId);
    }
    checkCurrentDates(runSetTimeout = false, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        const curTime = this.date().valueOf(),
            interval = dataChartTime.checkCurrentDateInterval;

        this.stopCheckingCurrentDates();
        if ( runSetTimeout ) {
            this.checkCurrentDateTimeoutId = setTimeout((() => {
                this.checkCurrentDates(runSetTimeout, dataChartTime);
            }), interval);
        }
        if ( curTime - this.currentDateLastCheck < interval) return;
        
        const allDates = dataChartTime.allDates;
        let update = false;
        for (const dates of allDates) {
            const dtLen = dates.length;
            for (let i = 0; i < dtLen; i++) {
                const dt = dates[i],
                    cur = dt.current;
                dt.current = false;
                dt.previous = false;
                dt.next = false;
                if ( dt.leftGlobal <= curTime && dt.rightGlobal >= curTime ) {
                    if ( true !== cur ) {
                        update = true;
                    }
                    dt.current = true;
                    if ( i > 0 ) {
                        dates[i - 1].previous = true;
                    }
                    if ( i + 1 < dtLen ) {
                        dates[i + 1].next = true;
                    }
                }
            }
        }
        this.currentDateLastCheck = curTime; 
        
        if ( update ) {
            /**/
            this.state.update("$data.chart.time.levels", (t => t), {
                data: "current-time"
            });
            
        }
        //this.api.render()
    }
    getDSTDiffForLevel(levelIndex, fromTime, toTime, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        const arr = this.getLevelDatesFromCache(levelIndex, fromTime, toTime, dataChartTime);
        let diffMs = 0;
        for (const t of arr) {
            if ( t.DST.diffMs && fromTime <= t.DST.afterTime && toTime > t.DST.afterTime ) {
                diffMs += t.DST.diffMs;
            }
        }
        return diffMs;
    }
    setDatesDST(arr) {
        for (const dt of arr) {
            const timeGap = dt.rightGlobal - dt.leftGlobal,
                utcGap = dt.rightGlobalDate.utc(true).valueOf() - dt.leftGlobalDate.utc(true).valueOf();
            if (timeGap !== utcGap) {
                dt.DST = {
                    diffMs: timeGap - utcGap,
                    afterTime: 0,
                    afterDate: null
                };
                for (let hour = 0; hour < 9216; hour++)
                    if (dt.leftGlobalDate.add(hour, "hour").hour() !== dt.leftGlobalDate.utc(true).add(hour, "hour").hour()) {
                        dt.DST.afterDate = dt.leftGlobalDate.add(hour, "hour").subtract(1, "ms");
                        dt.DST.afterTime = dt.DST.afterDate.valueOf();
                        break;
                    }
            }
        }
        return arr;
    }
    _generatePeriodDates(job) {
        const dates = [];
        job = Object.assign({}, job);
        const {
            datesCount,
            rightDate,
            period,
            level,
            levelIndex,
            time,
            originalLeftDate,
            format
        } = job;
        let leftDt = job.leftDate;
        const timeDt = this.date().valueOf();
        for (let t = 0; t < datesCount; t++) {
            let inc = format.periodIncrement || 1;

            if ( "function" == typeof inc ) {
                inc = inc({
                    currentDates: dates,
                    date: leftDt,
                    leftDate: originalLeftDate,
                    rightDate: rightDate,
                    period,
                    level,
                    levelIndex,
                    time,
                    //vido: this.api.vido,
                    //api: this.api
                });
            }
            const curDt = leftDt.add(inc - 1, period).endOf(period),
                cur = leftDt.valueOf() <= timeDt && curDt.valueOf() >= timeDt,
                dtInfo = {
                    id: `gstcid-${leftDt.valueOf()}`,
                    leftGlobal: leftDt.valueOf(),
                    leftGlobalDate: leftDt,
                    rightGlobalDate: curDt,
                    rightGlobal: curDt.valueOf(),
                    width: 0,
                    leftPx: 0,
                    rightPx: 0,
                    period: period,
                    formatted: null,
                    current: cur,
                    previous: false,
                    next: false,
                    periodIncrementedBy: inc,
                    DST: {
                        diffMs: 0,
                        afterTime: 0,
                        afterDate: null
                    }
                };
            
            if ( cur && dates.length ) {
                dates[dates.length - 1].previous = true;
            }
            if ( dates.length && dates[dates.length - 1].current ) {
                dtInfo.next = true;
            }
            const center = dtInfo.rightGlobal + 1 - dtInfo.leftGlobal;
            dtInfo.width = center / time.timePerPixel;
            dates.push(dtInfo);
            leftDt = leftDt.add(inc || 1, period);
        }
        return this.setDatesDST(dates);
    }
    generatePeriodDates({
        leftDate,
        rightDate,
        period,
        level,
        levelIndex,
        time,
        callOnDate,
        callOnLevelDates,
        expandIfMissing
    }) {
        if (!time.timePerPixel) return [];
        const levelFormat = this.getCurrentFormatForLevel(level, time);
        
        expandIfMissing = expandIfMissing || true;

        leftDate = leftDate.startOf(period);
        rightDate = rightDate.endOf(period);

        const dtCnt = Math.ceil(rightDate.diff(leftDate, period, true)),
            originalLeftDate = leftDate.clone();
        let dts = this._generatePeriodDates({
            datesCount: dtCnt,
            leftDate,
            rightDate,
            period,
            level,
            levelIndex,
            time,
            originalLeftDate,
            format: levelFormat
        });

        if (callOnDate) {
            const tmpDts = [];
            for (let i = 0; i < dts.length; i++) {
                let dt = dts[i];
                if (dt) {
                    for (let j = 0, jLen = time.onDate.length; j < jLen; j++) {
                        dt = time.onDate[j]({
                            date: dt,
                            format: levelFormat,
                            time,
                            level,
                            levelIndex
                        });
                    }
                    if ( dt ) {
                        tmpDts.push(dt);
                    }
                }
            }
            dts = tmpDts;
        }

        if (callOnLevelDates) {
            for (let i = 0, len = time.onLevelDates.length; i < len; i++) {
                dts = time.onLevelDates[i]({
                    dates: dts,
                    format: levelFormat,
                    time,
                    level,
                    levelIndex
                });
            }
        }
            
        if ((!dts.length || dts[dts.length - 1].rightGlobal < leftDate.valueOf()) && expandIfMissing) {
            let tmpDates = this._generatePeriodDates({
                datesCount: dtCnt + 100,
                leftDate,
                rightDate,
                period,
                level,
                levelIndex,
                time,
                originalLeftDate,
                format: levelFormat
            });

            if (callOnDate) {
                const tmpDts = [];
                for (let i = 0; i < tmpDates.length; i++) {
                    let dt = tmpDates[i];
                    if (dt) {
                        for (let j = 0, jLen = time.onDate.length; j < jLen; j++) {
                            dt = time.onDate[j]({
                                date: dt,
                                format: levelFormat,
                                time,
                                level,
                                levelIndex
                            });
                        }
                        if ( dt ) {
                            tmpDts.push(dt);
                        }
                    }
                }
                tmpDates = tmpDts;
            }

            if (callOnLevelDates) {
                for (let i = 0, len = time.onLevelDates.length; i < len; i++)  {
                    tmpDates = time.onLevelDates[i]({
                        dates: tmpDates,
                        format: levelFormat,
                        time,
                        level,
                        levelIndex
                    });
                }
            }
                
            const retArr = [];
            for (const dt of tmpDates) {
                retArr.push(dt);
                if (dt.rightGlobal >= leftDate.valueOf()) return retArr;
            }
        }

        this.addDatesToCacheLevel(levelIndex, dts, time);
        const retArr = [];
        for (const dt of dts) {
            retArr.push(dt);
            if (dt.rightGlobal >= rightDate.valueOf()) return retArr;
        }
        return retArr;
    }
    getDatesDiffPx(fromTime, toTime, dataChartTime, accurate = true, dates = null) {
        if (fromTime.valueOf() === toTime.valueOf()) return 0;
        let reverse = false;
        if (toTime.valueOf() < fromTime.valueOf()) {
            const tmpTime = fromTime;
            fromTime = toTime;
            toTime = tmpTime;
            reverse = true;
        }
        if (dates == null) {
            if (!dataChartTime.allDates || !dataChartTime.allDates.length || !dataChartTime.allDates[dataChartTime.level]) return 0;
            dates = dataChartTime.allDates[dataChartTime.level];
        }

        if (0 === dates.length) return 0;

        if ( this.isLevelDateInCache(dataChartTime.level, fromTime.valueOf(), dataChartTime) ) {
            dates = this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
        } else {
            if ( fromTime.valueOf() < dates[0].leftGlobal ) {
                dates = this.addMissingDates(dates, fromTime, dataChartTime);
            }
            if ( this.isLevelDateInCache(dataChartTime.level, toTime.valueOf(), dataChartTime) ) {
                dates = this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
            } else {
                const tmpRightDate = dates[dates.length - 1].rightGlobalDate.clone();
                if ( toTime.valueOf() > tmpRightDate.valueOf() ) {
                    dates = this.addMissingDates(dates, toTime, dataChartTime);
                }
            }
        }
        
        this.addDatesToCacheLevel(dataChartTime.level, dates, dataChartTime);

        let tmpdt, diffOffset = 0,
            tmpStartDt, check = false,
            distance = 0;
        for (const dt of dates) {

            if ( dt.rightGlobal + 1 >= fromTime.valueOf() && !check ) {
                check = true;
                tmpdt = dt;
            }
            if ( check ) {
                diffOffset += dt.width;
            }
            if (dt.rightGlobal + 1 >= toTime.valueOf()) {
                tmpStartDt = dt;
                distance = dt.width;
                break;
            }
        }
        
        if (accurate) {
            let diff = fromTime.valueOf() - tmpdt.leftGlobal;
            if ( fromTime.valueOf() < tmpdt.leftGlobal ) {
                diff = 0;
            }
            let gap = tmpStartDt.rightGlobal + 1 - toTime.valueOf();
            if ( tmpStartDt.leftGlobal > toTime.valueOf() ) {
                gap = tmpStartDt.rightGlobal + 1 - tmpStartDt.leftGlobal;
            }
            const diffOffset2 = (gap + diff) / dataChartTime.timePerPixel;
            return reverse ? -(diffOffset - diffOffset2) : diffOffset - diffOffset2;
        }

        diffOffset -= distance;
        return reverse ? -diffOffset : diffOffset;
    }
    getDatesDiffMs(fromTime, toTime, time, accurate = true, dates = null) {
        // fromTime, toTime, dataChartTime, accurate = true, dates = null

        if (fromTime.valueOf() === toTime.valueOf()) return 0;

        let tmpToTime, tmpdt, ms = 0,
            reverse = false;

        if (toTime.valueOf() < fromTime.valueOf()) {
            const tmpTime = fromTime;
            fromTime = toTime, 
            toTime = tmpTime, 
            reverse = true
        }

        if ( null == dates) {
            if (!time.allDates || !time.allDates.length || !time.allDates[time.level]) return 0;
            dates = time.allDates[time.level]
        }

        if (0 === dates.length) return 0;

        if ( this.isLevelDateInCache(time.level, fromTime.valueOf(), time) ) {
            dates = this.getAllLevelDatesFromCache(time.level, time);
        } else {
            if ( fromTime.valueOf() < dates[0].leftGlobal ) {
                dates = this.addMissingDates(dates, fromTime, time);
            }
        }

        if (this.isLevelDateInCache(time.level, toTime.valueOf(), time)) {
            dates = this.getAllLevelDatesFromCache(time.level, time);
        } else {
            const tmpRightDate = dates[dates.length - 1].rightGlobalDate.clone();
            if ( toTime.valueOf() > tmpRightDate.valueOf() ) {
                dates = this.addMissingDates(dates, toTime, time);
            }
        }

        this.addDatesToCacheLevel(time.level, dates, time);

        let c = false,
            distance = 0;
        for (const dt of dates) {
            if ( dt.rightGlobal + 1 >= fromTime.valueOf() && !c ) {
                c = true;
                tmpdt = dt;
            }
            if ( c ) {
                ms += dt.rightGlobal + 1 - dt.leftGlobal;
            }
            if (dt.rightGlobal + 1 >= toTime.valueOf()) {
                tmpToTime = dt;
                distance = dt.rightGlobal + 1 - dt.leftGlobal;
                break;
            } 
        }

        if (accurate) {
            let diffMs = fromTime.valueOf() - tmpdt.leftGlobal;
            fromTime.valueOf() < tmpdt.leftGlobal && (diffMs = 0);
            let o = tmpToTime.rightGlobal + 1 - toTime.valueOf();
            tmpToTime.leftGlobal > toTime.valueOf() && (o = tmpToTime.rightGlobal + 1 - tmpToTime.leftGlobal);
            const i = o + diffMs;
            return reverse ? -(ms - i) : ms - i;
        }
        
        ms -= distance;
        return reverse ? -ms : ms;

        /*


        if (fromTime.valueOf() === toTime.valueOf()) return 0;
        let reverse = false;
        if (toTime.valueOf() < fromTime.valueOf()) {
            const tmpTime = fromTime;
            fromTime = toTime;
            toTime = tmpTime;
            reverse = true;
        }
        if (null == dates) {
            if (!dataChartTime.allDates || !dataChartTime.allDates.length || !dataChartTime.allDates[dataChartTime.level]) return 0;
            dates = dataChartTime.allDates[dataChartTime.level];
        }
        if (0 === dates.length) return 0;

        if ( this.isLevelDateInCache(dataChartTime.level, fromTime.valueOf(), dataChartTime) ) {
            dates = this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
        } else {
            if ( fromTime.valueOf() < dates[0].leftGlobal ) {
                dates = this.addMissingDates(dates, fromTime, dataChartTime);
            }
            if ( this.isLevelDateInCache(dataChartTime.level, toTime.valueOf(), dataChartTime) ) {
                dates = this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
            } else {
                const tmpRightDate = dates[dates.length - 1].rightGlobalDate.clone();
                if ( toTime.valueOf() > tmpRightDate.valueOf() ) {
                    dates = this.addMissingDates(dates, toTime, dataChartTime);
                }
            }
        }
        this.addDatesToCacheLevel(dataChartTime.level, dates, dataChartTime);
        let tmpStartDt, tmpdt, diffOffset = 0,
            check = false,
            distance = 0;
        for (const dt of dates) {
            if ( dt.rightGlobal + 1 >= fromTime.valueOf() && !check ) {
                check = true;
                tmpdt = dt;
            } 
            if ( check ) {
                diffOffset += dt.rightGlobal + 1 - dt.leftGlobal;
            }
            if ( dt.rightGlobal + 1 >= toTime.valueOf() ) {
                tmpStartDt = dt;
                distance = dt.rightGlobal + 1 - dt.leftGlobal;
                break;
            }

            if (accurate && tmpdt) {
                let diff = fromTime.valueOf() - tmpdt.leftGlobal;
                if ( fromTime.valueOf() < tmpdt.leftGlobal ) {
                    diff = 0;
                }
                let gap = tmpStartDt.rightGlobal + 1 - toTime.valueOf();
                if ( tmpStartDt.leftGlobal > toTime.valueOf() ) {
                    gap = tmpStartDt.rightGlobal + 1 - tmpStartDt.leftGlobal;
                }
                const diffOffset2 = gap + diff;
                return reverse ? -(diffOffset - diffOffset2) : diffOffset - diffOffset2;
            }
        }
        diffOffset -= distance;
        return reverse ? -diffOffset : diffOffset;
        */
    }
    addTimeFromDates(baseTime, addTime, dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (!dataChartTime.allDates || !dataChartTime.allDates.length || !dataChartTime.allDates[dataChartTime.level]) return baseTime + addTime;
        if (!addTime) return baseTime;
        let dates = this.getAllLevelDatesFromCache(dataChartTime.level, dataChartTime);
        
        const baseDt = this.date(baseTime);

        dates = this.addMissingDates(dates, baseDt, dataChartTime, true);
        let index = this.findDateIndex(baseTime, dates),
            time = baseTime - dates[index].leftGlobal;
        
        if ( time < 0 ) {
            time = 0;
        }
        let diff = 0;
        if (addTime > 0) {
            for (; diff < addTime;) {
                const dt = dates[index];
                diff += dt.rightGlobal + 1 - dt.leftGlobal;
                if ( time ) {
                    diff -= time;
                    time = 0;
                }
                if ( diff >= addTime ) {
                    break;
                }
                index++;
                if ( dates[index] ) {
                    dates = this.addMissingDates(dates, dt.leftGlobalDate.add(1, dataChartTime.period), dataChartTime, true);
                }
            }
            return dates[index].rightGlobal + 1 - (diff - addTime);
        }
        for (; diff > addTime;) {
            let dt = dates[index];
            diff -= time;
            if ( time ) {
                time = 0;
            }
            if ( diff <= addTime ) break;
            index--;
            if ( index < 0 ) {
                dates = this.addMissingDates(dates, dt.leftGlobalDate.subtract(1, dataChartTime.period), dataChartTime, true);
                index = 0;
            }
            dt = dates[index];
            diff -= dt.rightGlobal + 1 - dt.leftGlobal;
            if ( diff <= addTime ) break;
        }
        return dates[index].leftGlobal + (-diff + addTime);
    }
    getLeftViewDate(dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (!dataChartTime.levels || !dataChartTime.levels.length) return null;
        const level = dataChartTime.levels[dataChartTime.level];
        return level.length ? level[0] : null;
    }
    getRightViewDate(dataChartTime) {
        dataChartTime = dataChartTime || this.state.get("$data.chart.time");
        if (!dataChartTime.levels || !dataChartTime.levels.length || !dataChartTime.levels[dataChartTime.level]) return null;
        const level = dataChartTime.levels[dataChartTime.level];
        return level.length ? level[level.length - 1] : null;
    }
    getLowerPeriod(p) {
        switch (p) {
            case "year":
                return "month";
            case "month":
            case "week":
                return "day";
            case "day":
                return "hour";
            case "hour":
                return "minute";
            case "minute":
                return "second";
            case "second":
                return "millisecond";
            default:
                return p;
        }
    }
    getHigherPeriod(p) {
        switch (p) {
            case "month":
                return "year";
            case "week":
            case "day":
                return "month";
            case "hour":
                return "day";
            case "minute":
                return "hour";
            case "second":
                return "minute";
            case "millisecond":
                return "second";
            default:
                return p;
        }
    }
}

/*
    gantt API
*/
export class ganttApi {
    constructor(state, gantt) {
        this.state = state;
        this.gantt = gantt;
        this.keysToKeep = ["id", "parents", "children", "allChildren", "parentId"];
        this.itemsAsArray = [];
        this.itemsDataAsArray = [];
        this.rowsDataWithParentsExpanded = [];
        this.rowsIdsWithParentsExpanded = [];
        this.rowsWithParentsExpanded = [];
        this.rowsWithParentsExpandedAsMap = new Map;
        this.rowsPositionsMap = {
            id: "",
            dataIndex: 0,
            keys: []
        };
        this.allRowsIds = [];
        this.allRowsAsArray = [];
        this.rowsWithParentsExpandedDataIndexMap = new Map;
        this.time = new timeApi(state, gantt);

        this.unsubscribes = [];
        this.mutedMethods = new Set;

        this.plugins = {};
        this.allActions = [];
        //this.debug = true;

        this.unsubscribes.push(this.state.subscribe("config.debug", value => {
            //console.log("1111", this, value);
            this.debug = value;
            if ( value ) {
                if ( typeof window == "object" ) {
                    window.state = this.state;
                }
            }
        }));
        //this.state.update("config.debug", this.debug); 
    }

    muteMethod(t) {
        this.mutedMethods.add(t);
    }
    unmuteMethod(t) {
        this.mutedMethods.delete(t);
    }
    isMutedMethod(t) {
        return this.mutedMethods.has(t);
    }

    log(...t) {
        this.debug && console.log.call(console, ...t);
    }

    getInitializedPlugins() {
        return this.state.get("$data.initializedPlugins");
    }

    pluginInitialized(pluginName) {
        this.getInitializedPlugins().add(pluginName);
    }

    pluginDestroyed(pluginName) {
        this.getInitializedPlugins().delete(pluginName);
    }

    clearPluginsPositions() {
        this.getInitializedPlugins().clear();
    }

    isPluginInitialized(pluginName) {
        return this.getInitializedPlugins().has(pluginName);
    }

    getPluginPosition(pluginName) {
        return [...this.getInitializedPlugins()].indexOf(pluginName);
    }

    getPluginsPositions() {
        const res = {};
        let seq = 0;
        for (const pluginName of this.getInitializedPlugins()) res[pluginName] = seq++;
        return res;
    }

    isPluginInitializedBefore(aPluginName, bPluginName) {
        return this.getPluginPosition(aPluginName) < this.getPluginPosition(bPluginName);
    }

    getActions(actionName) {
        if ( !this.allActions.includes(actionName) ) {
            this.allActions.push(actionName);
        }
        let actions = this.state.get("config.actions." + actionName);
        if ( null == actions ) {
            actions = [];
        }
        return actions.slice();
    }

    destroy() {
        for (const t of this.unsubscribes) {
            console.log("destroy", t);
            t();
        }
        this.unsubscribes = [];
        this.debug && delete window.state;
    }

    isItemInViewport(item, leftGlobal = null, rightGlobal = null) {
        if (!leftGlobal || !rightGlobal) {
            const time = this.state.get("config.chart.time");
            leftGlobal = time.leftGlobal;
            rightGlobal = time.rightGlobal;
        }
        return item.time.start <= rightGlobal && item.time.end >= leftGlobal;
    }

    setItemDataOutOfView(itemData, time) {
        time = time || this.state.get("$data.chart.time");

        itemData.outOfView || (itemData.outOfView = {
            left: false,
            right: false,
            whole: false
        });
        const start = itemData.time.startDate.valueOf(),
            end = itemData.time.endDate.valueOf();

        itemData.outOfView.left = start < time.leftGlobal || start >= time.rightGlobal;
        itemData.outOfView.right = end > time.rightGlobal || end <= time.leftGlobal;
        itemData.outOfView.whole = end <= time.leftGlobal || start >= time.rightGlobal;

        return itemData;
    }

    calculateItemHorizontalPosition(itemId, itemData = null, rowData = null, time = null, item = null) {

        time = time || this.state.get("$data.chart.time");
        item || (item = this.getItem(itemId));
        itemData || (itemData = this.getItemData(itemId));
        rowData || (rowData = this.getRowData(i.rowId));

        if (!rowData) return itemData.position;

        if (this.state.get("$data.chart.allItemsOnTheLeftOrRight")) return;

        const start = itemData.time.startDate.valueOf() === item.time.start ? itemData.time.startDate : this.time.date(item.time.start),
            end = itemData.time.endDate.valueOf() === item.time.end ? itemData.time.endDate : this.time.date(item.time.end),
            left = this.time.getViewOffsetPxFromDates(start, false, time),
            right = this.time.getViewOffsetPxFromDates(end.add(1, "ms"), false, time);

        itemData.position.left = left;
        itemData.position.actualLeft = this.time.limitOffsetPxToView(left, time);
        itemData.position.right = right; 
        itemData.position.actualRight = this.time.limitOffsetPxToView(right, time);
        itemData.width = right - left;

        let offset = this.time.getViewOffsetPxFromDates(end, false, time);

        offset === right && (offset -= 1 / time.timePerPixel);
        itemData.timeWidth = offset - left;
        itemData.actualWidth = itemData.position.actualRight - itemData.position.actualLeft;

        const minWidth = this.state.get("config.chart.item.minWidth");
        "number" == typeof minWidth && itemData.actualWidth < minWidth && (itemData.actualWidth = minWidth);
        this.setItemDataOutOfView(itemData, time);

        return itemData.position;
    }

    calculateItemPosition(itemId, itemData = null, rowData = null, time, item = null) {
        time || (time = this.state.get("$data.chart.time"));
        itemData || (itemData = this.state.get(`$data.chart.items.${itemId}`));
        item || (item = this.state.get(`config.chart.items.${itemId}`));
        rowData || (rowData = this.state.get(`$data.list.rows.${item.rowId}`));
        this.calculateItemHorizontalPosition(itemId, itemData, rowData, time, item);
        this.calculateItemVerticalPosition(itemId, itemData, rowData, item);
        return itemData.position;
    }

    getItemPosition(itemId, itemData = null, rowData = null, time, item = null) {
        time || (time = this.state.get("$data.chart.time"));
        item || (item = this.getItem(itemId));
        itemData || (itemData = this.getItemData(itemId));
        0 === itemData.position.left && 0 === itemData.position.right && this.calculateItemPosition(itemId, itemData, rowData, time, item);
        return itemData.position;
    }

    getRow(rowId) {
        return this.state.get(`config.list.rows.${rowId}`)
    }

    getRows(rowsId) {
        if (!rowsId.length) return [];
        const rows = this.getAllRows(),
            res = [];
        for (const rowId of rowsId) rows[rowId] && res.push(rows[rowId]);
        return res;
    }

    getAllRows() {
        return this.state.get("config.list.rows");
    }

    getVisibleRowsId() {
        return this.state.get("$data.list.visibleRows");
    }

    getRowsData() {
        return this.state.get("$data.list.rows");
    }

    getItem(itemId) {
        return this.state.get(`config.chart.items.${itemId}`)
    }

    getAllItems() {
        return this.state.get("config.chart.items");
    }

    getItemData(itemId) {
        return this.state.get(`$data.chart.items.${itemId}`)
    }

    getItemsData() {
        return this.state.get("$data.chart.items");
    }

    getItems(itemsId = []) {
        const res = [],
            allItems = this.getAllItems();
        for (const itemId of itemsId) allItems[itemId] && res.push(allItems[itemId]);
        return res;
    }

    getAllItemsAsArray() {
        return this.itemsAsArray;
    }

    getAllItemsDataAsArray() {
        return this.itemsDataAsArray;
    }

    setItemData(itemId, data) {
        this.state.update(`$data.chart.items.${itemId}`, (item => {
            for (const prop in data) item[prop] = data[prop];
            return item;
        }));
    }

    setItemsData(data) {
        this.state.update("$data.chart.items", data);
    }

    prepareDependantItems(item, items) {
        return this.getChildrenDependantItemsIds(item, items).filter((id => id !== item.id))
    }

    fillEmptyRowValues(rows) {
        const height = this.state.get("config.list.row.height"),
            rowsData = this.getRowsData();
        let curTop = 0;
        for (let id in rows) {
            const row = rows[id];
            let rowData = rowsData[id];
            id = String(id);
            row.id = id;
            if ( "string" != typeof id ) {
                throw new Error('[gantt-schedule-timeline-calendar] Row "id" must be a string.');
            }
            /*
            if (!i.startsWith("gstcid-")) throw new Error(`[gantt-schedule-timeline-calendar] Row "id" should start with "gstcid-" (your row id: "${i}").`);
            if (i.startsWith("gstcid-gstcid-")) 
                throw new Error(`[gantt-schedule-timeline-calendar] Your row "id" is wrapped more than once. It should look like this "gstcid-something" and it looks like this: "${i}".`);
            */
            if ( !rowsData[id] ) {
                rowData = {
                    id: row.id,
                    parentId: row.parentId,
                    parents: [],
                    children: [],
                    allChildren: [],
                    position: {
                        top: 0,
                        bottom: 0
                    },
                    items: [],
                    itemsOrder: [],
                    actualHeight: 0,
                    outerHeight: 0,
                    parentsExpanded: true,
                    inView: true
                };
            }
            if ( "number" != typeof row.height ) {
                row.height = height;
            }
            rowData.actualHeight = row.height;

            if ( "boolean" != typeof row.expanded ) {
                row.expanded = false;
            }
            rowData.position.top = curTop;

            if ( "object" != typeof row.gap ) {
                row.gap = {};
            }

            if ( "number" != typeof row.gap.top ) {
                row.gap.top = 0;
            }

            if ( "number" != typeof row.gap.bottom ) {
                row.gap.bottom = 0;
            }
            if ( null == row.visible ) {
                row.visible = true;
            }
            rowData.outerHeight = rowData.actualHeight + row.gap.top + row.gap.bottom;
            rowsData[id] = rowData;
            curTop += rowData.outerHeight;
        }
        return rows;
    }

    makeTreeMap(rowsData, items, onlyItems = false) {
        
        let treeMap = this.state.get("$data.treeMap");
        if (!onlyItems || !treeMap) {
            treeMap = this.fastTree(rowsData);
            for (const rowId in rowsData) {
                const row = rowsData[rowId],
                    map = treeMap[rowId];
                for (const mId in map) {
                    row[mId] = map[mId];
                }
            }
        }
        const itemMap = this.state.get("$data.reloading") ? {} : this.state.get("$data.itemRowMap");
        for (const itemId in items ) {
            const item = items[itemId];
            this.updateItemRowMapForItem(itemId, item.rowId, itemMap);
        }
        const itemsId = Object.keys(this.state.get("config.chart.items"));
        for (const rowId in rowsData) {
            const rowData = rowsData[rowId];
            this.sortRowItemsByTime(rowData);
            this.sortRowItemsInAddOrder(itemsId, rowData);
        }

        this.state.update("$data.itemRowMap", itemMap);
        if ( !onlyItems ) {
            this.state.update("$data.treeMap", treeMap);
        }
        return rowsData;
    }

    fastTree(rowsData, tmap = null) {
        let pId, pM;
        if (!tmap) {
            tmap = {
                undefined: {},
                id: "undefined"
            };
            for (const rowId in rowsData) {
                const rowData = rowsData[rowId];
                if ( !tmap[rowData.id] ) {
                    pId = rowData.parentId;
                    tmap[rowData.id] = {
                        parentId: null != pId ? pId : "undefined",
                        id: rowData.id
                    };
                }
            }
        }

        for (const id in tmap) {
            const m = tmap[id];
            pM = m.parentId;
            if ( pM == null ) {
                pM = "undefined";
            }
            tmap[pM][m.id] = m;
        }

        this.makeChildren(tmap[undefined]); 
        delete tmap[undefined]; 
        delete tmap.id;
        delete tmap.parents;
        delete tmap.children;
        delete tmap.allChildren;
        for (const m in tmap) {
            tmap[m] = this.clearNested(tmap[m]);
        }
        return tmap;
    }

    updateItemRowMapForItem(itemId, newRowId, itemRowMap, rowsData) {
        itemRowMap = itemRowMap || this.state.get("$data.itemRowMap");
        rowsData = rowsData || this.state.get("$data.list.rows");

        if (!rowsData[newRowId]) return;

        if ( !rowsData[newRowId].items ) {
            rowsData[newRowId].items = [];
        }

        const rowId = itemRowMap[itemId];

        if ( rowId && rowsData[rowId] ) {
            rowsData[rowId].items = rowsData[rowId].items
                .filter(id => id !== itemId)
                .sort((a, b) => {
                    return this.getItem(a).time.start - this.getItem(b).time.start;
                });
        }

        itemRowMap[itemId] = newRowId;
        if ( !rowsData[newRowId].items.includes(itemId) ) {
            rowsData[newRowId].items.push(itemId);
        }
    }

    sortRowItemsInAddOrder(itemsId, rowData) {
        rowData.itemsOrder = rowData.items.slice();
        rowData.itemsOrder.sort(((a, b) => itemsId.indexOf(a) - itemsId.indexOf(b)));
    }

    sortRowItemsByTime(rowData) {
        rowData.items = rowData.items.sort(((a, b) => this.getItem(a).time.start - this.getItem(b).time.start));
    }

    itemsOnTheSameLevel(item1, item2) {
        const itemData1 = this.getItemData(item1.id),
            itemData2 = this.getItemData(item2.id),
            pos1 = itemData1.position.rowTop + itemData1.outerHeight,
            pos2 = itemData2.position.rowTop + itemData2.outerHeight;

        return itemData2.position.rowTop <= itemData1.position.rowTop && pos2 > itemData1.position.rowTop || 
            (itemData2.position.rowTop >= itemData1.position.rowTop && itemData2.position.rowTop < pos1 || itemData2.position.rowTop >= itemData1.position.rowTop && pos2 < pos1);
    }

    itemsTimeOverlaps(item1, item2) {
        return item2.time.start >= item1.time.start && item2.time.start <= item1.time.end || 
            (item2.time.end >= item1.time.start && item2.time.end <= item1.time.end || 
                (item2.time.start >= item1.time.start && item2.time.end <= item1.time.end || item2.time.start <= item1.time.start && item2.time.end >= item1.time.end)
            );
    }

    itemOverlapsWithOthers(item, items) {
        for (let i = 0, len = items.length; i < len; i++) {
            const tmpItem = items[i],
                isTime = tmpItem.time.start && item.time.start && tmpItem.time.end && item.time.end;
            if (item.id !== tmpItem.id && this.itemsOnTheSameLevel(item, tmpItem) && this.itemsTimeOverlaps(item, tmpItem) && isTime) {
                return tmpItem;
            } 
        }
        return null;
    }

    fixOverlappedItems(rowItems) {
        if (this.isMutedMethod("fixOverlapped")) return;
        if (0 === rowItems.length) return;
        const itemsData = this.getItemsData();
        for (const item of rowItems) {
            if (item.overlap) continue;
            const itemData = itemsData[item.id];
            itemData && (itemData.position.rowTop = item.top)
        }

        for (let i = 0; i < rowItems.length; i++) {
            const item = rowItems[i];
            if (item.overlap) continue;
            const itemData = itemsData[item.id];
            if (!itemData) continue;
            itemData.position.actualRowTop = itemData.position.rowTop + item.gap.top;
            let tmpItem = this.itemOverlapsWithOthers(item, rowItems);
            if (tmpItem) {
                for (; tmpItem = this.itemOverlapsWithOthers(item, rowItems);) {
                    const itemData1 = this.getItemData(tmpItem.id),
                        fidx = rowItems.findIndex((t => t.id === tmpItem.id));
                    
                    if ( fidx < i ) {
                        itemData.position.rowTop += itemData1.outerHeight;
                        itemData.position.actualRowTop = itemData.position.rowTop + item.gap.top;
                    } else {
                        itemData1.position.rowTop += itemData.outerHeight;
                        itemData1.position.actualRowTop = itemData1.position.rowTop + tmpItem.gap.top;
                    }
                }
            }
        }
    }

    makeChildren(tMap, cMap) {
        cMap = cMap || {
            parents: []
        };

        if ("object" != typeof tMap) return [];
        if ( !tMap.children ) {
            tMap.children = [];
        }

        if ( !tMap.allChildren ) {
            tMap.allChildren = [];
        }

        if ( !tMap.parents ) {
            tMap.parents = [...cMap.parents];
        }

        if ( tMap.parentId && "undefined" !== tMap.parentId ) {
            tMap.parents.push(tMap.parentId);
        }

        for (const id in tMap) {
            if ("id" !== id && "parentId" !== id && "children" !== id && "allChildren" !== id && "parents" !== id) {
                if ( "undefined" !== id ) {
                    tMap.children.push(id);
                    tMap.allChildren.push(id);
                }
                const m = tMap[id];
                if ("object" != typeof m) continue;
                const allChildren = this.makeChildren(m, tMap);
                tMap.allChildren.splice(tMap.allChildren.length, 0, ...allChildren);
            }
        }
        return tMap.allChildren;
    }

    clearNested(tMap) {
        for (const prop in tMap) {
            if ( "object" == typeof tMap[prop] )
            "object" != typeof tMap[prop] || Array.isArray(tMap[prop]) || this.clearNested(tMap[prop]);
            if ( !this.keysToKeep.includes(prop) ) {
                delete tMap[prop];
            }
            if ( "parentId" === prop && "undefined" === tMap[prop] ) {
                tMap[prop] = null;
            }
        }
        return tMap;
    }

    sortRowsByChildren(rowsIds, sortedRows = {}, rows, rowsData) {
        rows = rows || this.state.get("config.list.rows");
        rowsData = rowsData || this.state.get("$data.list.rows");

        for (const rowId of rowsIds) {
            const row = rows[rowId],
                rowData = rowsData[rowId],
                ins = row.parentId && sortedRows[row.parentId] || !row.parentId;
            if ( !sortedRows[rowId] && ins ) {
                sortedRows[rowId] = row;
            }
            if ( rowData.children.length ) {
                this.sortRowsByChildren(rowData.children, sortedRows, rows, rowsData);
            }
        }
        return sortedRows;
    }

    getSortableValue(sortable, row) {
        return "string" == typeof sortable ? row[sortable] : "function" == typeof sortable ? sortable({
            row,
        }) : "";
    }

    sortRowsByColumn(column, asc = true) {
        const sortCompare = this.state.get("config.list.sort.compare");

        let rows = this.getAllRows();
        if (0 === this.allRowsIds.length) return row;

        //const rowsObj = this.allRowsAsArray;

        sortCompare ? this.allRowsAsArray.sort(sortCompare(column)) : this.allRowsAsArray.sort(((a, b) => {
            const a_seq = this.getSortableValue(column.sortable, a),
            b_seq = this.getSortableValue(column.sortable, b);

            if ( "number" == typeof a_seq ) {
                if ( asc ) {
                    return a_seq - b_seq;
                } else {
                    return b_seq - a_seq;
                }
            } else if ( "string" == typeof a_seq ) {
                if ( asc ) {
                    return a_seq.localeCompare(b_seq);
                } else {
                    return b_seq.localeCompare(a_seq);
                }
            }
            return null;
            /*
            //console.log(a_seq, b_seq);
            return "number" == typeof a_seq ? 
                ( asc ? a_seq - b_seq : b_seq - a_seq ) : 
                "string" == typeof a_seq ? ( asc ? a_seq.localeCompare(b_seq) : b_seq.localeCompare(a_seq) ) : null;
            */
        }));
        
        //this.allRowsAsArray = rowsObj;

        const rowsIds = this.allRowsAsArray.map((t => t.id)),
            rowsData = this.getRowsData();
        for (const rowId of rowsIds) {
            const rowData = rowsData[rowId];
            if ( rowData.children && rowData.children.length ) {
                rowData.children.sort(((a, b) => rowsIds.indexOf(a) - rowsIds.indexOf(b)));
            }
        }
        
        //console.log("sortRowsByColumn rowsIds", column, rowsIds, asc);
        this.allRowsIds = rowsIds;

        rows = this.sortRowsByChildren(rowsIds);
        //console.log("sortRowsByColumn rows", rows);
        this.state.update("config.list.rows", rows, {
            data: "sortRowsByColumn"
        });
        
        const scrollTop = this.getScrollTop();
        this.state.get("config.scroll.vertical.byPixels") ? this.setScrollTop(scrollTop.absolutePosPx) : this.setScrollTop(scrollTop.dataIndex, scrollTop.preciseOffset);
        return rows;
    }

    prepareItem(item, defaultItemHeight, itemsData, items, rows) {
        defaultItemHeight = defaultItemHeight || this.state.get("config.chart.item.height");
        itemsData = itemsData || this.getItemsData();
        items = items || this.getAllItems();
        rows = rows || this.getAllRows();

        let itemId = item.id;
        itemId = String(itemId);
        item.id = itemId;
        if ( !itemsData[item.id] ) {
            itemsData[item.id] = {
                id: item.id,
                actualHeight: 0,
                outerHeight: 0,
                time: null,
                position: {
                    left: 0,
                    actualLeft: 0,
                    right: 0,
                    actualRight: 0,
                    rowTop: item.rowTop || 0,
                    actualRowTop: item.actualRowTop || 0,
                    top: 0,
                    viewTop: 0
                },
                outOfView: {
                    left: !1,
                    right: !1,
                    whole: !1
                },
                width: -1,
                actualWidth: -1,
                timeWidth: -1,
                detached: !1,
                linkedWith: [],
                dependant: this.getChildrenDependantItemsIds(item, items),
            };
            if (!item.time) {
                console.error("There is something wrong with this item.", item);
            }
            if ( "number" != typeof item.time.start || "number" != typeof item.time.end ) {
                throw new Error('[gantt-schedule-timeline-calendar] Item "time.start" and "time.end" values should be a number (unix epoch milliseconds).');
            }
        }
        
        const rowId = item.rowId;
        if ("string" != typeof rowId) {
            throw new Error('[gantt-schedule-timeline-calendar] Item "rowId" should be a string.');
        }
        //if (!rowId.startsWith("gstcid-")) throw new Error('[gantt-schedule-timeline-calendar] Item "rowId" should start with "gstcid-".');
        if (!rows[rowId]) {
            throw new Error(`[gantt-schedule-timeline-calendar] Row for item "${item.id}" does not exists ("${rowId}"). TIP: Try updating the rows first to make sure the rows for the items exist.`);
        }

        item.time.start = +item.time.start;
        item.time.end = +item.time.end;
        item.id = String(item.id);

        const configItem = this.state.get("config.chart.item");
        if ( "number" != typeof item.height ) {
            item.height = defaultItemHeight;
        }

        itemsData[item.id].time = {
            startDate: this.time.date(item.time.start),
            endDate: this.time.date(item.time.end)
        };

        itemsData[item.id].actualHeight = item.height;

        if ( null == item.overlap ) {
            item.overlap = configItem.overlap;
        }
        if ( "number" != typeof item.top ) {
            item.top = 0;
        }
        if ( !item.gap ) {
            item.gap = {};
        }

        if ( "number" != typeof item.gap.top ) {
            item.gap.top = configItem.gap.top;
        }

        if ( "number" != typeof item.gap.bottom ) {
            item.gap.bottom = configItem.gap.bottom;
        }

        if ( "number" != typeof item.minWidth ) {
            item.minWidth = configItem.minWidth;
        }

        itemsData[item.id].outerHeight = itemsData[item.id].actualHeight + item.gap.top + item.gap.bottom;
        itemsData[item.id].position.actualRowTop = itemsData[item.id].position.rowTop + item.gap.top;
    }

    prepareItems(items) {
        const defaultItemHeight = this.state.get("config.chart.item.height"),
            itemsData = this.getItemsData();

        this.itemsAsArray.length = 0;
        this.itemsDataAsArray.length = 0;
        for (const itemId in items) {
            const item = items[itemId];
            this.prepareItem(item, defaultItemHeight, itemsData, items);
            this.itemsAsArray.push(items[itemId]);
            this.itemsDataAsArray.push(itemsData[itemId]);
        }
        this.collectAllLinkedItems(items, itemsData);
        return items;
    }

    collectAllLinkedItems(items, itemsData) {
        const itemIds = Object.keys(items),
            dataItemIds = Object.keys(itemsData),
            notDataItemIds = itemIds.filter((id => !dataItemIds.includes(id)));
        
        if (notDataItemIds.length) {
            throw new Error(`Items with id [${notDataItemIds.join(", ")}] does not exists in "$data.chart.items". TIP: For performance reasons, state is mutable, so try not to modify items from the "state.get" method before you copy them (with "gstc.api.clone(items)" for example).`);
        }

        for (const itemId in items) {
            const item = items[itemId];
            itemsData[item.id].linkedWith = item.linkedWith || [];
        }

        const map = new Map;
        for (const itemId in itemsData) {
            
            if (map.has(itemId)) continue;

            const linkArr = this.getChildrenLinkedItemsIds(itemId, itemsData);
            itemsData[itemId].linkedWith.splice(itemsData[itemId].linkedWith.length, 0, ...linkArr);
            const tmpArr = Array.from(new Set(itemsData[itemId].linkedWith));
            itemsData[itemId].linkedWith = tmpArr.filter((id => id !== itemId)); 
            map.set(itemId, true);
            for (const tId of tmpArr) {
                itemsData[tId].linkedWith = tmpArr.filter((id => id !== tId));
                map.set(tId, true);
            }
            
        }
    }

    getChildrenDependantItemsIds(item, items, res = []) {
        if (item.dependant && item.dependant.length) {
            for (const id of item.dependant) {
                if (res.includes(id)) continue;

                res.push(id);
                const tmpItem = items[id];
                if (!tmpItem) throw new Error(`Dependant item not found [id:'${id}'] found in item [id:'${item.id}']`);
                if ( tmpItem.dependant && tmpItem.dependant.length ) {
                    this.getChildrenDependantItemsIds(tmpItem, items, res);
                } 
            }
        }
            
        return res;
    }

    getChildrenLinkedItemsIds(itemId, itemsData, res = []) {
        const itemData = itemsData[itemId];
        if (itemData.linkedWith && itemData.linkedWith.length) {
            if ( !res.includes(itemId) ) {
                res.push(itemId);
            }
            
            for (const iId of itemData.linkedWith) {
                if (res.includes(iId)) continue;
                res.push(iId);
                const itemData = itemsData[iId];
                if ( itemData.linkedWith && itemData.linkedWith.length ) {
                    this.getChildrenLinkedItemsIds(iId, itemsData, res);
                }
            }
        }
        return res;
    }

    setAllRowsIdsCache(rowIds) {
        //console.log("setAllRowsIdsCache", rowIds);
        this.allRowsIds = rowIds;
        const rows = this.state.get("config.list.rows");
        this.allRowsAsArray.length = 0;
        for (const rowId of rowIds) this.allRowsAsArray.push(rows[rowId]);
    }

    generateRowsWithParentsExpanded(rows) {
        const res = [],
            rowsData = this.getRowsData();

        t: for (const rowId in rows) {
            if (!rowsData[rowId] || !rowsData[rowId].parents) return [];
            if (this.isRowVisible(rowId)) {
                for (const pId of rowsData[rowId].parents) {
                    const tmpRow = rows[pId];
                    if (!tmpRow || !tmpRow.expanded) continue t;
                }
                res.push(rowId);
            }
        }
        this._updateRowsWithParentsExpandedCache(res);
        return res;
    }

    getRowInfoFromTop(wantedAbsolutePosition) {
        const rows = this.state.get("config.list.rows"),
            rowsData = this.state.get("$data.list.rows"),
            rowsPositionsMap = this.getRowPositionMapNode(wantedAbsolutePosition);
        return {
            dataIndex: rowsPositionsMap.dataIndex,
            row: rows[rowsPositionsMap.id],
            rowData: rowsData[rowsPositionsMap.id]
        }
    }

    getRowPositionMapNode(topPosition, rowsPositionsMap) {
        rowsPositionsMap = rowsPositionsMap || this.rowsPositionsMap;

        return topPosition >= rowsPositionsMap.keys[1] ? this.getRowPositionMapNode(topPosition, rowsPositionsMap[rowsPositionsMap.keys[1]]) : 
            topPosition >= rowsPositionsMap.keys[0] ? this.getRowPositionMapNode(topPosition, rowsPositionsMap[rowsPositionsMap.keys[0]]) : rowsPositionsMap;
    }

    measureRows() {
        if (this.isMutedMethod("measureRows")) return;
        const scrollVert = this.state.get("$data.scroll.vertical"),
            rows = this.state.get("config.list.rows"),
            realChartHeight = this.getRealChartHeight(),
            rowsData = this.getRowsData();

        if (null == scrollVert.dataIndex) return [];

        const rowsIds = this.state.get("$data.list.rowsIds");

        let n = 0;
        if (scrollVert.data && (n = this.rowsWithParentsExpandedDataIndexMap.get(scrollVert.data.id), -1 === n)) {
            const rowId = this.getLastRowId(i.rowsIdsWithParentsExpanded, scrollVert);
            n = this.rowsWithParentsExpandedDataIndexMap.get(rowId);
        }

        let top = 0,
            bottom = 0,
            i = 0;
        for (let len = rowsIds.length; i < len; i++) {
            const rowId = rowsIds[i],
                parentsExpanded = this.rowsWithParentsExpandedAsMap.has(rowId),
                rowTop = this.getRowViewTop(rowId, rowsData, scrollVert),
                inView = i >= n && rowTop <= realChartHeight,
                rowData = rowsData[rowId];

            if (!rowData) return [];

            this.recalculateRowHeight(rows[rowId], rowData), 
            rowData.inView = inView, 
            rowData.parentsExpanded = parentsExpanded, 
            rowData.position.top = top, 
            bottom = top + rowData.outerHeight, 
            rowData.position.bottom = bottom, 
            parentsExpanded && (top += rowData.outerHeight)
        }
        this.rowsPositionsMap = this.generateRowsPositionsMap(this.rowsDataWithParentsExpanded), 
        this.state.update("$data.list.rows", rowsData), 
        this.state.update("$data.list.rowsHeight", bottom), 
        this.state.update("$data.scroll.vertical.absoluteSize", bottom);
        return bottom;
    }

    _updateRowsWithParentsExpandedCache(cache) {
        this.rowsIdsWithParentsExpanded.length = 0;
        this.rowsIdsWithParentsExpanded.splice(0, 0, ...cache);
        this.rowsWithParentsExpanded.length = 0;
        this.rowsDataWithParentsExpanded.length = 0;
        this.rowsWithParentsExpandedDataIndexMap.clear();

        const rows = this.state.get("config.list.rows"),
            dataRows = this.state.get("$data.list.rows");
        
        this.rowsWithParentsExpandedAsMap.clear();

        let i = 0;
        for (const rowId of this.rowsIdsWithParentsExpanded) {
            const row = rows[rowId];
            if ( row ) {
                this.rowsWithParentsExpanded.push(row);
                this.rowsWithParentsExpandedAsMap.set(rowId, row);
                this.rowsDataWithParentsExpanded.push(dataRows[rowId]);
                this.rowsWithParentsExpandedDataIndexMap.set(rowId, i);
                i++;
            } 
        }
    }

    isRowVisible(rowId, rows, rowsData) {
        rows = rows || this.getAllRows();
        rowsData = rowsData || this.getRowsData();
        if (!rows[rowId]) return false;
        if (false === rows[rowId].visible) return false;
        if (!rowsData[rowId]) return false;
        const parents = rowsData[rowId].parents;
        for (const rowId of parents) {
            if (!rows[rowId] || false === rows[rowId].visible) return false;
        }
        return true;
    }

    getVisibleRows() {
        const scrollVertical = this.state.get("$data.scroll.vertical"),
            expandedRowIds = this.rowsIdsWithParentsExpanded,
            rowsData = this.getRowsData();

        if (!scrollVertical.data) return [];
        
        const clientHeight = this.getRealChartHeight();
        if (!clientHeight) return [];
        
        let vertRowIdx = this.rowsWithParentsExpandedDataIndexMap.get(scrollVertical.data.id); 
        
        if ( !(-1 !== vertRowIdx && void 0 !== vertRowIdx) ) {
            vertRowIdx = scrollVertical.dataIndex > this.rowsDataWithParentsExpanded.length - 1 ? expandedRowIds.length - scrollVertical.lastPageCount : scrollVertical.dataIndex;
        }

        const res = [];
        let rowTop, rowData;
        for (let i = vertRowIdx, len = expandedRowIds.length; i < len; i++) {
            const rowId = expandedRowIds[i];
            if ( rowsData[rowId] ) {
                rowData = rowsData[rowId];
                rowTop = this.getRowViewTop(rowId, rowsData, scrollVertical);
                if ( rowTop >= 0 && rowTop <= clientHeight ) {
                    res.push(rowId);
                    rowData.parentsExpanded = true;
                } else {
                    rowData.parentsExpanded = false;
                }
                if ( rowTop > clientHeight ) {
                    break;
                }
            }
        }
        //console.log("getVisibleRows", res);
        return res;
    }

    normalizeMouseWheelEvent(t) {
        let e = t.deltaX || 0,
            a = t.deltaY || 0,
            o = t.deltaZ || 0;
        const i = t.deltaMode,
            s = this.state.get("config.list.rowHeight");
        let n = 1;
        switch (i) {
            case 1:
                s && (n = s);
                break;
            case 2:
                n = window.height
        }
        return e *= n, a *= n, o *= n, {
            x: e,
            y: a,
            z: o,
            event: t
        }
    }

    getRowViewTop(rowId, rowsData, scrollVertical) {
        rowsData = rowsData || this.state.get("$data.list.rows");
        scrollVertical = scrollVertical || this.state.get("$data.scroll.vertical");
        return rowsData[rowId].position.top - scrollVertical.absolutePosPx - scrollVertical.preciseOffset;
    }

    parentsExpanded(rowId) {
        return this.rowsWithParentsExpandedAsMap.has(rowId);
    }

    recalculateRowHeight(row, rowData) {
        if (!rowData || !row || !row.gap) return 0;
        
        let h = 0;
        const itemsData = this.getItemsData();
        if (!itemsData) return 0;

        if (false === row.visible) {
            rowData.actualHeight = 0;
            rowData.outerHeight = 0;
            return 0;
        }

        const items = this.getItems(rowData.itemsOrder);
        this.fixOverlappedItems(items);
        
        for (const item of items) {
            const itemData = itemsData[item.id];
            h = Math.max(h, itemData.position.rowTop + itemData.outerHeight);
        }
        if (h < row.height) h = row.height;
        rowData.actualHeight = h;
        rowData.outerHeight = rowData.actualHeight + row.gap.top + row.gap.bottom;
        return rowData.outerHeight;
    }

    calculateVisibleRowsHeights() {
        if (this.isMutedMethod("calculateVisibleRowsHeights")) return;
        const visibleRows = this.state.get("$data.list.visibleRows");
        let h = 0;
        const rows = this.getAllRows(),
            rowsData = this.getRowsData();
        for (const rowId of visibleRows) h += this.recalculateRowHeight(rows[rowId], rowsData[rowId]);
        this.state.update("$data.list.visibleRowsHeight", h);
    }

    getRealChartHeight(withScrollBar = true) {
        const offset = this.state.get("$data.scroll.vertical.preciseOffset") || 0,
            clientHeight = withScrollBar ? this.state.get("config.innerHeight") : this.state.get("$data.chart.dimensions.heightWithoutScrollBar"),
            add = this.state.get("config.additionalSpace");
        return clientHeight - add.top - add.bottom + -1 * offset;
    }

    getLastRowId(rowsWithParentsExpanded, verticalScroll) {
        rowsWithParentsExpanded = rowsWithParentsExpanded || this.rowsIdsWithParentsExpanded;
        verticalScroll = verticalScroll || this.state.get("$data.scroll.vertical");

        return rowsWithParentsExpanded[this.getLastRowIndex(rowsWithParentsExpanded, verticalScroll)]
    }

    getLastRowIndex(rowsWithParentsExpanded, verticalScroll) {
        rowsWithParentsExpanded = rowsWithParentsExpanded || this.rowsIdsWithParentsExpanded;
        verticalScroll = verticalScroll || this.state.get("$data.scroll.vertical");
        return rowsWithParentsExpanded.length - verticalScr
        oll.lastPageCount;
    }
    generateRowsPositionsMap(rowsDataWithParentsExpanded, start = 0, res = {
        id: "",
        dataIndex: 0,
        keys: []
    }) {
        if (0 === rowsDataWithParentsExpanded.length) return res;

        if (1 === rowsDataWithParentsExpanded.length) {
            res[rowsDataWithParentsExpanded[0].position.top] = {
                id: rowsDataWithParentsExpanded[0].id,
                dataIndex: start,
                keys: []
            };
            res.keys = [rowsDataWithParentsExpanded[0].position.top];
            return res;
        }
            
        const len = Math.floor(rowsDataWithParentsExpanded.length / 2),
            sIdx = start,
            eIdx = start + len,
            leftExpand = rowsDataWithParentsExpanded.slice(1, len),
            rightExpand = rowsDataWithParentsExpanded.slice(len + 1);
        
        res.keys.push(rowsDataWithParentsExpanded[0].position.top), res.keys.push(rowsDataWithParentsExpanded[len].position.top);

        const first = res[rowsDataWithParentsExpanded[0].position.top] = {
                id: rowsDataWithParentsExpanded[0].id,
                dataIndex: sIdx,
                keys: []
            },
            second = res[rowsDataWithParentsExpanded[len].position.top] = {
                id: rowsDataWithParentsExpanded[len].id,
                dataIndex: eIdx,
                keys: []
            };
        
        this.generateRowsPositionsMap(leftExpand, sIdx + 1, first);
        this.generateRowsPositionsMap(rightExpand, eIdx + 1, second);
        return res;
    }

    calculateItemVerticalPosition(itemId, itemData = null, rowData = null, item = null) {
        item || (item = this.getItem(itemId));
        itemData || (itemData = this.getItemData(itemId));
        rowData || (rowData = this.getRowData(item.rowId));
        item.gap && itemData || (this.prepareItem(item), itemData = this.getItemData(itemId));

        if (!rowData) return itemData.position;

        const top = rowData.position.top + item.gap.top,
            actualRowTop = itemData.position.rowTop + item.gap.top,
            rowViewTop = this.getRowViewTop(rowData.id);

        let viewTop = rowViewTop + itemData.position.actualRowTop;

        if ( rowViewTop === 1 / 0 ) {
            viewTop = 1 / 0;     
        } else if ( -1 === rowViewTop ) {
            viewTop = -1;
        }
        itemData.position.top = top;
        itemData.position.actualRowTop = actualRowTop;
        itemData.position.viewTop = viewTop;

        return itemData.position;
    }

    calculateInitialChartWidth(withoutScrollBar = false) {
        const initialWidth = this.state.get("config.initialWidth"),
            columnsData = this.state.get("config.list.columns.data");

        let colsWidth = 0;
        for (const colId in columnsData) {
            colsWidth += columnsData[colId].width;
        }
        let w = initialWidth - colsWidth;
        if ( withoutScrollBar ) {
            w -= this.state.get("config.scroll.horizontal.width");
            //console.log("w", w);
            if ( !w ) w = 0;
            //console.log("w111", w);
        }
        return w;
    }
    
    getChartWidth(withoutScrollBar = false) {
        /*
        let e = t ? this.state.get("$data.chart.dimensions.widthWithoutScrollBar") : this.state.get("$data.chart.dimensions.width");
        return e || (e = this.calculateInitialChartWidth(t)), e
        */
        
        let w = withoutScrollBar ? this.state.get("$data.chart.dimensions.widthWithoutScrollBar") : this.state.get("$data.chart.dimensions.width");
        if ( !w ) {
            w = this.calculateInitialChartWidth(withoutScrollBar);
        }
        return w;
    }

    resetHorizontalScroll(horizontalScroll) {

        horizontalScroll = horizontalScroll || this.state.get("$data.scroll.horizontal");

        horizontalScroll.data = null;
        horizontalScroll.dataId = "";
        horizontalScroll.dataIndex = 0; 
        horizontalScroll.handlePosPx = 0; 
        horizontalScroll.absolutePosPx = 0; 
        horizontalScroll.preciseOffset = 0;

        const time = this.state.get("$data.chart.time");
        if (!time.allDates || !time.allDates.length) return;

        const a = time.allDates[time.level];
        if (!allDates || !allDates.length) return;

        const dts = allDates[0];
        horizontalScroll.data = Object.assign({}, dts);
        horizontalScroll.dataId = dts.id;
        return horizontalScroll;
    }

    resetVerticalScroll(t = this.state.get("$data.scroll.vertical")) {
        return t.data = null, t.dataId = "", t.dataIndex = 0, t.handlePosPx = 0, t.absolutePosPx = 0, t.preciseOffset = 0, t.data = null, t.dataId = null, t
    }

    limitHorizontalScrollToView(t = this.state.get("$data.chart.time")) {
        const e = this.state.get("$data.scroll.horizontal");
        if (!t.allDates || !t.allDates.length) return;
        const a = t.allDates[t.level].length - e.lastPageCount;
        e.dataIndex > a && this.setScrollLeft(a, 0, t)
    }

    getScrollSize(kind) {
        const innerW = this.state.get("$data.scroll.vertical.visible") ? this.state.get("$data.chart.dimensions.widthWithoutScrollBar") : this.state.get("$data.chart.dimensions.width"),
            innerH = this.state.get("$data.scroll.horizontal.visible") ? this.state.get("$data.chart.dimensions.heightWithoutScrollBar") : this.state.get("$data.chart.dimensions.innerHeight"),
            add = this.state.get("config.additionalSpace");
        return "horizontal" === kind ? innerW : innerH - add.top - add.bottom;
    }

    calculateHorizontalScrollSizeAndPosFromDates(totalViewDurationPx, time, scrollHorizontal, shouldUpdate = true) {
        time = time || this.state.get("$data.chart.time");
        scrollHorizontal = scrollHorizontal || this.state.get("$data.scroll.horizontal");

        if (!time.allDates.length) return;

        const allDates = time.allDates[time.level],
            isVert = this.state.get("$data.scroll.vertical.visible"),
            chartWidth = this.getChartWidth(isVert),
            offset = totalViewDurationPx,
            { lastPageSize, lastPageCount } = this.getLastPageDatesWidth(chartWidth, allDates),
            d = offset - lastPageSize,
            horiz = this.state.get("config.scroll.horizontal"),
            horizSize = this.getScrollSize("horizontal");

        let innerHandleSize = lastPageSize / offset * horizSize;

        if ( innerHandleSize < horiz.minInnerSize ) {
            innerHandleSize = horiz.minInnerSize;
        }

        const isHoriz = scrollHorizontal.visible,
            nIsHoriz = !(lastPageCount === allDates.length || horizSize === innerHandleSize),
            max = Math.max(horizSize ? horizSize - innerHandleSize : 0, 0);

        scrollHorizontal.absoluteSize = offset;
        scrollHorizontal.absoluteSizeWithoutLastPage = Math.max(d, 0);
        scrollHorizontal.innerHandleSize = innerHandleSize;
        scrollHorizontal.maxHandlePosPx = max;
        scrollHorizontal.scrollSize = nIsHoriz ? horizSize : 0;
        scrollHorizontal.lastPageCount = lastPageCount;
        scrollHorizontal.lastPageSize = lastPageSize;
        scrollHorizontal.visible = nIsHoriz;
        this.calculateHorizontalScrollPosPxFromDates(scrollHorizontal.dataId, scrollHorizontal.preciseOffset, scrollHorizontal, time);
        if ( shouldUpdate ) {
            this.state.update("$data.scroll.horizontal", scrollHorizontal);
        }
        
        if ( isHoriz !== nIsHoriz ) this.calculateVerticalScrollSize();

        return scrollHorizontal;
    }

    setScrollLeftByPixels(offsetLeft) {
        const time = this.state.get("$data.chart.time"),
            dates = time.allDates[time.level];

        if ( dates && dates.length ) {
            if ( offsetLeft < 0 ) {
                offsetLeft = 0;
            }
            this.state.update("$data.scroll.horizontal", (value => {
                if ( offsetLeft > value.absoluteSizeWithoutLastPage ) {
                    offsetLeft = value.absoluteSizeWithoutLastPage;
                }
                let i = 0;
                const roundOffsetLeft = Math.round(offsetLeft);
                let dt;
                for (dt of dates) {
                    if (Math.round(dt.rightPx) > roundOffsetLeft) break;
                    i++;
                }
                value.dataIndex = i;
                value.dataId = dt.id;
                value.preciseOffset = dt.leftPx - offsetLeft;
                this.calculateHorizontalScrollSizeAndPosFromDates(time.totalViewDurationPx, time, value, false);
                offsetLeft = value.absolutePosPx;
                return value;
            }), {
                data: "set-scroll-left"
            });
            return offsetLeft;
        }
        return 0;
    }

    setScrollLeft(dataIndexOrDateId, offset = 0, time = this.state.get("$data.chart.time")) {
        
        if (time.calculatedZoomMode) return 0;

        if (this.state.get("config.scroll.horizontal.byPixels")) {
            if ("number" != typeof dataIndexOrDateId) {
                throw new Error("When 'config.scroll.horizontal.byPixels' is true, 'dataIndexOrDateId' must be a number.");
            }
            if ( dataIndexOrDateId < 0 ) dataIndexOrDateId = 0;
            return this.setScrollLeftByPixels(dataIndexOrDateId);
        }
        let px = 0;
        const dates = time.allDates[time.level];
        return dates && dates.length ? (this.state.update("$data.scroll.horizontal", (value => {
            let dataIndex, dt;
            if ("number" == typeof dataIndexOrDateId || "" === dataIndexOrDateId) {
                dataIndex = dataIndexOrDateId;
                dt = dates[dataIndex];
            } else if ("string" == typeof dataIndexOrDateId)
                for (let e = 0; e < dates.length; e++)
                    if (dates[e].id === dataIndexOrDateId) {
                        dt = dates[e], dataIndex = e;
                        break
                    } 
            return dt || (dataIndex > 0 ? (dataIndex = dates.length - 1, dt = dates[dataIndex]) : (dataIndex = 0, dt = dates[0])), 
            value.dataIndex = dataIndex, 
            value.dataId = dt.id, 
            value.preciseOffset = offset, 
            this.calculateHorizontalScrollSizeAndPosFromDates(time.totalViewDurationPx, time, value, false), 
            px = value.absolutePosPx, 
            value;
        }), {
            data: "set-scroll-left"
        }), px) : 0
    }
    scrollToTime(toTime, centered = true) {
        const time = this.state.get("$data.chart.time");
        if (time.calculatedZoomMode) return 0;
        if (!time.allDates) return 0;

        const dt = this.time.findDateAtTime(toTime, time.allDates[time.level]);

        if (!dt) {
            console.warn(`[gstc.api.scrollToTime] Time out of bounds (${toTime} -> ${this.time.date(toTime).format("YYYY-MM-DD HH:mm:ss")}).`);
            return 0;
        }
        let tmpDt, timeIdx = 0,
            tmpPx = 0;
        if (centered) {
            const chartWidthCenter = this.getChartWidth(true) / 2;
            tmpPx = (toTime - dt.leftGlobal) / time.timePerPixel;
            if ( dt.rightPx < chartWidthCenter ) {
                tmpPx = 0;
            }
            const l = -(chartWidthCenter - tmpPx);
            tmpDt = this.time.getMainDateFromRelativePosition(dt, l);
            if (!tmpDt) {
                console.warn(`[gstc.api.scrollToTime] Time out of bounds (${toTime} -> ${this.time.date(toTime).format("YYYY-MM-DD HH:mm:ss")}).`);
                return 0;
            }
            timeIdx = time.allDates[time.level].indexOf(tmpDt);
        } else {
            timeIdx = time.allDates[time.level].indexOf(dt);
            tmpPx = (toTime - dt.leftGlobal) / time.timePerPixel;
            tmpDt = dt;
        }
        if (-1 === timeIdx) return 0;
        return this.state.get("config.scroll.horizontal").byPixels ? this.setScrollLeft(tmpDt.leftPx + (centered ? tmpDt.width / 2 : 0)) : this.setScrollLeft(timeIdx, -tmpPx)
    }
    getScrollLeft() {
        return this.state.get("$data.scroll.horizontal")
    }

    calculateHorizontalScrollPosPxFromDates(dataId, preciseOffset = 0, scrollHorizontal, time) {
        time = time || this.state.get("$data.chart.time");
        scrollHorizontal = scrollHorizontal || this.state.get("$data.scroll.horizontal");

        if (time.calculatedZoomMode) return 0;

        if ( dataId == null ) dataId = 0;
        
        if (!time.allDates || !time.allDates.length) return;

        const allDates = time.allDates[time.level];
        
        if (!allDates || !allDates.length) return;
        
        let tmpDt, offset = 0,
            dateIdx = 0;
        
        if ("number" == typeof dataId || "" === dataId) {
            if ( "" === dataId ) dataId = 0;
            dateIdx = dataId;
            tmpDt = allDates[dateIdx];
            if ( !tmpDt ) {
                dateIdx = 0;
                tmpDt = allDates[dateIdx];
            } 
            
            const idx = time.allDates[time.level].length - scrollHorizontal.lastPageCount;

            if ( dateIdx > idx && idx >= 0 ) {
                dateIdx = idx;
                tmpDt = allDates[dateIdx];
            }

        } else if ("string" == typeof dataId) {
            for (let i = 0; i < allDates.length; i++) {
                const dt = allDates[i];
                if (dt.id === dataId) {
                    tmpDt = dt;
                    dateIdx = i;
                    break;
                }
            }
        }
            
        if (!tmpDt && scrollHorizontal.data) {
            for (let i = 0; i < allDates.length; i++) {
                const dt = allDates[i];
                if (dt.leftGlobal >= scrollHorizontal.data.leftGlobal) {
                    tmpDt = dt;
                    dateIdx = i;
                    break;
                }
            }
        }
        
        if ( !tmpDt ) {
            if ( dateIdx > 0 ) {
                dateIdx = allDates.length - 1;
                tmpDt = allDates[dateIdx];
            } else {
                tmpDt = allDates[0];
                dateIdx = 0;
            }
        }
        
        if ( dateIdx > allDates.length - scrollHorizontal.lastPageCount ) {
            dateIdx = allDates.length - scrollHorizontal.lastPageCount;
            tmpDt = allDates[dateIdx];
        }
        
        scrollHorizontal.data = Object.assign({}, tmpDt);
        offset = tmpDt.leftPx - preciseOffset;
        scrollHorizontal.dataIndex = dateIdx;
        scrollHorizontal.dataId = tmpDt.id;

        if (offset) {
            const px = offset / scrollHorizontal.absoluteSizeWithoutLastPage * scrollHorizontal.maxHandlePosPx;
            scrollHorizontal.handlePosPx = Math.max(px, 0);
        } else scrollHorizontal.handlePosPx = 0;

        if ( scrollHorizontal.handlePosPx > scrollHorizontal.maxHandlePosPx ) {
            scrollHorizontal.handlePosPx = Math.max(scrollHorizontal.maxHandlePosPx, 0);
        }
        
        scrollHorizontal.preciseOffset = preciseOffset;
        if ( scrollHorizontal.maxHandlePosPx > 0 ) {
            scrollHorizontal.percent = scrollHorizontal.handlePosPx / scrollHorizontal.maxHandlePosPx * 100;
        } else {
            scrollHorizontal.percent = 0;
        }
        
        scrollHorizontal.absolutePosPx = Math.max(offset, 0);
        return scrollHorizontal;
    }

    isHorizontalScrollVisible(withoutScrollBar) {
        const dataHoriz = this.state.get("$data.scroll.horizontal");
        
        if (dataHoriz && null != dataHoriz.data) return dataHoriz.visible;

        const horizontal = this.state.get("config.scroll.horizontal"),
            time = this.state.get("$data.chart.time"),
            px = time.totalViewDurationPx,
            chartWidth = this.getChartWidth(withoutScrollBar),
            allDates = time.allDates[time.level];

        if (!allDates || !allDates.length) return false;

        const { lastPageSize, lastPageCount } = this.getLastPageDatesWidth(chartWidth, allDates), 
            hScrollSize = this.getScrollSize("horizontal");

        let innerWidth = lastPageSize / px * hScrollSize;
        if ( innerWidth < horizontal.minInnerSize  ) {
            innerWidth = horizontal.minInnerSize;
        }
        return !(lastPageCount === allDates.length || hScrollSize === innerWidth);
    }

    getLastPageRowsHeight(height, rowsWithParentsExpanded) {
        let lastPageSize = 0,
            lastPageCount = 0;

        const add = this.state.get("config.additionalSpace"),
            innerHeight = height - add.top - add.bottom;

        if (0 === rowsWithParentsExpanded.length) {
            return {
                lastPageSize,
                lastPageCount
            };
        }
        
        const rowsData = this.getRowsData();
        for (let i = rowsWithParentsExpanded.length - 1; i >= 0; i--) {
            const rowData = rowsData[rowsWithParentsExpanded[i]];
            lastPageSize += rowData.outerHeight;
            if (lastPageSize >= innerHeight) {
                lastPageSize -= rowData.outerHeight;
                break;
            }
            lastPageCount++;
        }
        if ( 0 === lastPageSize ) {
            lastPageSize = height;
        }

        const vert = this.state.get("config.scroll.vertical");
        if (vert.byPixels || vert.precise) {
            lastPageSize = height;
        }

        return {
            lastPageSize,
            lastPageCount
        };
    }

    calculateVerticalScrollSize() {
        const rowsWithParentsExpanded = this.state.get("$data.list.rowsWithParentsExpanded"),
            rowsHeight = this.state.get("$data.list.rowsHeight"),
            innerHeight = this.isHorizontalScrollVisible(true) ? this.state.get("$data.chart.dimensions.heightWithoutScrollBar") : this.state.get("$data.chart.dimensions.innerHeight"),
            { lastPageSize, lastPageCount } = this.getLastPageRowsHeight(innerHeight, rowsWithParentsExpanded),
            vert = this.state.get("config.scroll.vertical"),
            tmpH = innerHeight;

        let vertSize = lastPageSize / rowsHeight * tmpH;

        if ( vertSize < vert.minInnerSize ) {
            vertSize = vert.minInnerSize;
        }

        const isVert = !(lastPageCount === rowsWithParentsExpanded.length || tmpH === vertSize),
            posPx = tmpH - vertSize;

        this.state.update("$data.scroll.vertical", (a => {
            a.absoluteSize = rowsHeight;
            a.absoluteSizeWithoutLastPage = rowsHeight - lastPageSize;
            a.innerHandleSize = vertSize;
            a.maxHandlePosPx = posPx;
            a.scrollSize = isVert ? tmpH : 0;
            a.lastPageCount = lastPageCount;
            a.lastPageSize = lastPageSize;
            if ( a.handlePosPx > posPx ) {
                a.handlePosPx = posPx;
            }

            if (a.dataIndex > rowsWithParentsExpanded.length - lastPageCount) {
                const rows = this.getAllRows(),
                    rowsData = this.getRowsData();
                
                a.dataIndex = rowsWithParentsExpanded.length - lastPageCount;
                const rowId = rowsWithParentsExpanded[a.dataIndex];

                if ( rows && rowId  ) {
                    a.data = rows[rowId], 
                    a.dataId = a.data.id, 
                    a.absolutePosPx = rowsData[rowId].position.top
                } else {
                    a.dataIndex = 0, 
                    a.dataId = "", 
                    a.data = null, 
                    a.handlePosPx = 0, 
                    a.absolutePosPx = 0
                }
                a.preciseOffset = 0;
            } else {
                const rowsData = this.getRowsData(),
                    rowId = rowsWithParentsExpanded[a.dataIndex];

                if ( rowsData[rowId] ) {
                    a.data = rowsData[rowId];
                    a.dataId = rowId;
                    a.absolutePosPx = a.data.position.top - a.preciseOffset;
                }
            }
            a.visible = isVert;
            return a;
        }))
    }

    setScrollTopByPixels(offsetTop) {
        const abSz = this.state.get("$data.scroll.vertical.absoluteSizeWithoutLastPage");
            offsetTop > abSz && (offsetTop = abSz);

        let { dataIndex, row, rowData } = this.getRowInfoFromTop(offsetTop);
        if (!rowData) return;

        const offset = rowData.position.top - offsetTop;
        this.state.update("$data.scroll.vertical", (value => {
            const tmpDataIndex = this.rowsWithParentsExpanded.length - value.lastPageCount;
            if (dataIndex > tmpDataIndex) {
                dataIndex = tmpDataIndex;
                row = this.rowsWithParentsExpanded[dataIndex];
                if (!row && (dataIndex = 0, row = this.rowsWithParentsExpanded[dataIndex], !row)) return offsetTop = 0;
                this.resetVerticalScroll(value);
                rowData = this.getRowData(row.id)
            }
            value.data = this.rowsWithParentsExpanded[dataIndex];
            value.dataId = value.data.id;
            value.preciseOffset = offset;
            value.handlePosPx = offsetTop ? Math.round(offsetTop / value.absoluteSizeWithoutLastPage * value.maxHandlePosPx) : 0;
            value.handlePosPx > value.maxHandlePosPx && (value.handlePosPx = value.maxHandlePosPx);
            value.percent = value.handlePosPx / value.maxHandlePosPx * 100;
            value.dataIndex = dataIndex;
            value.absolutePosPx = offsetTop;
            return value;
        }), {
            data: "set-scroll-top"
        });
        return offsetTop;
    }
    setScrollTop(dataIndexOrRowId = 0, offset = 0) {
        if (this.state.get("config.scroll.vertical.byPixels")) {
            if ("number" != typeof dataIndexOrRowId) {
                throw new Error("When 'config.scroll.vertical.byPixels' is true, 'dataIndexOrRowId' must be a number.");
            }
            if ( dataIndexOrRowId < 0 ) {
                dataIndexOrRowId = 0;
            }
            return this.setScrollTopByPixels(dataIndexOrRowId);
        }
        const rowsIds = this.rowsIdsWithParentsExpanded;

        let row, rowData, dataIndex = 0;
        
        if ("string" == typeof dataIndexOrRowId) {
            const rowId = dataIndexOrRowId;
            row = this.getRow(rowId);
            rowData = this.getRowData(row.id);
            if (this.parentsExpanded(rowId)){
                dataIndex = rowsIds.indexOf(rowId);
            } else {
                for (const t of rowData.parents) {
                    if ( this.parentsExpanded(t) ) {
                        dataIndex = rowsIds.indexOf(t);
                    }
                }
            }
                
            if (!row) {
                throw new Error(`Row with id: '${rowId}' not found. Maybe use GSTC.api.GSTCID(id) or check if row exists.`);
            }
        } else {
            if ("number" != typeof dataIndexOrRowId) {
                throw new Error("[gstc.api.setScrollTop] Wrong dataIndex value. Must be `string` (for `rowId`) or `number` (for array index) only.");
            }
            dataIndex = dataIndexOrRowId;
            this.rowsWithParentsExpanded[dataIndex] || 0 === dataIndex || (dataIndex = 0);
            if (!this.rowsWithParentsExpanded[dataIndex]) return;
            row = this.rowsWithParentsExpanded[dataIndex], 
            rowData = this.getRowData(row.id)
        }
        let l = 0;
        return this.state.update("$data.scroll.vertical", (t => {
            const o = this.rowsWithParentsExpanded.length - t.lastPageCount;
            if (dataIndex > o) {
                if (dataIndex = o, row = this.rowsWithParentsExpanded[dataIndex], !row && (dataIndex = 0, row = this.rowsWithParentsExpanded[dataIndex], !row)) return l = 0, 
                this.resetVerticalScroll(t);
                rowData = this.getRowData(row.id)
            }
            return l = rowData.position.top - offset,
             t.data = this.rowsWithParentsExpanded[dataIndex], 
             t.dataId = t.data.id, 
             t.preciseOffset = offset, 
             t.handlePosPx = l ? Math.round(l / t.absoluteSizeWithoutLastPage * t.maxHandlePosPx) : 0, 
             t.handlePosPx > t.maxHandlePosPx && (t.handlePosPx = t.maxHandlePosPx), 
             t.percent = t.handlePosPx / t.maxHandlePosPx * 100, 
             t.dataIndex = dataIndex, 
             t.absolutePosPx = l, 
             t
        }), {
            data: "set-scroll-top"
        }), l
    }
    getScrollTop() {
        return this.state.get("$data.scroll.vertical")
    }

    getCurrentCalendarLevels() {
        return this.state.get("$data.chart.time.levels")
    }

    getGridCells(cellIds = null) {
        const cells = this.state.get("$data.chart.grid.cells");
        if (!cellIds) return [];
        if (null != cellIds) {
            const len = cellIds.length,
                res = new Array(len);
            for (let i = 0; i < len; i++) res[i] = cells[cellIds[i]];
            return res;
        }
        return Object.values(cells)
    }
    getAllGridCells() {
        return this.state.get("$data.chart.grid.cells");
    }
    getGridRows(rowIds = null) {
        const rows = this.state.get("$data.chart.grid.rows");
        if ( null != rowIds ) {
            if ( rows ) {
                return Object.values(rows).filter((gridRow => rowIds.includes(gridRow.row.id)))
            } else {
                return [];
            }
        } else {
            if ( rows ) {
                return Object.values(rows);
            } else {
                return [];
            }
        }
    }
    getAllGridRows() {
        return this.state.get("$data.chart.grid.rows")
    }
    getGridCell(t) {
        return this.state.get(`$data.chart.grid.cells.${t}`)
    }
    getGridRow(t) {
        return this.state.get(`$data.chart.grid.rows.${t}`)
    }

    // main .js
    initializePlugins() {
        let pluginsMap = new Map;

        this.unsubscribes.push(this.state.subscribe("config.plugins", (value => {
            if (null != value && Array.isArray(value)) {
                pluginsMap.forEach(((func, pluginInstance) => {
                    if ( !value.includes(pluginInstance) ) {
                        func();
                        pluginsMap.delete(pluginInstance);
                    }
                }));

                for (const func of value) {
                    if (pluginsMap.has(func)) continue;
                    
                    let pluginInstance = func({
                        gapi: this,
                        state: this.state
                    });

                    if ( "function" != typeof pluginInstance &&
                        Object.prototype.hasOwnProperty.call(pluginInstance, "destroy")
                    ) {
                        pluginInstance = pluginInstance.destroy.bind(pluginInstance);    
                    } else if ( "function" != typeof pluginInstance ) {
                        pluginInstance = () => {};
                    }

                    pluginsMap.set(func, pluginInstance);
                }
            }
            this.debug && console.log("Plugins initialized.");
        })));

        let debug = this.debug;
        function PluginsDestroy() {
            pluginsMap.forEach((destroyFunc => destroyFunc()));
            pluginsMap.clear();
            debug && console.log("Plugins destroyed.");
        }

        this.unsubscribes.push(PluginsDestroy);
    }

    heightChange() {
        if (this.isMutedMethod("heightChange")) return;
        
        const config = this.state.get("config"),
            horizSize = this.state.get("config.scroll.horizontal.width"),
            realInnerHeight = config.innerHeight - horizSize;

        this.state.multi(true).update("$data.chart.dimensions.heightWithoutScrollBar", realInnerHeight)
            .update("$data.chart.dimensions.innerHeight", config.innerHeight)
            .update("$data.chart.dimensions.height", config.innerHeight + config.headerHeight)
            .update("$data.height", config.innerHeight + config.headerHeight)
            .done();
        this.calculateVerticalScrollSize();
        //update();
    }

    resizerActiveChange(t) {
        // active: boolean
        //c = t, f.className = C(a.name), c && (f.className += ` ${a.name}__list-column-header-resizer--active`), s()
    }

    generateTreeFromVisibleRows() {
        // a => api
        //if (a.isMutedMethod("generateTreeFromVisibleRows")) return;
        const visibleRowsId = this.getVisibleRowsId(),
            rows = this.getAllRows(),
            rowsData = this.getRowsData(),
            tmpRowsData = {},
            items = this.state.get("config.chart.items"),
            tmpItems = {};
        for (const rowId of visibleRowsId) {
            rows[rowId];
            const rowData = rowsData[rowId];
            tmpRowsData[rowId] = rowData;
            for (const itemId of rowData.items) {
                tmpItems[itemId] = items[itemId];
            }
        }
        this.makeTreeMap(tmpRowsData, tmpItems, true);
        
        //update();
    }

    generateTree(fullReload = true) {
        // fullReload?: boolean
        let rowsIds = this.state.get("$data.list.rowsIds");
        if (!rowsIds) return;
        rowsIds = rowsIds.slice();
        const rows = this.state.get("config.list.rows");
        if (!fullReload) return this.generateTreeFromVisibleRows();
        this.fillEmptyRowValues(rows);

        let tmpRows = this.getAllRows();
        const rowsData = this.getRowsData(),
            items = this.state.get("config.chart.items");

        this.makeTreeMap(rowsData, items);
        tmpRows = this.sortRowsByChildren(Object.values(tmpRows).map((row => row.id)));
        this.state.get("config").list.rows = tmpRows;
        this.prepareItems(items);
        const rowIds = Object.keys(tmpRows);
        this.state.update("$data.list.rowsIds", rowIds);
        this.setAllRowsIdsCache(rowIds);
    }

    prepareExpanded() {
        //if (a.isMutedMethod("prepareExpanded")) return;
        const rows = this.getAllRows();
        if (!rows) return;
        const expandedRows = this.generateRowsWithParentsExpanded(rows);
        this.state.update("$data.list.rowsWithParentsExpanded", expandedRows);
    }

    generateVisibleRowsAndItems() {
        if (this.isMutedMethod("generateVisibleRowsAndItems")) return;
        const visibleRowIds = this.getVisibleRows(),
            curVisibleRowIds = this.state.get("$data.list.visibleRows") || [];

        let changed = true;

        if ( visibleRowIds.length !== curVisibleRowIds.length ) {
           changed = true;
        } else {
            if ( visibleRowIds.length ) {
                changed = visibleRowIds.join("|") !== curVisibleRowIds.join("|");
            }
        }
       let n = this.state.multi(true);
    
       if ( changed ) {
            n = n.update("$data.list.visibleRows", visibleRowIds);
       }
       
        const itemIds = [],
            rowsData = this.getRowsData();
        for (const rowId of visibleRowIds) {
            const rowData = rowsData[rowId];
            for (const itemId of rowData.items) itemIds.push(itemId);
        }
        const visibleItemsIds = this.state.get("$data.chart.visibleItems") || [];
        if ( itemIds.join("|") !== visibleItemsIds.join("|") ) {
            n = n.update("$data.chart.visibleItems", itemIds);
        }

        n.done();
        /*
        itemIds.join("|") !== visibleItemsIds.join("|") && (n = n.update("$data.chart.visibleItems", itemIds)), n.done(), update()
        */
    }

    updateItemsVerticalPositions() {
        const items = this.getAllItems(),
            itemsData = this.getItemsData(),
            rowsData = this.getRowsData(),
            visibleRowIds = this.getVisibleRows(),
            visibleItemIds = [];

        for (const rowId of visibleRowIds) {
            const rowData = rowsData[rowId];
            if (rowData) {
                for (const itemId of rowData.items) {
                    if ( !visibleItemIds.includes(itemId) ) {
                        visibleItemIds.push(itemId);
                    }
                } 
            }
                
        }
        for (const itemId of visibleItemIds) {
            const item = items[itemId];
            if ( item ) {
                this.calculateItemVerticalPosition(itemId, itemsData[itemId], rowsData[item.rowId]);
            }
        }
    }

    /**/
    getMutedListeners() {
        const t = [];
        return this.state.isMutedListener(this.bindFullReload) && t.push(this.bindFullReload), 
            this.state.isMutedListener(this.bindPartialReload) && t.push(this.bindPartialReload), 
            this.state.isMutedListener(this.bindMinimalReload) && t.push(this.bindMinimalReload), t
    }

    triggerLoadedEvent() {
        Promise.resolve().then((() => {
            const t = this.state.get("$data.elements.main");
            if (!t) return;
            const e = t.parentNode;
            if (!e) return;
            const a = new Event("gstc-loaded");
            t.dispatchEvent(a), e.dispatchEvent(a)
        }))
    }
    
    getLastPageDatesWidth(chartWidth, allDates) {
        let pSize = 0,
            cnt = 0;
        if (0 === allDates.length) return {
            lastPageSize: pSize,
            lastPageCount: cnt
        };

        const configHorz = this.state.get("config.scroll.horizontal"),
            accurate = configHorz.byPixels || configHorz.precise;

        for (let i = allDates.length - 1; i >= 0; i--) {
            const dt = allDates[i];
            if (pSize += dt.width, pSize >= chartWidth) {
                pSize -= dt.width;
                break;
            }
            cnt++;
        }
        return 0 === pSize && (pSize = chartWidth), accurate && (pSize = chartWidth), {
            lastPageSize: pSize,
            lastPageCount: cnt
        }
    }

    formatDate(formatting, date, localeName) {
        /*
        const i = C("chart-calendar-date");
        return formatting.format({
            timeStart: date.leftGlobalDate.locale(localeName),
            timeEnd: date.rightGlobalDate.locale(localeName),
            vido: t,
            className: i,
            props: {
                date: date
            }
        })
        */
        return formatting.format({
            timeStart: date.leftGlobalDate.locale(localeName),
            timeEnd: date.rightGlobalDate.locale(localeName),
            date: date,
            className: "br-chart-calendar-date"
        });
    }

    generatePeriodDates(formatting, time, level, levelIndex) {
        //formatting
        //zoomTo: number;
        //period: Period;
        //periodIncrement?: number | CharCalendarLevelFormatFunction;
        //main?: boolean;
        //text: datefmt text
        //date: date

        const period = formatting.period,
            leftDate = time.fromDate,
            rightDate = time.toDate,
            localeName = this.state.get("config.locale.name");

        let dates = this.time.generatePeriodDates({
            leftDate,
            rightDate,
            level,
            levelIndex,
            period,
            time,
            callOnDate: false,
            callOnLevelDates: true
        });

        dates = this.time.recalculateDatesWidths(dates, time);
        if ( levelIndex !== time.level ) {
            dates = this.time.alignLevelToMain(levelIndex, dates, time);
        }
        dates = this.time.recalculateDatesPositions(dates, time, false, false);

        for (const dt of dates) {
            //dt.formatted = this.formatDate(formatting, dt, localeName);
            dt.formatted =  lodash.partial(this.formatDate, formatting, dt, localeName);
        }
        return dates;
    }

    limitGlobal(time) {
        if ( time.leftGlobal < time.from ) {
            time.leftGlobal = time.from;
            time.leftGlobalDate = this.time.date(time.leftGlobal);
            time.leftGlobal = time.leftGlobalDate.valueOf();
        }

        if ( time.rightGlobal > time.to ) {
            time.rightGlobal = time.to;
            time.rightGlobalDate = this.time.date(time.rightGlobal);
            time.rightGlobal = time.rightGlobalDate.valueOf();
        }
        return time;
    } 
    
    setCenter(time) {
        let diffMill = Math.floor(time.rightGlobalDate.diff(time.leftGlobalDate, "millisecond", true) / 2);
        const dataChartTime = this.time.getRightViewDate(time);
        if ( dataChartTime ) {
            if ( dataChartTime.width !== dataChartTime.currentView.width ) {
                diffMill -= (dataChartTime.width - dataChartTime.currentView.width) * time.timePerPixel;
            }
            time.centerGlobalDate = time.leftGlobalDate.add(diffMill, "millisecond");
            time.centerGlobal = time.centerGlobalDate.valueOf();
        }
    }

    guessPeriod(time, levels) {
        if (!time.zoom) return time;
        for (const level of levels) {
            const calendarLevelFormat = level.find((ctime => +time.zoom <= +ctime.zoomTo));
            if ( calendarLevelFormat && calendarLevelFormat.main ) {
                time.period = calendarLevelFormat.period;
            }
        }
        return time;
    }

    getFormatAndLevelIndexForZoom(zoom, levels) {
        levels = levels || this.state.get("config.chart.calendarLevels");

        let idx = 0,
            levelIndex = 0;
        for (const level of levels) {
            for (const calendarLevelFormat of level) {
                if (calendarLevelFormat.main && zoom <= calendarLevelFormat.zoomTo) {
                    levelIndex = idx;
                    return {
                        levelIndex,
                        format: calendarLevelFormat
                    };
                }
            }
            idx++
        }

        if (!levelIndex) throw new Error(`There is no main date format for zoom ${zoom}.`)
    }

    generateAllDates(time, levels) {
        if (!time.zoom) return [];
        
        time.allDates = new Array(levels.length); 
        this.time.stopCheckingCurrentDates();

        const { format, levelIndex } = this.getFormatAndLevelIndexForZoom(time.zoom, levels);
        time.level = levelIndex;
        time.allDates[time.level] = this.generatePeriodDates(format, time, levels[levelIndex], time.level);

        let idx = 0;
        for (const level of levels) {
            const calendarLevelFormat = level.find((cFmt => +time.zoom <= +cFmt.zoomTo));
            if ( idx !== time.level ) {
                time.allDates[idx] = this.generatePeriodDates(calendarLevelFormat, time, level, idx);
            }
            this.time.setDatesCacheLevel(idx, time.allDates[idx], time);
            idx++;
        }
        this.time.checkCurrentDates(true, time);
        return time.allDates;
    }

    getPeriodDatesAndCalculateViewOffsetFromAllDates(allLevelDates, time) {
        if (!allLevelDates.length) return [];

        const dates = allLevelDates.filter(dt => {
            return ( dt.leftGlobal < time.rightGlobal && 
                dt.rightGlobal >= time.rightGlobal ) || 
                ( dt.leftGlobal <= time.leftGlobal && 
                dt.rightGlobal > time.leftGlobal ) || 
                ( dt.leftGlobal >= time.leftGlobal && 
                dt.rightGlobal <= time.rightGlobal ); 
        });

        if (!dates.length) return [];
        let startPx = 0;

        if ( time.leftGlobal > dates[0].leftGlobal ) {
            startPx = this.time.getDatesDiffPx(time.leftGlobalDate, dates[0].leftGlobalDate, time, true);
        }

        let curPx = startPx;
        //console.log("getPeriodDatesAndCalculateViewOffsetFromAllDates", curPx);
        const last = dates.length - 1;
        return dates.map(((dt, i) => {
            dt.currentView = {
                leftPx: curPx,
                rightPx: curPx + dt.width,
                width: dt.width + startPx,
                leftGlobalDate: this.time.date(dt.leftGlobal - startPx * time.timePerPixel),
                rightGlobalDate: this.time.date(dt.rightGlobal),
                durationMs: 0
            };
            dt.currentView.durationMs = dt.currentView.rightGlobalDate.valueOf() - dt.currentView.leftGlobalDate.valueOf();
            startPx = 0;
            curPx += dt.width;
            if (i === last && dt.rightGlobal > time.rightGlobal) {
                let left = 0;
                if ( dt.currentView.leftPx < 0 ) {
                    left = dt.currentView.leftPx;
                    dt.currentView.leftPx = 0;
                    //console.log("left", left, time.timePerPixel);
                }
                dt.currentView.width = (time.rightGlobal + 1 - dt.leftGlobal) / time.timePerPixel + left;
                dt.currentView.rightPx = dt.currentView.leftPx + dt.currentView.width;
                dt.currentView.rightGlobalDate = this.time.date(dt.leftGlobal + dt.currentView.width * time.timePerPixel);
            }
            return dt;
        }));
    }

    updateLevels(time, levels) {
        time.levels = [], time.currentZoomLevelFormatting = [];
        let levelIndex = 0;
        for (const level of levels) {
            const levelFormat = level.find((e => +time.zoom <= +e.zoomTo));
            time.currentZoomLevelFormatting[levelIndex] = levelFormat;
            if ( levelFormat.main ) {
                time.format = levelFormat;
                time.level = levelIndex;
            }
            if (levelFormat) {
                let dts = this.getPeriodDatesAndCalculateViewOffsetFromAllDates(time.allDates[levelIndex], time);
                time.onCurrentViewLevelDates.forEach((s => {
                    dts = s({
                        dates: dts,
                        format: levelFormat,
                        time: time,
                        level,
                        levelIndex
                    })
                }));
                time.levels.push(dts);
            }
            levelIndex++;
        }
    }

    updateLocale() {
        const time = this.state.get("$data.chart.time"),
            localName = this.state.get("config.locale.name");

        let levelIndex = 0;
        for (const level of time.allDates) {
            const format = time.currentZoomLevelFormatting[levelIndex];
            for (const dt of level) dt.formatted = this.formatDate(format, dt, localName);
            levelIndex++;
        }
        levelIndex = 0;
        for (const level of time.levels) {
            const format = time.currentZoomLevelFormatting[levelIndex];
            for (const dt of level) dt.formatted = this.formatDate(format, dt, localName);
            levelIndex++;
        }
        //update();
    }

    calculateTotalViewDurationFromDates(time) {
        let px = 0,
            ms = 0;
        for (const chartTimeDate of time.allDates[time.level]) {
            px += chartTimeDate.width;
            ms += chartTimeDate.rightGlobal + 1 - chartTimeDate.leftGlobal;
        }
        time.totalViewDurationPx = px;
        time.totalViewDurationMs = ms;
    }

    calculateRightGlobal(leftGlobalDate, chartWidth, allMainDates, offsetPx, offsetMs) {
        const time = this.state.get("$data.chart.time"),
            leftDate = leftGlobalDate.endOf(time.period).valueOf(),
            date = this.time.findDateAtTime(leftDate, allMainDates);
            
        if (!date) return leftGlobalDate.valueOf();

        let i = allMainDates.indexOf(date),
            ms = date.leftGlobal,
            px = 0;

        for (let len = allMainDates.length; i < len; i++) {
            const tmpDt = allMainDates[i];
            ms = tmpDt.rightGlobal;
            px += tmpDt.width;
            if (px + offsetPx >= chartWidth) break;
        }
        return ms + offsetMs;
    }

    allItemsOnTheLeftOrRight(items, time) {
        items = items || this.getAllItems();
        time = time || this.state.get("$data.chart.time");
        let left = true,
            right = true;
        for (const itemId in items) {
            const item = items[itemId];
            item.time.end < time.leftGlobal || (left = false), 
            item.time.start > time.rightGlobal || (right = false);
        }
        
        this.state.update("$data.chart.allItemsOnTheLeftOrRight", left || right);
        return left || right;
    }

    updateVisibleItems(time, res) {
        res = res || this.state.multi(true);
        time = time || this.state.get("$data.chart.time");

        // res ==> ref 처리
        const visibleItemsId = this.state.get("$data.chart.visibleItems"),
            items = this.getItems(visibleItemsId);

        if (!items) return res;

        const rows = this.getAllRows(),
            rowsData = this.getRowsData(),
            itemsData = this.getItemsData();

        if (!rows) return res;

        if (!time.levels || !time.levels[time.level]) return res;

        let changed = false;
        const allItemsOnTheLeftOrRight = this.state.get("$data.chart.allItemsOnTheLeftOrRight");
        for (const item of items) {
            if (!item) return res;

            const row = rows[item.rowId],
                rowData = rowsData[item.rowId];

            if (!row || !rowData) continue;

            const tmpItemData = lodash.merge({}, itemsData[item.id]),
                position = tmpItemData.position;

            let tmpPosititon;
            tmpPosititon = allItemsOnTheLeftOrRight ? position : this.calculateItemPosition(item.id, itemsData[item.id], rowData, time, item);
            for (const pProp in position)
                
                if (tmpPosititon[pProp] !== position[pProp]) {
                    changed = true;
                    break
                } 
                
                if (!changed) {
                    for (const iProps in tmpItemData) {
                        if (itemsData[item.id][iProps] !== tmpItemData[iProps]) {
                            changed = true;
                            break
                        }
                    }
                }
                
        }
        if ( changed ) {
            res = res.update("$data.chart.items", (t => t), {
                data: "update-visible-items"
            });
        }
        return res;
    }

    calculateLeftAndRightGlobalNormally(time, horizontalScroll) {
        const allDates = time.allDates[time.level],
            px = horizontalScroll.preciseOffset * time.timePerPixel;

        let leftDt = allDates[horizontalScroll.dataIndex];

        if (!leftDt && allDates.length) leftDt = allDates[allDates.length - 1];
        else if (!allDates.length) return;

        time.leftGlobal = leftDt.leftGlobal - px, 
        time.leftGlobalDate = this.time.date(time.leftGlobal);

        let curOffset = horizontalScroll.preciseOffset;
        const chartWidth = this.getChartWidth(false);
        let tmpMs;
        for (let i = horizontalScroll.dataIndex; i < allDates.length; i++) {
            const dt = allDates[i];
            curOffset += dt.width;
            if (curOffset >= chartWidth) {
                const ms = (curOffset - chartWidth) * time.timePerPixel;
                tmpMs = dt.rightGlobal - ms;
                break;
            }
        }
        if (!tmpMs) {
            tmpMs = allDates[allDates.length - 1].rightGlobal;
        }

        time.rightGlobal = tmpMs;
        time.rightGlobalDate = this.time.date(time.rightGlobal);
    }

    calculateLeftAndRightGlobalFromCenter(time, oldDataTime, horizontalScroll) {
        const chartWidth = this.getChartWidth(false),
            allDates = time.allDates[time.level];
        if ( !allDates.length ) {
            time.leftGlobal = time.from;
            time.leftGlobalDate = this.time.date(time.leftGlobal);
            time.rightGlobal = null;
            time.rightGlobalDate = null;
        }
        if (0 === horizontalScroll.handlePosPx) {
            time.leftGlobal = time.fromDate.valueOf();
            time.leftGlobalDate = this.time.date(time.leftGlobal);
            time.rightGlobal = this.time.getTimeFromOffsetPx(chartWidth, false, time);
            time.rightGlobalDate = this.time.date(time.rightGlobal);
            const leftDt = allDates[0];
            horizontalScroll.dataId = leftDt.id;
            horizontalScroll.dataIndex = 0;
            horizontalScroll.preciseOffset = 0;
            return time;
        }
        if (horizontalScroll.handlePosPx === horizontalScroll.maxHandlePosPx) {
            time.rightGlobal = time.toDate.valueOf();
            time.rightGlobalDate = this.time.date(time.rightGlobal);
            let rightDate = allDates[allDates.length - 1];
            let pos = 0,
                cur = allDates.length - 1;
            for (; cur >= 0; cur--) {
                const dt = allDates[cur];
                pos += dt.width;
                if (pos >= chartWidth) {
                    rightDate = dt;
                    break
                }
            }
            const leftMs = (pos - chartWidth) / time.timePerPixel;
            time.leftGlobal = rightDate.leftGlobal + leftMs;
            time.leftGlobalDate = this.time.date(time.leftGlobal);
            const tmpDt = allDates[allDates.length - 1];
            horizontalScroll.dataId = tmpDt.id;
            horizontalScroll.dataIndex = allDates.length - 1;
            horizontalScroll.preciseOffset = 0;
            return time;
        }
        const center = Math.round(chartWidth / 2);
        
        let len = 0;
        for (const dt of allDates) {
            if (dt.rightGlobal > time.centerGlobal) break;
            len++
        }
        if (len >= allDates.length || 
            time.centerGlobal < allDates[0].leftGlobal || 
            time.centerGlobal > allDates[allDates.length - 1].rightGlobal) {
                return this.calculateLeftAndRightGlobalNormally(time, horizontalScroll);
        }

        const gap = oldDataTime.centerGlobal - allDates[len].leftGlobal;

        let tmpDt, px = -Math.round(gap / time.timePerPixel),
            tmpIdx = 0;

        for (let i = len; i >= 0; i--) {
            const dt = allDates[i];
            px += dt.width;
            if (px >= center) {
                tmpDt = dt;
                tmpIdx = i;
                break;
            }
        }
        if ( !tmpDt ) {
            tmpDt = allDates[0];
            px = center;
        }
        const rightPos = px - center,
            ms = Math.round(rightPos * time.timePerPixel);
            
        time.leftGlobal = tmpDt.leftGlobal + ms;
        time.leftGlobalDate = this.time.date(time.leftGlobal);
        let tmpDt2, pos = -rightPos;
        const allLen = allDates.length;
        for (let i = 0; i < allLen; i++) {
            const dt = allDates[i];
            pos += dt.width;
            if (pos >= chartWidth) {
                tmpDt2 = dt;
                break;
            }
        }
        if ( !tmpDt2 ) {
            tmpDt2 = allDates[allDates.length - 1];
            pos = chartWidth;
        }

        const leftPos = pos - chartWidth,
            diffMs = Math.round(leftPos * time.timePerPixel);

        time.rightGlobal = tmpDt2.rightGlobal - diffMs;
        time.rightGlobalDate = this.time.date(time.rightGlobal);
        horizontalScroll.dataId = tmpDt.id;
        horizontalScroll.dataIndex = tmpIdx;
        horizontalScroll.preciseOffset = -rightPos;
        return time;
    }

    updateFromToBasedOnDates(time) {
        const allDates = time.allDates[time.level];
        if ( allDates.length ) {
            time.from = allDates[0].leftGlobal;
            time.fromDate = this.time.date(time.from);
            time.to = allDates[allDates.length - 1].rightGlobal;
            time.toDate = this.time.date(time.to);
        }
    }

    recalculateTimes(reasons) {
        if (this.isMutedMethod("recalculateTimes")) return;
        const time = this.state.get("config.chart.time"),
            nTime = lodash.merge({}, time),
            dataChartTime = this.state.get("$data.chart.time");

        nTime.allDates = dataChartTime.allDates || new Array(nTime.levels.length);
        nTime.datesCache = dataChartTime.datesCache || {
            timePerPixel: 0,
            levels: []
        };

        const items = this.state.get("config.chart.items");
        if (!(nTime.from && nTime.to || Object.keys(items).length)) return;
        if ("number" != typeof nTime.from && 
             void 0 !== nTime.from || 
             "number" != typeof nTime.to && 
             void 0 !== nTime.to) {
            throw new Error("[gantt-schedule-timeline-calendar] 'config.chart.time.from' and 'config.chart.time.to' must be a number (unix epoch milliseconds).");
        }
        if (!nTime.from) {
            let ms = 1 / 0;
            for (const itemId in items) {
                const item = items[itemId];
                if ( ms > item.time.start ) {
                    ms = item.time.start;
                }
            }
            nTime.from = ms;
        }
        if (!nTime.to) {
            let ms = 0;
            for (const itemId in items) {
                const item = items[itemId];
                if ( ms < item.time.end ) {
                    ms = item.time.end;
                }
            }
            nTime.to = ms;
        }
        nTime.fromDate || (nTime.fromDate = this.time.date(nTime.from));
        nTime.toDate || (nTime.toDate = this.time.date(nTime.to));

        const vertVisible = this.state.get("$data.scroll.vertical.visible"),
            chartWidth = this.getChartWidth(vertVisible),
            levels = this.state.get("config.chart.calendarLevels"),
            horizontalScroll = this.state.get("$data.scroll.horizontal");

        nTime.calculatedZoomMode || this.time.recalculateFromTo(nTime);
        nTime.leftGlobal || (nTime.leftGlobal = nTime.from);
        
        const m = reasons.filter((t => "items-out-of-view" === t.name));

        let g = 1 / 0,
            p = 0;

        if (m.length) {
            for (const t of m) {
                g > t.from && (g = t.from);
                p < t.to && (p = t.to);
            }
        }
            
        let w = false;

        if ( reasons.find((t => "reload" === t.name)) || 
            reasons.find((t => "all" === t.name)) || 
            reasons.find((t => "from" === t.name)) || 
            reasons.find((t => "to" === t.name)) || 
            reasons.find((t => "zoom" === t.name)) || 
            reasons.find((t => "calculated-zoom-mode" === t.name)) || 
            reasons.find((t => "align-levels" === t.name)) || 
            reasons.find((t => "auto-expand-time" === t.name)) || 
            reasons.find((t => "locale" === t.name)) ) {
            w = true;
        }

        if (nTime.calculatedZoomMode && chartWidth) {
            nTime.totalViewDurationMs = this.time.date(nTime.to).add(1, nTime.period).startOf(nTime.period).diff(nTime.from, "millisecond");
            nTime.timePerPixel = nTime.totalViewDurationMs / chartWidth;
            nTime.totalViewDurationPx = nTime.totalViewDurationMs / nTime.timePerPixel;
            nTime.zoom = Math.log(nTime.timePerPixel) / Math.log(2);

            this.resetHorizontalScroll(), 
            w && this.generateAllDates(nTime, levels), 
            this.calculateTotalViewDurationFromDates(nTime), 
            nTime.timePerPixel = nTime.totalViewDurationMs / chartWidth, 
            nTime.zoom = Math.log(nTime.timePerPixel) / Math.log(2);

            for (let t = 0; t < nTime.allDates.length; t++) {
                this.time.recalculateDatesWidths(nTime.allDates[t], nTime), 
                this.time.recalculateDatesPositions(nTime.allDates[t], nTime), 
                this.time.setDatesCacheLevel(t, nTime.allDates[t], nTime);
            }
            this.calculateTotalViewDurationFromDates(nTime), 
            nTime.leftGlobal = nTime.from, 
            nTime.leftGlobalDate = this.time.date(nTime.leftGlobal), 
            nTime.rightGlobal = nTime.to, 
            nTime.rightGlobalDate = this.time.date(nTime.rightGlobal);
        } else {
            nTime.timePerPixel = Math.pow(2, nTime.zoom), 
            m.length && nTime.autoExpandTimeFromItems && (nTime.from = g, nTime.to = p), 
            nTime.fromDate = this.time.date(nTime.from).startOf(nTime.period), 
            nTime.from = nTime.fromDate.valueOf(), 
            nTime.toDate = this.time.date(nTime.to).endOf(nTime.period), 
            nTime.to = nTime.toDate.valueOf(), 
            w && this.generateAllDates(nTime, levels), 
            m.length && nTime.autoExpandTimeFromItems || this.updateFromToBasedOnDates(nTime), 
            this.calculateTotalViewDurationFromDates(nTime);
            const e = this.state.get("$data.chart.time");
            if ( reasons.find((t => "zoom" === t.name)) && !reasons.find((t => "all" === t.name)) && e.centerGlobalDate ) {
                this.calculateLeftAndRightGlobalFromCenter(nTime, e, horizontalScroll);
                this.calculateHorizontalScrollSizeAndPosFromDates(nTime.totalViewDurationPx, nTime, horizontalScroll, !1);
            } else {
                this.calculateHorizontalScrollSizeAndPosFromDates(nTime.totalViewDurationPx, nTime, horizontalScroll, !1)
                this.calculateLeftAndRightGlobalNormally(nTime, horizontalScroll)
            }
        }

        this.updateLevels(nTime, levels), 
        this.limitGlobal(nTime), 
        nTime.leftPx = 0, 
        nTime.rightPx = chartWidth, 
        nTime.width = chartWidth;
        const v = nTime.levels[nTime.level];
        if (v && v.length) {
            const t = v[v.length - 1];
            nTime.leftPx = v[0].leftPx - horizontalScroll.preciseOffset, 
            nTime.rightPx = t.rightPx, 
            nTime.width = nTime.rightPx;
        }

        this.setCenter(nTime);
        
        /**/
        let b = this.state.multi(true);
        b = b.update("config.chart.time", (
            t => ((
                t = Object.assign({}, t)).zoom = nTime.zoom, 
                t.level = nTime.level, 
                t.period = nTime.format.period, 
                t.leftGlobal = nTime.leftGlobal, 
                t.leftGlobalDate = nTime.leftGlobalDate.clone(), 
                t.centerGlobal = nTime.centerGlobal, 
                t.rightGlobal = nTime.rightGlobal, 
                t.rightGlobalDate = nTime.rightGlobalDate.clone(), 
                t.from = nTime.from, 
                t.to = nTime.to, 
                t.autoExpandTimeFromItems = nTime.autoExpandTimeFromItems, 
                t.timePerPixel = nTime.timePerPixel, t)
                )), 
         this.allItemsOnTheLeftOrRight(this.getAllItems(), nTime), 
         b = b.update("$data.chart.time", nTime), 
         b = this.updateVisibleItems(nTime, b), 
         b = b.update("$data.chart.time.recalculateTimesLastReason", reasons);

        const y = reasons.find((t => "set-scroll-left" === t.name));
        //console.log("3575", y);
        b = b.update("$data.scroll.horizontal", horizontalScroll, {
            data: y ? "set-scroll-left" : null
        });
        b.done();
        
        
        const changeChartWidth = reasons.find((t => "chart-width" === t.name));

        if ( changeChartWidth && 0 === changeChartWidth.oldValue && 0 !== changeChartWidth.newValue ) {
            setTimeout(this.triggerLoadedEvent.bind(this), 0);
        }
    }
    /**/
    minimalReload(t) {
        if (this.isMutedMethod("minimalReload")) return;
        this.muteMethod("minimalReload");
        const e = this.getMutedListeners();

        this.state.mute(this.bindFullReload);
        this.state.mute(this.bindPartialReload);
        this.state.mute(this.bindMinimalReload);
        this.state.collect();
        this.calculateVisibleRowsHeights();
        this.generateVisibleRowsAndItems();
        this.updateVisibleItems().done();
        this.state.executeCollected();
        
        if ( !e.includes(this.bindFullReload) ) {
            this.state.unmute(this.bindFullReload);
        } 
        if ( !e.includes(this.bindPartialReload) ) {
            this.state.unmute(this.bindPartialReload);
        }
        if ( !e.includes(this.bindMinimalReload) ) {
            this.state.unmute(this.bindMinimalReload);
        }
        this.unmuteMethod("minimalReload");
        //update();
    }

    partialReload(t = true, e) {
        if (this.isMutedMethod("partialReload")) return;
        this.muteMethod("partialReload");
        const o = this.getMutedListeners();
        this.state.mute(this.bindFullReload);
        this.state.mute(this.bindPartialReload);
        this.state.mute(this.bindMinimalReload);

        if (t) {
            const t = this.state.get("$data");
            t.list.rows = {}, t.chart.items = {}
        }
        this.state.collect();
        this.generateTree(t);
        this.prepareExpanded();
        this.measureRows();
        this.calculateVerticalScrollSize();
        this.minimalReload(e);
        this.state.executeCollected();
        
        if ( !o.includes(this.bindFullReload) ) {
            this.state.unmute(this.bindFullReload);
        } 
        if ( !o.includes(this.bindPartialReload) ) {
            this.state.unmute(this.bindPartialReload);
        }
        if ( !o.includes(this.bindMinimalReload) ) {
            this.state.unmute(this.bindMinimalReload);
        }

        this.unmuteMethod("partialReload");
        //update();
    }

    fullReload(t) {
        if (this.isMutedMethod("fullReload")) return;

        this.state.update("$data.reloading", true);
        this.muteMethod("fullReload");

        const e = this.getMutedListeners();

        this.state.mute(this.bindFullReload);
        this.state.mute(this.bindPartialReload);
        this.state.mute(this.bindMinimalReload);

        this.state.collect();
        this.partialReload(true, t);
        this.recalculateTimes([{
            name: "reload"
        }]);
        
        this.state.executeCollected();

        if ( !e.includes(this.bindFullReload) ) {
            this.state.unmute(this.bindFullReload);
        } 
        if ( !e.includes(this.bindPartialReload) ) {
            this.state.unmute(this.bindPartialReload);
        }
        if ( !e.includes(this.bindMinimalReload) ) {
            this.state.unmute(this.bindMinimalReload);
        }
        this.unmuteMethod("fullReload");
        this.state.update("$data.reloading", false);
        
        //update();
    }
    
}



const TimeLevel0 = [{
    zoomTo: 17,
    period: "day",
    periodIncrement: 1,
    classNames: ["gstc-date-medium gstc-date-left"],
    format: ({ timeStart }) => timeStart.format("DD MMMM YYYY (dddd)")
}, {
    zoomTo: 23,
    period: "month",
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("MMMM YYYY")
}, {
    zoomTo: 24,
    period: "month",
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("MMMM 'YY")
}, {
    zoomTo: 25,
    period: "month",
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("MMM YYYY")
}, {
    zoomTo: 27,
    period: "year",
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("YYYY")
}, {
    zoomTo: 100,
    period: "year",
    periodIncrement: 1,
    format: () => null
}];

const TimeLevel1 = [{
    zoomTo: 9,
    period: "minute",
    classNames: ["gstc-date-medium"],
    main: true,
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("HH:mm")
}, {
    zoomTo: 11,
    period: "minute",
    classNames: ["gstc-date-medium"],
    main: true,
    periodIncrement: 5,
    format: ({ timeStart }) => timeStart.format("HH:mm")
}, {
    zoomTo: 12,
    period: "minute",
    classNames: ["gstc-date-medium"],
    main: true,
    periodIncrement: 15,
    format: ({ timeStart }) => timeStart.format("HH:mm")
}, {
    zoomTo: 13,
    period: "minute",
    classNames: ["gstc-date-medium"],
    main: true,
    periodIncrement: 30,
    format: ({ timeStart }) => timeStart.format("HH:mm")
}, {
    zoomTo: 16,
    period: "hour",
    classNames: ["gstc-date-medium"],
    main: true,
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("HH:mm")
}, {
    zoomTo: 17,
    period: "hour",
    main: true,
    periodIncrement: 1,
    format: ({ timeStart }) => timeStart.format("HH")
}, {
    zoomTo: 19,
    period: "day",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-medium"],
    format: ({ timeStart, className }) => (
        [<span class={`${className}-content gstc-date-bold`}>{timeStart.format("DD")}</span>, 
        <span class={`${className}-content gstc-date-thin`}>{timeStart.format("dddd")}</span>]
    )
}, {
    zoomTo: 20,
    period: "day",
    main: true,
    periodIncrement: 1,
    format: ({ timeStart, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("DD")}</div>, 
        <div class={`${className}-content gstc-date-small`}>{timeStart.format("dddd")}</div>]
    )
}, {
    zoomTo: 21,
    period: "day",
    main: true,
    periodIncrement: 1,
    format: ({ timeStart, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("DD")}</div>, 
        <div class={`${className}-content gstc-date-small`}>{timeStart.format("ddd")}</div>]
    )
}, {
    zoomTo: 22,
    period: "day",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-vertical"],
    format: ({ timeStart, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("DD")}</div>, 
        <div class={`${className}-content gstc-date-extra-small`}>{timeStart.format("ddd")}</div>]
    )
}, {
    zoomTo: 23,
    period: "week",
    main: true,
    periodIncrement: 1,
    format: ({ timeStart, timeEnd, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("DD")} - {timeEnd.format("DD")}</div>, 
        <div class={`${className}-content gstc-date-small gstc-date-thin`}>{timeStart.format("ddd")} - {timeEnd.format("dd")}</div>]
    )
}, {
    zoomTo: 25,
    period: "week",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-vertical"],
    format: ({ timeStart, timeEnd, className }) => (
        [<div class={`${className}-content gstc-date-top gstc-date-small gstc-date-normal`}>{timeStart.format("DD")}</div>, 
        <div class="gstc-dash gstc-date-small">-</div>,
        <div class={`${className}-content gstc-date-small gstc-date-normal`}>{timeEnd.format("DD")}</div>]
    )
}, {
    zoomTo: 26,
    period: "month",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-month-level-1"],
    format: ({ timeStart, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("MMM")}</div>, 
        <div class={`${className}-content gstc-date-small gstc-date-bottom`}>{timeStart.format("MM")}</div>]
    )
}, {
    zoomTo: 27,
    period: "month",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-vertical"],
    format: ({ timeStart, className }) => (
        [<div class={`${className}-content gstc-date-top`}>{timeStart.format("MM")}</div>, 
        <div class={`${className}-content gstc-date-extra-small`}>{timeStart.format("MMM")}</div>]
    )
}, {
    zoomTo: 28,
    period: "year",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-big"],
    format: ({ timeStart }) => timeStart.format("YYYY")
}, {
    zoomTo: 29,
    period: "year",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-medium"],
    format: ({ timeStart }) => timeStart.format("YYYY")
}, {
    zoomTo: 30,
    period: "year",
    main: true,
    periodIncrement: 1,
    classNames: ["gstc-date-medium"],
    format: ({ timeStart }) => timeStart.format("YY")
}, {
    zoomTo: 100,
    period: "year",
    main: true,
    periodIncrement: 1,
    format: () => null
}];

const compList = ["br-gantt", "br-scroll-bar", "br-list", "br-list-column", "br-list-column-header", "br-list-column-header-resizer", 
    "br-list-column-row", "br-list-column-row-expander", "br-list-column-row-expander-toggle", "br-list-toggle", "br-chart", 
    "br-chart-calendar", "br-chart-calendar-date", "br-chart-timeline", "br-chart-timeline-grid", "br-chart-timeline-grid-row", 
    "br-chart-timeline-grid-row-cell", "br-chart-timeline-items", "br-chart-timeline-items-row", "br-chart-timeline-items-row-item"];

function getActionsMaps() {
    let actionsMap = {};
    compList.forEach((actionName => actionsMap[actionName] = []));
    return actionsMap;
}

function getDefaultSlots() {
    const slots = {};
    compList.forEach((slotName => {
        slots[slotName] = {
            outer: [],
            inner: [],
            "container-outer": [],
            "container-inner": [],
            content: []
        }
    }));
    return slots;
}

const defaultConfig = {
    debug: true,
    plugins: [],
    plugin: {},
    innerHeight: 428,
    initialWidth: 1024,
    additionalSpace: {
        top: 0,
        bottom: 0
    },
    headerHeight: 72,
    autoInnerHeight: false,
    /*
    components: {
        ScrollBar: G,
        List: z,
        ListColumn: T,
        ListColumnHeader: L,
        ListColumnHeaderResizer: k,
        ListColumnRow: A,
        ListColumnRowExpander: N,
        ListColumnRowExpanderToggle: H,
        ListToggle: V,
        Chart: _,
        ChartCalendar: B,
        ChartCalendarDate: j,
        ChartTimeline: F,
        ChartTimelineGrid: q,
        ChartTimelineGridRow: J,
        ChartTimelineGridRowCell: K,
        ChartTimelineItems: X,
        ChartTimelineItemsRow: tt,
        ChartTimelineItemsRowItem: at
    },
    */
    slots: getDefaultSlots(),
    list: {
        rows: {},
        row: {
            height: 40,
            gap: {
                top: 0,
                bottom: 0
            }
        },
        columns: {
            percent: 100,
            resizer: {
                width: 10,
                inRealTime: true,
                dots: 6
            },
            minWidth: 50,
            data: {}
        },
        expander: {
            padding: 18,
            size: 20,
            icon: {
                width: 16,
                height: 16
            },
            icons: {
                child: (<svg xmlns="http://www.w3.org/2000/svg" key={"child"} width="24" height="24" viewBox="0 0 24 24"><ellipse ry="4" rx="4" id="svg_1" cy="12" cx="12" fill="#000000B0"/></svg>),
                open: (<svg xmlns="http://www.w3.org/2000/svg" key={"open"} width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>),
                closed: (<svg xmlns="http://www.w3.org/2000/svg" key={"closed"} width="24" height="24" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>)
            }
        },
        toggle: {
            display: true,
            icons: {
                open: (<svg xmlns="http://www.w3.org/2000/svg" key={"open"} width="24" height="24" viewBox="0 0 24 24"><path stroke="null" d="m16.406954,16.012672l4.00393,-4.012673l-4.00393,-4.012673l1.232651,-1.232651l5.245324,5.245324l-5.245324,5.245324l-1.232651,-1.232651z"/><path stroke="null" d="m-0.343497,12.97734zm1.620144,0l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,3.909362l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,-9.773404l0,1.95468l11.341011,0l0,-1.95468l-11.341011,0z"/></svg>),
                close: (<svg xmlns="http://www.w3.org/2000/svg" key={"close"} width="24" height="24" viewBox="0 0 24 24"><path transform="rotate(-180 4.392796516418457,12) " stroke="null" d="m1.153809,16.012672l4.00393,-4.012673l-4.00393,-4.012673l1.232651,-1.232651l5.245324,5.245324l-5.245324,5.245324l-1.232651,-1.232651z"/><path stroke="null" d="m9.773297,12.97734zm1.620144,0l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,3.909362l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,-9.773404l0,1.95468l11.341011,0l0,-1.95468l-11.341011,0z"/></svg>)
            }
        },
        sort: {
            compare: null,
            asc: true,
            activeColumnId: null,
            icons: {
                up: (<svg xmlns="http://www.w3.org/2000/svg" key={"up"} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>),
                down: (<svg xmlns="http://www.w3.org/2000/svg" key={"down"} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>)
            }
        }
    },
    scroll: {
        bodyClassName: "br-scrolling",
        horizontal: {
            width: 20,
            minInnerSize: 40,
            multiplier: 1,
            precise: true,
            byPixels: true
        },
        vertical: {
            width: 20,
            minInnerSize: 40,
            multiplier: 1,
            precise: true,
            byPixels: true
        }
    },
    chart: {
        time: {
            period: "day",
            from: 0,
            to: 0,
            zoom: 20,
            leftGlobal: 0,
            centerGlobal: 0,
            rightGlobal: 0,
            calculatedZoomMode: false,
            onLevelDates: [],
            onCurrentViewLevelDates: [],
            onDate: [],
            allDates: [],
            autoExpandTimeFromItems: false,
            alignLevelsToMain: true,
            timePerPixel: 0,
            checkCurrentDateInterval: 3e5,
            datesCache: {
                timePerPixel: 0,
                levels: []
            }
        },
        calendarLevels: [TimeLevel0, TimeLevel1],
        grid: {
            cell: {
                onCreate: []
            }
        },
        item: {
            gap: {
                top: 4,
                bottom: 4
            },
            rowTop: 0,
            height: 32,
            minWidth: 10,
            overlap: false,
            cutIcons: {
                left: (<svg xmlns="http://www.w3.org/2000/svg" key={"left"} xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M20 9v6h-8v4.84L4.16 12L12 4.16V9h8z" fill="#ffffff"/><rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" /></svg>),
                right: (<svg xmlns="http://www.w3.org/2000/svg" key={"right"} xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M4 15V9h8V4.16L19.84 12L12 19.84V15H4z" fill="#ffffff"/><rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" /></svg>)
            }
        },
        items: {},
        spacing: 4
    },
    actions: getActionsMaps(),
    //templates: st(),
    /*
    locale: {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekStart: 0,
        relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        formats: {
            LT: "HH:mm",
            LTS: "HH:mm:ss",
            L: "DD/MM/YYYY",
            LL: "D MMMM YYYY",
            LLL: "D MMMM YYYY HH:mm",
            LLLL: "dddd, D MMMM YYYY HH:mm"
        },
        ordinal: t => {
            const e = ["th", "st", "nd", "rd"],
                a = t % 100;
            return `[${t}${e[(a-20)%10]||e[a]||e[0]}]`
        }
    },
    */
    locale: {
        name: "ko",
        weekdays: "일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),
        weekdaysShort: "일_월_화_수_목_금_토".split("_"),
        weekdaysMin: "일_월_화_수_목_금_토".split("_"),
        months: "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
        monthsShort: "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
        weekStart: 0,
        relativeTime: {
            future: "%s 후",
            past: "%s 전",
            s: "몇 초",
            m: "1분",
            mm: "%d분",
            h: "한 시간",
            hh: "%d시간",
            d: "하루",
            dd: "%d일",
            M: "한 달",
            MM: "%d달",
            y: "일 년",
            yy: "%d년"
        },
        formats: {
            LT: "A h:mm",
            LTS: "A h:mm:ss",
            L: "YYYY.MM.DD.",
            LL: "YYYY년 MMMM D일",
            LLL: "YYYY년 MMMM D일 A h:mm",
            LLLL: "YYYY년 MMMM D일 dddd A h:mm",
            l: "YYYY.MM.DD.",
            ll: "YYYY년 MMMM D일",
            lll: "YYYY년 MMMM D일 A h:mm",
            llll: "YYYY년 MMMM D일 dddd A h:mm"
        },
        meridiem: function(e) {
            return e < 12 ? "오전" : "오후"
        },
        ordinal: t => {
            return t + "일";
        }
    },
    utcMode: false,
    //merge: (t, e) => s.mergeDeep({}, t, e),
    useLast: true,
    //Promise: Promise,
    mute: [],
    //version: "3.35.2"
};

function fullReload(value, eventInfo) {
    if (  "fullReload" !== eventInfo.options.data ) {
        this.fullReload(eventInfo);
    }
}

function partialReload(value, eventInfo) {
    let checkData;
    let that = this;

    ["config", "config.chart.items"].includes(eventInfo.path.update) || 
    "config.list.rows" === eventInfo.path.update && "expanded" !== (null === (checkData = eventInfo.options.data) || 
    null == checkData ? null : checkData.name) || 
    (["config.list.rows.*.parentId"].includes(eventInfo.path.listener) ? function(value, eventInfo) {
        "subscribe" !== eventInfo.type && 
        "sortRowsByColumn" !== eventInfo.options.data && 
        "fullReload" !== eventInfo.options.data && that.partialReload(true, eventInfo);
    }(0, eventInfo) : function(t, e) {
        "subscribe" !== eventInfo.type && 
        "fullReload" !== eventInfo.options.data && that.partialReload(false, eventInfo);
    }(0, eventInfo));
}

function minimalReload(value = null, eventInfo) {
    eventInfo && 
    "subscribe" === eventInfo.type || 
    eventInfo && eventInfo.options.data && 
    "update-visible-items" === eventInfo.options.data || this.minimalReload(eventInfo);
}


export function chartInit(api) {

    let bindFullReload = fullReload.bind(api);
    api.bindFullReload = bindFullReload;
    let bindPartialReload = partialReload.bind(api);
    api.bindPartialReload = bindPartialReload;
    let bindMinimalReload = minimalReload.bind(api);
    api.bindMinimalReload = bindMinimalReload;

    api.unsubscribes.push(api.state.subscribeAll(["config.innerHeight", "config.headerHeight", 
        "config.scroll.vertical.width"], api.heightChange.bind(api), {
        group: true,
        bulkValue: false
    }));

    api.unsubscribes.push(api.state.subscribe("$data.list.columns.resizer.active", api.resizerActiveChange.bind(api)));

    api.unsubscribes.push(api.state.subscribeAll(["config;", "config.chart.items;", 
        "config.list.rows;", "config.list.rows.*;", "config.chart.items.*;"], bindFullReload, {
        group: true,
        bulkValue: false
    }));

    api.unsubscribes.push(api.state.subscribeAll(["config.list.rows.*.parentId", 
        "config.chart.items.*.rowId", "config.list.rows.*.expanded"], bindPartialReload, {
        group: true,
        bulkValue: false
    }));
    
    api.unsubscribes.push(api.state.subscribeAll(["config.chart.items.*.time", "config.chart.items.*.height", 
        "config.chart.items.*.top", 
        "$data.chart.dimensions.heightWithoutScrollBar", "$data.list.rowsHeight"], bindMinimalReload, {
        group: true,
        bulkValue: false
    }));
    api.unsubscribes.push(api.state.subscribeAll(["$data.scroll.vertical.dataIndex", 
        "$data.scroll.vertical.preciseOffset"], (function() {
        api.state.collect();
        api.generateVisibleRowsAndItems();
        api.calculateVisibleRowsHeights();
        api.updateItemsVerticalPositions();
        api.updateVisibleItems().done();
        api.state.executeCollected();
    }), {
        group: true,
        bulkValue: false
    }));
    
    api.unsubscribes.push(api.state.subscribe("config.list.sort", (value => {
        const columnInfo = api.state.get(`config.list.columns.data.${value.activeColumnId}`);
        //console.log("config.list.sort", t, e);
        columnInfo && api.sortRowsByColumn(columnInfo, value.asc);
    })));
    
    api.unsubscribes.push(api.state.subscribeAll(["config.chart.items.*.time", "config.chart.items.*;", 
        "config.chart.items.*.rowId"], (function(value, eventInfo) {
        eventInfo.options.data && "updateVisibleItems" === eventInfo.options.data || api.updateVisibleItems().done();
    }), {
        group: true,
        bulkValue: false
    }));

    let weekStart = api.state.get("config.locale.weekStart");
    api.unsubscribes.push(api.state.subscribe("config.locale", ((value, eventInfo) => {
        "subscribe" !== eventInfo.type && 
        (value.weekStart === weekStart ? api.updateLocale() : (weekStart = value.weekStart, api.recalculateTimes([{
            name: "locale"
        }])))
    })));

    const currentValue = {
        utcMode: false,
        initialized: false,
        zoom: 0,
        period: "",
        scrollAbsolutePosPx: 0,
        scrollTime: 0,
        chartWidth: 0,
        from: 0,
        to: 0,
        dataFrom: 0,
        dataTo: 0,
        calculatedZoomMode: false,
        alignLevels: true,
        autoExpandTime: true
    };

    api.unsubscribes.push(api.state.subscribeAll(["config.utcMode", "config.chart.time", 
        "$data.chart.time", "config.chart.calendarLevels", "$data.scroll.horizontal", 
        "$data.chart.dimensions.width", "config.chart.items.*.time"], ((value, eventInfo) => {
        const reasons = function(eventInfo) {
            const utcMode = api.state.get("config.utcMode"),
                configTime = api.state.get("config.chart.time"),
                dataTime = api.state.get("$data.chart.time"),
                scrollHorizontal = api.state.get("$data.scroll.horizontal"),
                chartWidth = api.state.get("$data.chart.dimensions.width"),
                calculatedZoomMode = api.state.get("config.chart.time.calculatedZoomMode"),
                oldValue = Object.assign({}, currentValue);

            currentValue.utcMode = utcMode;
            currentValue.zoom = configTime.zoom;
            currentValue.period = configTime.period;
            currentValue.from = configTime.from;
            currentValue.to = configTime.to;
            currentValue.dataFrom = dataTime.from;
            currentValue.dataTo = dataTime.to;
            currentValue.scrollAbsolutePosPx = scrollHorizontal.absolutePosPx;
            scrollHorizontal.data && (currentValue.scrollTime = scrollHorizontal.data.leftGlobal);
            currentValue.chartWidth = chartWidth;
            currentValue.calculatedZoomMode = calculatedZoomMode;
            currentValue.alignLevels = configTime.alignLevelsToMain;
            currentValue.autoExpandTime = configTime.autoExpandTimeFromItems;

            const changedInfo = [];

            currentValue.initialized || (currentValue.initialized = true, changedInfo.push({
                name: "all"
            }));
            utcMode !== oldValue.utcMode && changedInfo.push({
                name: "utc-mode",
                oldValue: oldValue.utcMode,
                newValue: utcMode
            });
            calculatedZoomMode !== oldValue.calculatedZoomMode && changedInfo.push({
                name: "calculated-zoom-mode",
                oldValue: oldValue.calculatedZoomMode,
                newValue: calculatedZoomMode
            });
            configTime.zoom !== oldValue.zoom && changedInfo.push({
                name: "zoom",
                oldValue: oldValue.zoom,
                newValue: configTime.zoom
            });
            configTime.period !== oldValue.period && changedInfo.push({
                name: "period",
                oldValue: oldValue.period,
                newValue: configTime.period
            });
            configTime.from !== oldValue.from && changedInfo.push({
                name: "from",
                oldValue: oldValue.from,
                newValue: configTime.from
            });
            configTime.to !== oldValue.to && changedInfo.push({
                name: "to",
                oldValue: oldValue.to,
                newValue: configTime.to
            });
            dataTime.from !== oldValue.dataFrom && changedInfo.push({
                name: "from",
                oldValue: oldValue.dataFrom,
                newValue: dataTime.from
            });
            dataTime.to !== oldValue.dataTo && changedInfo.push({
                name: "to",
                oldValue: oldValue.dataTo,
                newValue: dataTime.to
            });
            "set-scroll-left" === eventInfo.options.data && changedInfo.push({
                name: "set-scroll-left"
            });
            scrollHorizontal.absolutePosPx !== oldValue.scrollAbsolutePosPx && changedInfo.push({
                name: "scroll-pos",
                oldValue: oldValue.scrollAbsolutePosPx,
                newValue: scrollHorizontal.absolutePosPx
            });
            currentValue.scrollTime !== oldValue.scrollTime && changedInfo.push({
                name: "scroll-time",
                oldValue: oldValue.scrollTime,
                newValue: currentValue.scrollTime
            });
            chartWidth !== oldValue.chartWidth && changedInfo.push({
                name: "chart-width",
                oldValue: oldValue.chartWidth,
                newValue: chartWidth
            });
            currentValue.alignLevels !== oldValue.alignLevels && changedInfo.push({
                name: "align-levels",
                oldValue: oldValue.alignLevels,
                newValue: currentValue.alignLevels
            });
            currentValue.autoExpandTime !== oldValue.autoExpandTime && changedInfo.push({
                name: "auto-expand-time",
                oldValue: oldValue.autoExpandTime,
                newValue: currentValue.autoExpandTime
            });
            return changedInfo;
        }(eventInfo);

        if ( reasons.length ) {
            api.recalculateTimes(reasons);
        }
    }), {
        group: true,
        bulkValue: false
    }));
    
    api.unsubscribes.push(api.state.subscribe("config.chart.items.:itemId.time", (value => {
        api.allItemsOnTheLeftOrRight();

        const dataTime = api.state.get("$data.chart.time"),
            allItems = api.getAllItems();

        let from = 1 / 0,
            to = 0;
        for (const timePeriod of value) {
            const item = allItems[timePeriod.params.itemId];
            if (!item) return;

            if (item.time.start < dataTime.from || item.time.end > dataTime.to) {
                let from1 = dataTime.from,
                    to1 = dataTime.to;

                item.time.start < dataTime.from && (from1 = item.time.start);
                item.time.end > dataTime.to && (to1 = item.time.end);
                return api.recalculateTimes([{
                    name: "items-out-of-view",
                    from: from1,
                    to: to1
                }]);
            }
            item.time.start < from && (from = item.time.start);
            item.time.end > to && (to = item.time.end);
        }

        if (0 === dataTime.leftGlobal && 0 === dataTime.rightGlobal) return api.recalculateTimes([{
            name: "items",
            from,
            to
        }]);
    }), {
        bulk: true,
        bulkValue: false
    }));
    
    api.unsubscribes.push(api.state.subscribe("config.chart.time.checkCurrentDateInterval", (value => {
        if ( api.state.get("$data.chart.time").checkCurrentDateInterval !== value ) {
            api.state.update("$data.chart.time.checkCurrentDateInterval", value);
            api.time.stopCheckingCurrentDates();
            api.time.checkCurrentDates(true);
        }
    })));
}


export function stateFromConfig(config) {
    const dConfig = lodash.cloneDeep(defaultConfig);
    const defaultData = {
        treeMap: {},
        itemRowMap: {},
        list: {
            visibleRows: [],
            rowsIds: [],
            rows: {},
            visibleRowsHeight: 0,
            rowsWithParentsExpanded: [],
            rowsHeight: 0,
            width: 0
        },
        dimensions: {
            width: 0,
            height: 0
        },
        chart: {
            items: {},
            grid: {
                cells: {},
                rows: {}
            },
            dimensions: {
                width: 0,
                widthWithoutScrollBar: 0,
                height: 0,
                innerHeight: 0,
                heightWithoutScrollBar: 0
            },
            visibleItems: [],
            time: {
                zoom: 0,
                format: {
                    period: "day",
                    periodIncrement: 1,
                    zoomTo: 0,
                    format: () => ""
                },
                level: 0,
                levels: [],
                currentZoomLevelFormatting: [],
                allDates: [],
                timePerPixel: 0,
                totalViewDurationMs: 0,
                totalViewDurationPx: 0,
                leftGlobal: 0,
                rightGlobal: 0,
                leftPx: 0,
                rightPx: 0,
                period: "day",
                leftGlobalDate: null,
                rightGlobalDate: null,
                centerGlobal: 0,
                centerGlobalDate: null,
                from: 0,
                to: 0,
                fromDate: null,
                toDate: null,
                autoExpandTimeFromItems: false,
                datesCache: {
                    timePerPixel: 0,
                    levels: []
                }
            },
            allItemsOnTheLeftOrRight: false
        },
        scroll: {
            horizontal: {
                lastPageSize: 0,
                lastPageCount: 0,
                absoluteSize: 0,
                absoluteSizeWithoutLastPage: 0,
                handlePosPx: 0,
                innerHandleSize: 0,
                absolutePosPx: 0,
                maxHandlePosPx: 0,
                scrollSize: 0,
                dataIndex: 0,
                dataId: "",
                data: null,
                preciseOffset: 0,
                visible: false,
                percent: 0
            },
            vertical: {
                lastPageSize: 0,
                lastPageCount: 0,
                absoluteSize: 0,
                absoluteSizeWithoutLastPage: 0,
                handlePosPx: 0,
                innerHandleSize: 0,
                absolutePosPx: 0,
                maxHandlePosPx: 0,
                scrollSize: 0,
                dataIndex: 0,
                dataId: "",
                data: null,
                preciseOffset: 0,
                visible: false,
                percent: 0
            }
        },
        initializedPlugins: new Set
    };

    return {
        config: lodash.merge(dConfig, config),
        "$data": defaultData,
    };
}

export function reuseProps(target, source, setProps, comp, allChange = true, debug = false) {
    const modifiedProps = [],
        targetLen = target.length,
        sourceLen = source.length;

    let notExistSource = false;
    if ( !(!allChange || null != source && 0 != source.length) ) {
        notExistSource = true;
    }

    let h = 0;
    if (targetLen < sourceLen) {
        let idx = sourceLen - targetLen;
        for (; idx;) {
            const src = source[sourceLen - idx],
                nProp = setProps(src);
            target.push(nProp);
            modifiedProps.push(nProp);
            idx--;
        }
    } else if (targetLen > sourceLen) {
        let idx = targetLen - sourceLen;
        if (allChange) {
            notExistSource = true;
            h = targetLen - idx;
        } else {
            for (; idx;) {
                const i = targetLen - idx;
                modifiedProps.push(target[i]);
                //target[i].destroy();
                idx--;
            }
            target.length = sourceLen;
        }
    }
    let i = 0;
    debug && console.log("modified props", modifiedProps),
    debug && console.log("current props", target), 
    debug && console.log("data array", source);
    for (const tar of target) {
        const src = source[i];
        debug && console.log(`reuse props data at '${i}'`, src);
        if ( tar && !modifiedProps.includes(tar) ) {
            if ( debug ) {
                console.log("getProps fn result", setProps(src));
            }
            tar.change(setProps(src), {
                leave: notExistSource && i >= h
            });
        }
        i++;
    }

}


export function BrGanttId(t) {
    return isBrGanttId(t) ? t : `bgid-${t}`
}

export function isBrGanttId(t) {
    return String(t).startsWith("bgid-")
}

export function BrGanttSourceId(t) {
    return isBrGanttId(t) ? t.substring(5) : t
}

export function fromArray(arr) {
    const res = {};

    for (const item of arr) {
        item.id = BrGanttId(item.id);
        if ( "rowId" in item ) {
            item.rowId = BrGanttId(item.rowId);
        }
        if ( "parentId" in item ) {
            item.parentId = BrGanttId(item.parentId);
        }

        if ( "dependant" in item ) {
            item.dependant = item.dependant.map((v => BrGanttId(v)));
        }

        if ( "linkedWith" in item ) {
            item.linkedWith = item.linkedWith.map((v => BrGanttId(v)));
        }
        res[item.id] = item;
    }

    return res;
};