

export class TimeUnit {
    constructor (nm, timeUnit) {
        this.name = nm;
		this.milliseconds = timeUnit;
    }
    toString() {
			return this.name;
	}
}

TimeUnit.MILLISECOND = new TimeUnit("millisecond", 1);
TimeUnit.SECOND = new TimeUnit("second", 1000);
TimeUnit.MINUTE = new TimeUnit("minute", 60 * 1000);
TimeUnit.HOUR = new TimeUnit("hour (elapsed)", 60 * TimeUnit.MINUTE.milliseconds);
TimeUnit.DAY = new TimeUnit("day", 24 * TimeUnit.HOUR.milliseconds);
TimeUnit.YEAR = new TimeUnit("year", 366 * TimeUnit.DAY.milliseconds);
TimeUnit.WEEK = new TimeUnit("week", 7 * TimeUnit.DAY.milliseconds);
TimeUnit.MONTH = new TimeUnit("month", 31 * TimeUnit.DAY.milliseconds);
TimeUnit.QUARTER = new TimeUnit("quarter", (2 * 31 + 30) * TimeUnit.DAY.milliseconds);
TimeUnit.HALFYEAR = new TimeUnit("half-year", (4 * 31 + 2 * 30) * TimeUnit.DAY.milliseconds);
TimeUnit.DECADE = new TimeUnit("decade", (8 * 366 + 2 * 365) * TimeUnit.DAY.milliseconds);
TimeUnit.HOUR_CALENDAR = new TimeUnit("hour (calendar)", 60 * TimeUnit.MINUTE.milliseconds);

export class GregorianCalendar {
    constructor() {
        this.minimalDaysInFirstWeek = 1; // 첫번째 주차에 존재해야 할 최소 일수
		this.firstDayOfWeek = 0; // //주차 결정에 첫번재 요일 값 (0 ~ 6)
    }
    
    floor(dt, unit, precision, refDt) {
        let timeUnit = TimeUnit;
        switch(unit) {
            case timeUnit.MILLISECOND:
                return this._floorToMillisecond(dt, precision, refDt);
            case timeUnit.SECOND:
                return this._floorToSecond(dt, precision, refDt);
            case timeUnit.MINUTE:
                return this._floorToMinute(dt, precision, refDt);
            case timeUnit.HOUR:
                return this._floorToHour(dt, precision, refDt);
            case timeUnit.HOUR_CALENDAR:
                return this._floorToHourCalendar(dt, precision, refDt);
            case timeUnit.DAY:
                return this._floorToDay(dt, precision, refDt);
            case timeUnit.WEEK:
                return this._floorToWeek(dt, precision, refDt);
            case timeUnit.MONTH:
                return this._floorToMonth(dt, precision, refDt);
            case timeUnit.QUARTER:
                return this._floorToMonth(dt, precision * 3, refDt);
            case timeUnit.HALFYEAR:
                return this._floorToMonth(dt, precision * 6, refDt);
            case timeUnit.YEAR:
                return this._floorToYear(dt, precision, refDt);
            case timeUnit.DECADE:
                return this._floorToYear(dt, precision * 10, refDt);
            default:
                console.error("unknown.timeunit(" + unit.toString() + ")");
                break;
        }
    }

    round(dt, unit, precision, refDt) {
        return this.floor(new Date(dt.getTime() + dt.getMilliseconds() * precision / 2), unit, precision, refDt);
    }

    _floorToMillisecond(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedMilliseconds(refDt, dt), milliseconds;
        if (refDt.getTime() < dt.getTime()) {
            milliseconds = precision * Math.floor(elapsed / precision);
        } else if (refDt.getTime() == dt.getTime()) {
            milliseconds = 0;
        } else {
            milliseconds = (-precision) * (1 + Math.floor((-elapsed) / precision));
        }
        return new Date(refDt.getTime() + milliseconds);
    }

    _floorToSecond(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedSeconds(refDt, dt), seconds;
        if (refDt.getTime() < dt.getTime()) {
            seconds = precision * Math.floor(elapsed / precision);
        } else if (refDt.getMilliseconds() == dt.getMilliseconds()) {
            seconds = precision * Math.floor(elapsed / precision);
        } else {
            seconds = (-precision) * (1 + Math.floor((-elapsed) / precision));
        }
        return new Date(refDt.getTime() + seconds * TimeUnit.SECOND.milliseconds);
    }

    _floorToMinute(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedMinutes(refDt, dt), minutes;
        if (refDt.getTime() < dt.getTime()) {
            minutes = precision * Math.floor(elapsed / precision);
        } else if (refDt.getSeconds() == dt.getSeconds() &&
                    refDt.getMilliseconds() == dt.getMilliseconds()) {
            minutes = precision * Math.floor(elapsed / precision);
        } else {
            minutes = (-precision) * (1 + Math.floor((-elapsed) / precision));
        }
        return new Date(refDt.getTime() + minutes * TimeUnit.MINUTE.milliseconds);
    }

    _floorToHour(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedHours(refDt, dt), hour;
        if ( refDt.getTime() < dt.getTime() ) {
            hour = refDt.getHours() + (precision * Math.floor(elapsed / precision));
        } else if (refDt.getMinutes() == dt.getMinutes() &&
                    refDt.getSeconds() == dt.getSeconds() &&
                    refDt.getMilliseconds() == dt.getMilliseconds()) {
            hour = refDt.getHours() + (precision * Math.floor(elapsed / precision));
        } else {
            hour = refDt.getHours() - (precision * (1 + Math.floor((-elapsed) / precision)));
        }
        return new Date(refDt.getTime() + hour * TimeUnit.HOUR.milliseconds);
    }

    _floorToHourCalendar(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let hours = refDt.getHours() + dt.getHours() - dt.getHours() % precision;
        let resDt = new Date();
        resDt.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate());
        resDt.setHours(hours, dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
        return resDt;
    }

    _floorToDay(dt, precision, refDt) {
        if (precision == 1 && refDt == null) {
            let resDt = new Date();
            resDt.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate());
            resDt.setHours(0, 0, 0, 0);
            return resDt;
        }
        return this._floorToDayWithReferenceDate(dt, precision, refDt);
    }

    _floorToDayWithReferenceDate(dt, precision, refDt)
    {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        if (precision == 1) {
            let resDt = new Date();
            resDt.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate());
            resDt.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
            return resDt;
        }
        let elapsed = this.getElapsedDays(refDt, dt), days;
        if (refDt.getTime() < dt.getTime()) {
            days = refDt.getDate() + precision * Math.floor(elapsed / precision);
        } else if (refDt.getHours() == dt.getHours() &&
                refDt.getMinutes() == dt.getMinutes() &&
                refDt.getSeconds() == dt.getSeconds() &&
                refDt.getMilliseconds() == dt.getMilliseconds()) {
            days = refDt.getDate() + precision * Math.floor(elapsed / precision);
        } else {
            days = refDt.getDate() - precision * (1 + Math.floor((-elapsed) / precision));
        }

        let resDt = new Date();
        resDt.setFullYear(refDt.getFullYear(), refDt.getMonth(), days);
        resDt.setHours(refDt.getHours(), refDt.getMinutes(), refDt.getSeconds(), refDt.getMilliseconds());
        return resDt;
    }

    _floorToWeek(dt, precision, refDt) {
        let nW = this.getWeek(dt);
        let nQ = nW - (nW - 1) % precision;
        if (nQ < 1) {
            nQ = 1;
        }
        let nGap = 7 * (nW - nQ) + this.getRelativeDayOfWeek(dt);
        let resDt;

        if ( refDt == null ) {
            refDt = GregorianCalendar.getDefaultRefDt();
            resDt = new Date(dt.getTime());
            resDt = this._addDays(resDt, -nGap, true);
            resDt.setHours(refDt.getHours(), refDt.getMinutes(), refDt.getSeconds(), refDt.getMilliseconds());
            return resDt;
        }

        resDt = new Date(dt.getTime());
        resDt.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate() - nGap);
        resDt.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
        return resDt;
    }

    _floorToMonth(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedMonths(refDt, dt), months;
        if (refDt.getTime() < dt.getTime()) {
            months = refDt.getMonth() + precision * Math.floor(elapsed / precision);
        } else if (refDt.getDate() == dt.getDate() &&
                refDt.getHours() == dt.getHours() &&
                refDt.getMinutes() == dt.getMinutes() &&
                refDt.getSeconds() == dt.getSeconds() &&
                refDt.getMilliseconds() == dt.getMilliseconds()) {
            months = refDt.getMonth() + precision * Math.floor(elapsed / precision);
        } else {
            months = refDt.getMonth() - precision * (1 + Math.floor((-elapsed) / precision));
        }
        let resDt = new Date();
        resDt.setFullYear(refDt.getFullYear(), months, refDt.getDate());
        resDt.setHours(refDt.getHours(), refDt.getMinutes(), refDt.getSeconds(), refDt.getMilliseconds());
        return resDt;
    }

    _floorToYear(dt, precision, refDt) {
        if (precision == 1 && refDt == null) {
            let resDt = new Date();
            resDt.setFullYear(dt.getFullYear(), 0, 1);
            resDt.setHours(0, 0, 0, 0);
            return resDt;
        }
        return this._floorToYearWithReferenceDate(dt, precision, refDt);
    }

    _floorToYearWithReferenceDate(dt, precision, refDt) {
        if (refDt == null) {
            refDt = GregorianCalendar.getDefaultRefDt();
        }
        let elapsed = this.getElapsedYears(refDt, dt), years;
        if (refDt.getTime() < dt.getTime()) {
            years = refDt.getFullYear() + precision * Math.floor(elapsed / precision);
        } else if (refDt.getMonth() == dt.getMonth() &&
                refDt.getDate() == dt.getDate() &&
                refDt.getHours() == dt.getHours() &&
                refDt.getMinutes() == dt.getMinutes() &&
                refDt.getSeconds() == dt.getSeconds() &&
                refDt.getMilliseconds() == dt.getMilliseconds()) {
            years = refDt.getFullYear() + precision * Math.floor(elapsed / precision);
        } else {
            years = refDt.getFullYear() - precision * (1 + Math.floor((-elapsed) / precision));
        }
        let resDt = new Date();
        resDt.setFullYear(years, refDt.getMonth(), refDt.getDate());
        resDt.setHours(refDt.getHours(), refDt.getMinutes(), refDt.getSeconds(), refDt.getMilliseconds());
        return resDt;
    }

    addUnits(dt, unit, incVal, isNotClone) {
        if ( isNotClone === undefined ) isNotClone = false;
        let timeUnit = TimeUnit;
        switch(unit) {
            case timeUnit.MILLISECOND:
            case timeUnit.SECOND:
            case timeUnit.MINUTE:
            case timeUnit.HOUR:
                return this._addConstantUnits(dt, unit, incVal, isNotClone);
            case timeUnit.HOUR_CALENDAR:
                return this._addHoursCalendar(dt, incVal, isNotClone);
            case timeUnit.DAY:
                return this._addDays(dt, incVal, isNotClone);
            case timeUnit.WEEK:
                return this._addDays(dt, incVal * 7, isNotClone);
            case timeUnit.MONTH:
                return this._addMonths(dt, incVal, isNotClone);
            case timeUnit.QUARTER:
                return this._addMonths(dt, incVal * 3, isNotClone);
            case timeUnit.HALFYEAR:
                return this._addMonths(dt, incVal * 6, isNotClone);
            case timeUnit.YEAR:
                return this._addYears(dt, incVal, isNotClone);
            case timeUnit.DECADE:
                return this._addYears(dt, incVal * 10, isNotClone);
            default:
                console.error("unknown.timeunit(" + unit.toString() + ")");
                break;
        }
    }

    _addConstantUnits(dt, unit, incVal, isNotClone) {
        if (isNotClone) {
            dt.setTime(dt.getTime() + unit.milliseconds * incVal);
            return dt;
        }
        return new Date(dt.getTime() + unit.milliseconds * incVal);
    }

    _addHoursCalendar(dt, incVal, isNotClone) {
        let resDt = isNotClone ? (dt) : (new Date(dt.getTime()));
        resDt.setHours(dt.getHours() + incVal);
        return resDt;
    }

    _addDays(dt, incVal, isNotClone) {
        dt = isNotClone ? (dt) : (new Date(dt.getTime()));
        let offset0 = dt.getTimezoneOffset();
        dt.setTime(dt.getTime() + incVal * TimeUnit.DAY.milliseconds);
        let offset1 = dt.getTimezoneOffset();
        if (offset1 != offset0) {
            dt.setTime(dt.getTime() + (offset1 - offset0) * TimeUnit.MINUTE.milliseconds);
        }
        return dt;
    }

    _addMonths(dt, incVal, isNotClone) {
        dt = isNotClone ? (dt) : (new Date(dt.getTime()));
        dt.setMonth(dt.getMonth() + incVal);
        return dt;
    }

    _addYears(dt, incVal, isNotClone) {
        dt = isNotClone ? (dt) : (new Date(dt.getTime()));
        let y = dt.getFullYear() + incVal;
        dt.setFullYear(y);
        return dt;
    }
	
    getWeek(dt, refDt) {
        let minimalDay = this.minimalDaysInFirstWeek;
        let lsDt0 = this.getLastDayOfWeek(dt);
        let lsDt1 = this._floorToYear(lsDt0, 1, refDt);
        if (this.getDays(lsDt1, lsDt0) + 1 < minimalDay) {
            lsDt1 = this._addYears(lsDt1, -1, true);
        }
        lsDt1 = this._addDays(lsDt1, minimalDay--, false);
        lsDt1 = this.getLastDayOfWeek(lsDt1, true);
        return 1 + Math.round((lsDt0.getTime() - lsDt1.getTime()) / TimeUnit.WEEK.milliseconds);
    }

    getDaysInYear(nYear) {
        return this.isLeapYear(nYear) ? (366) : (365);
    }
	
    getDayOfYear(dt) {
        let nMon = dt.getMonth();
        let nDay = GregorianCalendar._dayOfYearOffset[nMon] + dt.getDate();
        if (nMon > 1 && this.isLeapYear(dt.getFullYear())) {
            nDay = nDay + 1;
        }
        return nDay;
    }

    getHoursInDay(dt) {
        let dt0 = this.floor(dt, TimeUnit.DAY, 1);
        return Math.floor((dt.getTime() - dt0.getTime()) / TimeUnit.HOUR.milliseconds);
    }

    getQuarter(dt) {
        return Math.floor(dt.getMonth() / 3) + 1;
    }

    getHalfYear(dt) {
        return dt.getMonth() < 6 ? (1) : (2);
    }

    getDecade(dt) {
        return Math.floor(dt.getFullYear() / 10);
    }

	isLeapYear(nYear) {
        if (nYear % 400 == 0) {
            return true;
        }
        if (nYear % 100 == 0) {
            return false;
        }
        if (nYear % 4 == 0) {
            return true;
        }
        return false;
    }

    getDaysInMonth(month, year) {
        let day = GregorianCalendar.DAYS_IN_MONTH[month];
        if (month == 1 && this.isLeapYear(year)) {
            day = day + 1;
        }
        return day;
    }

    getDays(dt0, dt1) {
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
        }
        let nDay = this.getDayOfYear(dt1) - this.getDayOfYear(dt0);
        let nYear0 = dt0.getFullYear();
        let nYear1 = dt1.getFullYear();
        while (nYear0++ < nYear1) {
            nDay = nDay + this.getDaysInYear(nYear0);
        }
        return nDay;
    }

    getUnitValue(dt, unit, refDt) {
        if (refDt == null) {
            return this.getPredefinedUnitValue(dt, unit);
        }
        return this._getShiftedUnitValue(dt, unit, refDt);
    }

    getPredefinedUnitValue(dt, unit) {
        let timeUnit = TimeUnit;
        switch(unit) {
            case timeUnit.MILLISECOND:
                return dt.getMilliseconds();
            case timeUnit.SECOND:
                return dt.getSeconds();
            case timeUnit.MINUTE:
                return dt.getMinutes();
            case timeUnit.HOUR:
                return this.getHoursInDay(dt);
            case timeUnit.HOUR_CALENDAR:
                return dt.getHours();
            case timeUnit.DAY:
                return dt.getDate();
            case timeUnit.WEEK:
                return this.getWeek(dt);
            case timeUnit.MONTH:
                return dt.getMonth();
            case timeUnit.QUARTER:
                return this.getQuarter(dt);
            case timeUnit.HALFYEAR:
                return this.getHalfYear(dt);
            case timeUnit.YEAR:
                return dt.getFullYear();
            case timeUnit.DECADE:
                return this.getDecade(dt);
            default:
                console.error("unknown.timeunit(" + unit.toString() + ")");
                break;
        }
    }

    _getShiftedUnitValue(dt, unit, refDt) {
        if (unit == TimeUnit.WEEK) {
            return this.getWeek(dt, refDt);
        }
        if (this._previousStartOfYear == null || this._previousStartOfYear.getTime() != refDt.getTime()) {
            this._previousStartOfYear = new Date(refDt.getTime());
            let dt0 = new Date();
            dt0.setFullYear(1999, refDt.getMonth(), refDt.getDate());
            dt0.setHours(0, 0, 0, 0);
            let dt1 = new Date();
            dt1.setFullYear(1999, 0, 1);
            dt1.setHours(0, 0, 0, 0);
            this._previousStartOfYearOffset = dt0.getTime() - dt1.getTime();
        }
        let retVal = dt.getTime() - this._previousStartOfYearOffset;
        if (this.isLeapYear(dt.getFullYear()) && dt.getMonth() > 1) {
            retVal = retVal - 24 * 3600 * 1000;
        }
        return this.getPredefinedUnitValue(new Date(retVal), unit);
    }

    getElapsedUnits(dt0, dt1, unit) {
        let timeUnit = TimeUnit;
        switch(unit) {
            case timeUnit.MILLISECOND:
                return this.getElapsedMilliseconds(dt0, dt1);
            case timeUnit.SECOND:
                return this.getElapsedSeconds(dt0, dt1);
            case timeUnit.MINUTE:
                return this.getElapsedMinutes(dt0, dt1);
            case timeUnit.HOUR:
                return this.getElapsedHours(dt0, dt1);
            case timeUnit.HOUR_CALENDAR:
                return this.getElapsedCalendarHours(dt0, dt1);
            case timeUnit.DAY:
                return this.getElapsedDays(dt0, dt1);
            case timeUnit.WEEK:
                return this.getElapsedWeeks(dt0, dt1);
            case timeUnit.MONTH:
                return this.getElapsedMonths(dt0, dt1);
            case timeUnit.QUARTER:
                return this.getElapsedQuarters(dt0, dt1);
            case timeUnit.HALFYEAR:
                return this.getElapsedHalfYears(dt0, dt1);
            case timeUnit.YEAR:
                return this.getElapsedYears(dt0, dt1);
            case timeUnit.DECADE:
                return this.getElapsedDecades(dt0, dt1);
            default:
                console.error("unknown.timeunit(" + unit.toString() + ")");
                break;
        }
    }

    getElapsedMilliseconds(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = dt1.getTime() - dt0.getTime();
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedSeconds(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = dt1.getTime() - dt0.getTime();
        elapsed = Math.floor(elapsed / 1000);
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedMinutes(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = dt1.getTime() - dt0.getTime();
        elapsed = Math.floor(elapsed / (60 * 1000));
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedHours(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = dt1.getTime() - dt0.getTime();
        elapsed = Math.floor(elapsed / (60 * 60 * 1000));
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedCalendarHours(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            var tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = this.getElapsedHours(dt0, dt1);
        let timezone = dt1.getTimezoneOffset() - dt0.getTimezoneOffset();
        timezone = Math.floor(timezone / 60);
        elapsed = elapsed - timezone;
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedDays(dt0, dt1, fractdigit) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = dt1.getTime() - dt0.getTime() + TimeUnit.MINUTE.milliseconds * (-dt1.getTimezoneOffset() + dt0.getTimezoneOffset());
        if ( fractdigit > 0 ) {
            elapsed = Math.floor(elapsed / TimeUnit.DAY.milliseconds, fractdigit);
        } else {
            elapsed = Math.floor(elapsed / TimeUnit.DAY.milliseconds);
        }
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedWeeks(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = this.getElapsedDays(dt0, dt1);
        elapsed = Math.floor(elapsed / 7);
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedMonths(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = 12 * (dt1.getFullYear() - dt0.getFullYear());
        elapsed = elapsed + (dt1.getMonth() - dt0.getMonth());
        if (dt1.getDate() < dt0.getDate() && dt1.getDate() != this.getDaysInMonth(dt0.getMonth(), dt0.getFullYear())) {
            elapsed--;
        }
        else if (dt1.getDate() == dt0.getDate() && this._getTimeOfDayInMillis(dt1) < this._getTimeOfDayInMillis(dt0)) {
            elapsed--;
        }
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedQuarters(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = this.getElapsedMonths(dt0, dt1);
        elapsed = Math.floor(elapsed / 3);
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedHalfYears(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = this.getElapsedMonths(dt0, dt1);
        elapsed = Math.floor(elapsed / 6);
        return notSwap ? (elapsed) : (-elapsed);
    }

    getElapsedYears(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed;
        if (dt0.getFullYear() == dt1.getFullYear()) {
            elapsed = 0;
        } else {
            elapsed = dt1.getFullYear() - dt0.getFullYear();
            let day1 = this._getDayOfLeapYear(dt1);
            let day0 = this._getDayOfLeapYear(dt0);
            if (day1 < day0) {
                elapsed--;
            } else if (day1 == day0 && this._getTimeOfDayInMillis(dt1) < this._getTimeOfDayInMillis(dt0)) {
                elapsed--;
            }
        }
        return notSwap ? (elapsed) : (-_elapsed);
    }

    _getDayOfLeapYear(dt) {
        let month = dt.getMonth();
        let day = GregorianCalendar.DAYS_OF_THE_YEAR_OFFSET[month] + dt.getDate();
        if (month > 1) {
            day = day + 1;
        }
        return day;
    }

    getElapsedDecades(dt0, dt1) {
        let notSwap = true;
        if (dt0 > dt1) {
            let tmpdt = dt1;
            dt1 = dt0;
            dt0 = tmpdt;
            notSwap = false;
        }
        let elapsed = this.getElapsedYears(dt0, dt1);
        elapsed = Math.floor(elapsed / 10);
        return notSwap ? (elapsed) : (-elapsed);
    }

    getLastDayOfWeek(dt, isNotClone) {
        if ( isNotClone === undefined ) isNotClone = false;
        return this._addDays(dt, 6 - this.getRelativeDayOfWeek(dt), isNotClone);
    }

    getRelativeDayOfWeek(dt) {
        let day = dt.getDay();
        let nGap = day - this.firstDayOfWeek;
        if (nGap < 0)
        {
            nGap = nGap + 7;
        }
        return nGap;
    }

    _getTimeOfDayInMillis(dt) {
        let millisec = dt.getTime() - dt.getTimezoneOffset() * TimeUnit.MINUTE.milliseconds;
        millisec = millisec % TimeUnit.DAY.milliseconds;
        if (millisec < 0) {
            millisec = millisec + TimeUnit.DAY.milliseconds;
        }
        return millisec;
    }
}

GregorianCalendar.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
GregorianCalendar.getDefaultRefDt = function() {
    if ( this._defaultRefDt == null || this._defaultRefDt.getTimezoneOffset() != this._oldTimezoneRef ) {
        let refdt = new Date();
        refdt.setFullYear(2000, 0, 1);
        refdt.setHours(0, 0, 0, 0);
        this._oldTimezoneRef = refdt.getTimezoneOffset();
        this._defaultRefDt = refdt;
    }
    return this._defaultRefDt;
};

/**
 * 월별 일자 Offset.
 */
GregorianCalendar._dayOfYearOffset = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];