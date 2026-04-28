import {GregorianCalendar, TimeUnit} from "./GregorianCalendar.js";


let MIN_DT = new Date();
MIN_DT.setFullYear(100, 0, 1);
MIN_DT.setHours(0, 0, 0, 0);

let MAX_DT = new Date();
MAX_DT.setFullYear(10000, 0, 1);
MAX_DT.setHours(0, 0, 0, 0);

let MAXDATE = MAX_DT;
let MINDATE = MIN_DT;

function checkBound(dt, min, max) {
    if ( dt < min ) dt = min;
    if ( dt > max ) dt = max;
    return dt
}

export class TimelineMgr {

    constructor() {
        this._maximumTime = new Date();
        this._maximumTime.setFullYear(2900, 0, 1);
        this._maximumTime.setHours(0, 0, 0, 0);
        this._minimumTime = new Date();
        this._minimumTime.setFullYear(1900, 0, 1);
        this._minimumTime.setHours(0, 0, 0, 0);
    }

    get startTime() {
        return this._startTime;
    }

    set startTime(value) {
        this._startTime = this._getConstrainedStart(value);
        if ( this.width > 0 ) {
            this._endTime = this.getTime(this.width);
        }
    }

    get endTime() {
        return this._endTime;
    }

    set endTime(value) {
        return this._endTime = value;
    }

    get maximumTime() {
        return this._maximumTime;
    }

    set maximumTime(value) {
        this._minimumTime = checkBound(this._minimumTime, MINDATE, MAXDATE);
        this._maximumTime = checkBound(value, MINDATE, MAXDATE);
    }

    get minimumTime() {
        return this._minimumTime;
    }

    set minimumTime(value) {
        this._minimumTime = checkBound(value, MINDATE, MAXDATE);
        this._maximumTime = checkBound(this._maximumTime, MINDATE, MAXDATE);
    }

    get maximumZoomFactor() {
        if ( this._maximumZoomFactor == null ) {
            this._maximumZoomFactor = TimeUnit.DECADE.milliseconds / 20;
        }
        return this._maximumZoomFactor;
    }

    set maximumZoomFactor(value) {
        this._maximumZoomFactor = value;
        if (this._configured) {
            if (this._zoomFactor > this._maximumZoomFactor) {
                this._zoomFactor = this._maximumZoomFactor;
            }
        }
    }

    get minimumZoomFactor() {
        if ( this._minimumZoomFactor == null ) {
            this._minimumZoomFactor = TimeUnit.MILLISECOND.milliseconds / 1;
        }
        return this._minimumZoomFactor;
    }

    set minimumZoomFactor(value) {
        let minfactor = TimelineMgr.MINIMUM_ZOOM_FACTOR;
        if (value < minfactor) {
            value = minfactor;
        }
        this._minimumZoomFactor = value;
        if (this._configured) {
            if (this._zoomFactor < this._minimumZoomFactor) {
                this._zoomFactor = this._minimumZoomFactor;
            }
        }
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        let millisec = this._getTimeInMillis(this._width);
        if (millisec > this._maximumTime.getTime()) {
            let millisec0 = this._startTime.getTime() - (millisec - this._maximumTime.getTime());
            let zfactor = this._zoomFactor;
            if (millisec0 < this._minimumTime.getTime()) {
                zfactor = (this._maximumTime.getTime() - this._minimumTime.getTime()) / this.width;
                millisec0 = this._minimumTime.getTime();
            }
            this._startTime = new Date(millisec0);
            this._zoomFactor = zfactor;
        } else {
            this._endTime = new Date(millisec);
        }
    }

    get zoomFactor() {
        if ( this._zoomFactor == null ) {
            this._zoomFactor = TimeUnit.DAY.milliseconds / 20;
        }
        return this._zoomFactor;
    }

    set zoomFactor(value) {
        this._zoomFactor = this._getConstrainedZoomFactor(value);
		this._endTime = this.getTime(this._width);
    }

    /**
     * 주어진 dt 값에 해당하는 위치 값을 pixel로 얻는다.
     * @param {Date} dt Date 값
     * @param {boolean} isFloor pixel값을 floor처리 할 것인지 여부
     * @return {Number} 주어진 Date 값에 해당하는 x 위치 값
     * @memberOf TimelineMgr
    */
    getCoordinate(dt, isFloor) {
        let dist = (dt.getTime() - this.startTime.getTime())/ this.zoomFactor;
        return isFloor ? (Math.floor(dist)) : (dist);
    }
    /**
     * 주어진 pos 값에 해당하는 Date 값을 얻는다.
     * @param {Number} pos x 위치 값(pixel)
     * @return {Date} 주어진 pos 값에 해당하는 Date 값
     * @memberOf Gantt.TimelineMgr
    */
    getTime(pos) {
        return new Date(this._getTimeInMillis(pos));
    }
    /**
     * 주어진 pos 값에 해당하는 millisecond 값을 얻는다.
     * @param {Number} pos x 위치 값(pixel)
     * @return {Number} 주어진 pos 값에 해당하는 millisecond 값
     * @private
     * @memberOf Gantt.TimelineMgr
    */
    _getTimeInMillis(pos) {
        return this.startTime.getTime() + pos * this.zoomFactor;
    }
    
    /**
     * 주어진 dt 값으로 startTime을 변경한다.
     * @param {Date} dt startTime으로 설정할 Date값
     * @memberOf Gantt.TimelineMgr
    */
    moveTo(dt) {
        this.startTime = dt;
    }
    /**
     * 주어진 pos 값만큼 startTime을 이동한다.
     * @param {Number} pos 이동할 x 거리
     * @memberOf Gantt.TimelineMgr
    */
    shiftByCoordinate(pos) {
        let sdt = new Date(this.startTime.getTime() + pos * this.zoomFactor);
        //trace("shiftByCoordinate(" + this.zoomFactor + ")==>" + sdt);
        this.moveTo(sdt);
    }
    /**
     * 주어진 ratio로 zoomFactor를 조정하고 startTime을 width의 center로 이동한다.
     * @param {Number} ratio 조정할 비율
     * @param {Date=} dt center로 이동할 기준 Date값
     * @memberOf Gantt.TimelineMgr
    */
    zoomAndCenter(ratio, dt) {
        let millisec;
        if ( dt == null ) {
            millisec = this._getTimeInMillis(this.width/2);
        } else {
            millisec = dt.getTime();
        }
        this.zoomFactor = this.zoomFactor * ratio;
        this.startTime = new Date(millisec - this.width /2 * this.zoomFactor);
    }
    /**
     * 주어진 ratio로 zoomFactor를 조정한다.
     * @param {Number} ratio 조정할 비율
     * @param {Number} pos zoomFactor 비율 조정 후에 시작할 위치
     * @memberOf Gantt.TimelineMgr
    */
    zoomAt(ratio, pos) {
        let millisec = this._getTimeInMillis(pos);
        this.zoomFactor = this.zoomFactor * ratio;
        this.startTime = new Date(this.startTime.getTime() + millisec - this._getTimeInMillis(pos));
    }
    /**
     * 주어진 dt를 기준으로 timeunit 단위로 val만큼 조정된 Date 값을 startTime으로 설정한다.
     * @param {Date} dt Date값
     * @param {TimeUnit} unit TimeUnit
     * @param {Number} val 조정할 시간 값
     * @memberOf Gantt.TimelineMgr
    */
    focusOn(dt, unit, val) {
        let dt0 = this.calendar.floor(dt, unit, val);
        let dt1 = this.calendar.addUnits(dt0, unit, val);
        this.setConfig(dt0, dt1, this.width);
    }
    /**
     * 주어진 dt0, dt1 기간과, 주어진 w 값을 기준으로 timeLine(startTime, endTime)을 구성한다.
     * @param {Date} dt0 시작 Date값
     * @param {Date} dt1 끝 Date값
     * @param {Number} w width 값
     * @param {Number=} margin 기간 양쪽 margin 값(default: 0)
     * @memberOf Gantt.TimelineMgr
    */
    setConfig(dt0, dt1, w, margin) {
        if ( isNaN(margin) ) margin = 0;
        if ( this._configured ) {
            this._resetConfig(dt0, dt1, w, margin);
        } else {
            this._setDefaultConfig(dt0, dt1, w, margin);
        }
        this._configured = true;
    }
    /**
     * 최초 setConfig함수를 호출할 때 사용하는 내부 함수이다.
     * @param {Date} dt0 시작 Date값
     * @param {Date} dt1 끝 Date값
     * @param {Number} w width 값
     * @param {Number} margin 기간 양쪽 margin 값
     * @private
     * @memberOf Gantt.TimelineMgr
    */
    _setDefaultConfig(dt0, dt1, w, margin) {
        this.startTime = this._getConstrainedStart(dt0);
        let dist = (w > 2 * margin) ? ((dt1.getTime() - dt0.getTime()) / (w - 2 * margin)) : (dt1.getTime() - dt0.getTime());
        this.zoomFactor = this._getConstrainedZoomFactor(dist);
        if (margin != 0) {
            dt0 = new Date(dt0.getTime() - this.zoomFactor * margin);
        }
        this.endTime = this.getTime(w);
        this.width = w;
        
    }
    /**
     * 최초 setConfig함수를 호출한 이 후에 다시 setConfig함수호출할 때 사용하는 내부 함수이다.
     * @param {Date} dt0 시작 Date값
     * @param {Date} dt1 끝 Date값
     * @param {Number} w width 값
     * @param {Number} margin 기간 양쪽 margin 값
     * @private
     * @memberOf Gantt.TimelineMgr
    */
    _resetConfig(dt0, dt1, w, margin) {
        let sdt = new Date(this.startTime.getTime());
        let edt = new Date(this.endTime.getTime());
        let centerDt = new Date((dt1.getTime() + dt0.getTime()) / 2);
        let pos = this.getCoordinate(centerDt);
        this._setDefaultConfig(dt0, dt1, w, margin);
        if (dt0.getTime() < this.endTime.getTime()) {
            if (dt0.getTime() <= sdt.getTime()) {
            } else if (dt0.getTime() >= edt.getTime()) {
                this.shiftByCoordinate(this.getCoordinate(beginDraw) - beginDraw);
            } else {
                this.shiftByCoordinate(this.getCoordinate(centerDt) - pos);
            }
        }
    }
    /**
     * startTime 설정할 때 minimumTime, maximumTime 사이에 존재하는지 check하여 보정하는 처리
     * @param {Date} dt 시작 Date값
     * @return {Date} minimumTime, maximumTime 사이 값으로 보정된 Date값
     * @private
     * @memberOf Gantt.TimelineMgr
    */
    _getConstrainedStart(dt) {
        let millisec = dt.getTime(),
            minMillisec = this.minimumTime.getTime(),
            maxMillisec = this.maximumTime.getTime();
        millisec = Math.max(millisec, minMillisec);
        let zoomMillisec = millisec + this.width * this.zoomFactor;
        if (zoomMillisec > maxMillisec && millisec > minMillisec) {
            millisec = millisec - (zoomMillisec - maxMillisec);
        }
        millisec = Math.max(millisec, minMillisec);
        return new Date(millisec);
    }
    /**
     * zoomFactor 설정할 때 minimumZoomFactor, maximumZoomFactor 사이에 존재하는지 check하여 보정하는 처리
     * @param {Number} ratio zoomFactor값
     * @return {Number} minimumZoomFactor, maximumZoomFactor 사이 값으로 보정된 zoomFactor값
     * @private
     * @memberOf Gantt.TimelineMgr
    */
    _getConstrainedZoomFactor(ratio) {
        if (ratio < this._minimumZoomFactor) {
            ratio = this._minimumZoomFactor;
        }
        if (!isNaN(this._maximumZoomFactor) && ratio > this._maximumZoomFactor) {
            ratio = this._maximumZoomFactor;
        }
        let distRatio = (this._maximumTime.getTime() - this._minimumTime.getTime()) / this._width;
        if (ratio > distRatio) {
            ratio = distRatio;
        }
        return ratio;
    }
}

TimelineMgr.MINIMUM_ZOOM_FACTOR = TimeUnit.MILLISECOND.milliseconds / 1;


export const DateFormats = {
	"hourFullFormat1": "dddd MMMM D YYYY, h a",
	"hourFullFormat2": "ddd MMM DD \'YY h a",
	"dayFullFormat1": "dddd MMMM DD, YYYY",
	"dayFullFormat2": "dddd MMM DD, YYYY",
	"dayFullFormat3": "ddd MMM DD, YY",
	"dayFullFormat4": "MMM DD, YY",
	"monthFullFormat1": "MMMM YYYY",
	"quarterFullFormat1": "Q,YYYY",
	"minuteFormat1": "mm",
	"hourFormat1": "HH",
	"dayFormat1": "ddd DD",
	"dayFormat2": "DD",
	"weekFormat1": "W",
	"monthFormat1": "MMMM",
	"monthFormat2": "MMM",
	"monthFormat3": "MM",
	"quarterFormat1": "Q",
	"yearFormat1": "YYYY",
	"yearFormat2": "YYYY"
};

export const TimelineScaleKinds = [
	[
		[TimeUnit.HOUR, 1, "hourFullFormat1"],
		[TimeUnit.MINUTE, 1, "minuteFormat1"]
	],//0
	[
		[TimeUnit.HOUR, 1, "hourFullFormat1"],
		[TimeUnit.MINUTE, 5, "minuteFormat1"]
	],//1
	[
		[TimeUnit.HOUR, 1, "hourFullFormat2"],
		[TimeUnit.MINUTE, 15, "minuteFormat1"]
	],//2
	[
		[TimeUnit.DAY, 1, "dayFullFormat1"],
		[TimeUnit.HOUR, 1, "hourFormat1"]
	],// day / hours
	[
		[TimeUnit.DAY, 1, "dayFullFormat1"],
		[TimeUnit.HOUR_CALENDAR, 2, "hourFormat1"]
	],//4
	[
		[TimeUnit.DAY, 1, "dayFullFormat2"],
		[TimeUnit.HOUR_CALENDAR, 2, "hourFormat1"]
	],//5
	[
		[TimeUnit.DAY, 1, "dayFullFormat3"],
		[TimeUnit.HOUR_CALENDAR, 2, "hourFormat1"]
	],//6
	[
		[TimeUnit.DAY, 1, "dayFullFormat4"],
		[TimeUnit.HOUR_CALENDAR, 2, "hourFormat1"]
	],//7
	[
		[TimeUnit.DAY, 1, "dayFullFormat1"],
		[TimeUnit.HOUR_CALENDAR, 4, "hourFormat1"]
	],//8
	[
		[TimeUnit.DAY, 1, "dayFullFormat2"],
		[TimeUnit.HOUR_CALENDAR, 4, "hourFormat1"]
	],//9
	[
		[TimeUnit.DAY, 1, "dayFullFormat3"],
		[TimeUnit.HOUR_CALENDAR, 4, "hourFormat1"]
	],//10
	[
		[TimeUnit.DAY, 1, "dayFullFormat4"],
		[TimeUnit.HOUR_CALENDAR, 4, "hourFormat1"]
	],//11
	[
		[TimeUnit.DAY, 1, "dayFullFormat1"],
		[TimeUnit.HOUR_CALENDAR, 12, "hourFormat1"]
	],//12
	[
		[TimeUnit.DAY, 1, "dayFullFormat2"],
		[TimeUnit.HOUR_CALENDAR, 12, "hourFormat1"]
	],//13
	[
		[TimeUnit.DAY, 1, "dayFullFormat3"],
		[TimeUnit.HOUR_CALENDAR, 12, "hourFormat1"]
	],//14
	[
		[TimeUnit.DAY, 1, "dayFullFormat4"],
		[TimeUnit.HOUR_CALENDAR, 12, "hourFormat1"]
	],//15
	[
		[TimeUnit.MONTH, 1, "monthFullFormat1"],
		[TimeUnit.DAY, 1, "dayFormat1"]
	],//16
	[
		[TimeUnit.MONTH, 1, "monthFullFormat1"],
		[TimeUnit.DAY, 1, "dayFormat2"]
	],// 17 month / day
	[
		[TimeUnit.MONTH, 1, "monthFullFormat1"],
		[TimeUnit.WEEK, 1, "weekFormat1"]
	],// 18 month / weeks
	[
		[TimeUnit.QUARTER, 1, "quarterFullFormat1"],
		[TimeUnit.MONTH, 1, "monthFormat1"]
	],//19
	[
		[TimeUnit.QUARTER, 1, "quarterFullFormat1"],
		[TimeUnit.MONTH, 1, "monthFormat2"]
	],//20
	[
		[TimeUnit.QUARTER, 1, "quarterFullFormat1"],
		[TimeUnit.MONTH, 1, "monthFormat3"]
	],//21 quarter / months
	[
		[TimeUnit.YEAR, 1, "yearFormat1"],
		[TimeUnit.QUARTER, 1, "quarterFormat1"]
	],//22 year / quarters 
	[
		[TimeUnit.YEAR, 1, "yearFormat1"],
		[TimeUnit.HALFYEAR, 1, "halfyearFormat1"]
	]//23
];
