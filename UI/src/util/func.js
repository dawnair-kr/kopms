import lodash from "lodash";

/** Detect free variable `global` from Node.js. */
const freeGlobal = typeof global === 'object' && global !== null && global.Object === Object && global;

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis === 'object' && globalThis !== null && globalThis.Object === Object && globalThis;

/** Detect free variable `self`. */
const freeSelf = typeof self === 'object' && self !== null && self.Object === Object && self;

/** Used as a reference to the global object. */
const root = freeGlobalThis || freeGlobal || freeSelf || Function('return this')();

function isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
}

export function isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export function ptTopx(str) {
    let ptVal = parseFloat(str);
    return ptVal * (96 / 72);
}

export function debounce(func, wait, options) {
    let lastArgs;
    let lastThis;
    let maxWait;
    let result;
    let timerId;
    let lastCallTime;
    let lastInvokeTime = 0;
    let leading = false;
    let maxing = false;
    let trailing = true;

    let firstInvokeTime = null; 
    let remainWait = 0;
    let loopInvoke = false;
    // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
    const useRAF = !wait && wait !== 0 && typeof root.requestAnimationFrame === 'function';

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
    }
    wait = +wait || 0;
    if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
        remainWait = maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
        loopInvoke = 'loopInvoke' in options ? !!options.loopInvoke : loopInvoke;
    }

    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;

        if ( !loopInvoke && !trailing ) {
            lastArgs = lastThis = undefined;
        }
        lastInvokeTime = time;
        if ( firstInvokeTime == null ) firstInvokeTime = time;
        result = func.apply(thisArg, args);
        
        return result;
    }

    function startTimer(pendingFunc, milliseconds) {
        if (useRAF) {
            root.cancelAnimationFrame(timerId);
            return root.requestAnimationFrame(pendingFunc);
        }
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return setTimeout(pendingFunc, milliseconds);
    }

    function cancelTimer(id) {
        if (useRAF) {
            root.cancelAnimationFrame(id);
            return;
        }
        clearTimeout(id);
    }

    function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = startTimer(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;

        return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }

    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        remainWait = firstInvokeTime == null ? maxWait : maxWait - (time - firstInvokeTime + wait);

        /*
        console.log("lastCallTime", lastCallTime,
            "timeSinceLastCall", timeSinceLastCall,
            "timeSinceLastInvoke", timeSinceLastInvoke,
            "wait", wait,
            "maxWait", maxWait,
            "maxing", maxing,
            "time", time,
            "lastInvokeTime", lastInvokeTime,
            "lastArgs", lastArgs,
            "firstInvokeTime", firstInvokeTime,
            "remainWait", remainWait,
            (
                lastCallTime === undefined ||
                timeSinceLastCall >= wait ||
                timeSinceLastCall < 0 ||
                (maxing && remainWait >= maxWait)
            )
        )
        */

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (
            lastCallTime === undefined ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            //(maxing && timeSinceLastInvoke >= maxWait)
            (maxing && remainWait >= 0 )
        );
    }

    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            if (loopInvoke && maxing && remainWait > wait ) {
                //console.log("remainWait", remainWait);
            
                timerId = startTimer(timerExpired, wait);
                if ( lastArgs ) {
                    result = invokeFunc(time);
                }
                return;
            } else {
                //console.log("trailingEdge", remainWait);
            
                return trailingEdge(time);
            }
        }
        timerId = startTimer(timerExpired, remainingWait(time));
        return undefined;
    }

    function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        //console.log("trailingEdge fff", trailing, lastArgs)
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }

    function cancel() {
        if (timerId !== undefined) {
            cancelTimer(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function pending() {
        return timerId !== undefined;
    }

    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        //console.log("isInvoking", isInvoking, "lastArgs", lastArgs, wait);
        if (isInvoking) {
            if (timerId === undefined) {
                firstInvokeTime = null;
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                // Handle invocations in a tight loop.
                timerId = startTimer(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = startTimer(timerExpired, wait);
        }
        return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;
    return debounced;
}

function isHangul(txt) {
    let lang_ck = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]+$/gm;
    if(lang_ck.test(txt)){
        return true;
    }
    return false;
}

function trimAll(txt) {
    let lang_ck = /\s/gm;
    return txt.replace(lang_ck, "");
}

const TowFamilyName = ["남궁","독고","동방","사공","서문","선우","제갈","황보"];

export function splitName(name, target) {
    let familyName, givenName;

    if ( isHangul(name) ) {
        let trimName = trimAll(name);
        let towName = TowFamilyName.some(name2 => {
            if ( trimName.startsWith(name2) ) {
                return true;
            }
        });
        if ( towName && trimName.length > 3 ) {
            givenName = trimName.substring(2);
            familyName = trimName.substring(0, 2);
        } else {
            givenName = trimName.substring(1);
            familyName = trimName.substring(0, 1);
        }
        
    } else {
        let arr = name.split(/\s/gm);
        givenName = arr[0];
        familyName = arr.slice(1).join(" ");
    }

    if ( target ) {
        Object.assign(target, {
            familyName,
            givenName
        });
    } else {
        return {
            familyName,
            givenName
        };
    }
}

export function setMapData(data, keyName="Id") {
    const map = {};
    lodash.forEach(data, o => {
        map[o[keyName]] = o;
    });
    return map;
}