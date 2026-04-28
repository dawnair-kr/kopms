import lodash from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export function RandomId() {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
	var id = '';
	var num;
	for (var i = 0; i < 5; i++) {
		if ('crypto' in window && 'getRandomValues' in crypto) {
			var count = new Uint16Array(1);
			// tslint:disable-next-line:no-any
			var intCrypto = window.msCrypto || window.crypto;
			num = intCrypto.getRandomValues(count)[0] % (chars.length - 1);
		}
		else {
			num = Math.floor(Math.random() * chars.length);
		}
		if (i === 0 && num < 10) {
			i--;
			continue;
		}
		id += chars.substring(num, num + 1);
	}
	return id;
}

export function NumberWithCommas(double, decimalPointCipher) {
	if (typeof double == "number" && !isNaN(double)) {
		var parts = double.toString().split(".");
		if (parts.length == 2) {
			if (decimalPointCipher == null) {
				decimalPointCipher = 2;
			}
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			parts[1] = parts[1].substr(0, decimalPointCipher);
			if (decimalPointCipher < 1) {
				return parts[0];
			}
			else {
				return parts.join(".");
			}
		} else {
			return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

	} else {
		return "N/A";
	}
}

export function bizNoFormatter(num, type, is_edit, is_limit) {
	let formatNum = '';

	try {
		if (num == null) return null;

		let lastDash = is_edit ? num.endsWith("-") : false;

		let regex = /([\d]+)+/gm;

		let m;
		let a_num = "";
		while ((m = regex.exec(num)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if (match && match.length > 0 && groupIndex > 0) {
					a_num += match;
				}
			});
		}

		//console.log("ffff", lastDash, a_num)	
		if (a_num.length <= 3) return a_num + (lastDash ? "-" : "");
		if (a_num.length <= 5) return `${a_num.slice(0, 3)}-${a_num.slice(3)}${lastDash ? "-" : ""}`;
		if (a_num.length < 10) {
			if (type === 0) {
				return `${a_num.slice(0, 3)}-${a_num.slice(3, 5)}-${a_num.slice(5).padEnd(5, '*')}`;
			}
			return `${a_num.slice(0, 3)}-${a_num.slice(3, 5)}-${a_num.slice(5)}`;
		} else if (is_limit) {
			if (type === 0) {
				return `${a_num.slice(0, 3)}-${a_num.slice(3, 5)}-${a_num.slice(5, 10).padEnd(5, '*')}`;
			}
			return `${a_num.slice(0, 3)}-${a_num.slice(3, 5)}-${a_num.slice(5, 10)}`;
		}

		if (type === 0) {
			return a_num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-*****');
		}
		return a_num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
	} catch (e) {
		if (is_edit) {
			return null;
		} else {
			return num;
		}
	}
}

export function corpNoFormatter(num, is_edit, is_limit) {

	try {
		if (num == null) return null;

		let lastDash = is_edit ? num.endsWith("-") : false;

		let regex = /([\d]+)+/gm;

		let m;
		let a_num = "";
		while ((m = regex.exec(num)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if (match && match.length > 0 && groupIndex > 0) {
					a_num += match;
				}
			});
		}

		if (a_num.length <= 6) return a_num + lastDash ? "-" : "";
		if (a_num.length < 13) return `${a_num.slice(0, 6)}-${a_num.slice(6)}`;
		else if (is_limit) {
			return `${a_num.slice(0, 6)}-${a_num.slice(6, 13)}`;
		}

		return `${a_num.slice(0, 6)}-${a_num.slice(6)}`;
	} catch (e) {
		if (is_edit) {
			return null;
		} else {
			return num;
		}
	}
}

export function phoneFormatter(num, type = 0, is_edit = false) {
	let formatNum = '';
	try {
		if (num == null) {
			return num;
		}
		let lastDash = is_edit ? num.endsWith("-") : false;
		let regex = /([\d|\*]+)+/gm;

		let m;
		let a_num = "";
		while ((m = regex.exec(num)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if (match && match.length > 0 && groupIndex > 0) {
					a_num += match;
				}
			});
		}

		if (a_num.length <= 3) {
			if (a_num.startsWith("02")) {
				if (type == 0) {
					formatNum = a_num.replace(/(\d{2})([\d|\*]{0,1})/, '$1-*');
				} else {
					formatNum = a_num.replace(/(\d{2})(\d{0,1})/, '$1-$2');
				}
			} else {
				formatNum = a_num.replace(/(\d{3})/, '$1') + (lastDash ? "-" : "");
			}
		} else if (a_num.length <= 8) {
			if (a_num.startsWith("02")) {
				if (a_num.length <= 4) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{2})([\d|\*]{0,3})/, (match, p1, p2) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}`;
							if (str.endsWith("-")) {
								return str;
							} else if (lastDash && p2.length == 3) {
								return str + "-";
							}
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{2})(\d{0,3})/, (match, p1, p2) => {
							let str = `${p1}-${p2}`;
							if (str.endsWith("-")) {
								return str;
							} else if (lastDash && p2.length == 3) {
								return str + "-";
							}
							return str;
						});
					}
				} else if (a_num.length <= 6) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{2})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{2})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					}
				} else {
					if (a_num.length <= 8) {
						if (type == 0) {
							formatNum = a_num.replace(/(\d{2})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
								let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
								return str;
							});
						} else {
							formatNum = a_num.replace(/(\d{2})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
								let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
								//console.log('aaaaaaaa', str, p1, p2, p3)
								return str;
							});
						}
					} else {
						if (type == 0) {
							formatNum = a_num.replace(/(\d{2})([\d|\*]{4})(\d{0,4})/, (match, p1, p2, p3) => {
								let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
								return str;
							});
						} else {
							formatNum = a_num.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
								let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
								return str;
							});
						}
					}
				}

			} else {
				if (a_num.length <= 6) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{0,3})/, (match, p1, p2) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}`;
							if (str.endsWith("-")) {
								return str;
							} else if (lastDash && p2.length == 3) {
								return str + "-";
							}
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{0,3})/, (match, p1, p2) => {
							let str = `${p1}-${p2}`;
							if (str.endsWith("-")) {
								return str;
							} else if (lastDash && p2.length == 3) {
								return str + "-";
							}
							return str;
						});
					}
				} else if (a_num.length <= 7) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					}
				} else {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					}
				}
			}
		} else {
			if (a_num.startsWith("02")) {
				if (a_num.length <= 9) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{2})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{2})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					}
				} else {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{2})([\d|\*]{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}${p3 && p3.length ? "-" + p3 : ""}`;
							return str;
						});
					}
				}

			} else {
				if (a_num.length <= 9) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}-${p3}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}-${p3}`;
							return str;
						});
					}
				} else if (a_num.length <= 10) {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}-${p3}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{3})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}-${p3}`;
							return str;
						});
					}
				} else {
					if (type == 0) {
						formatNum = a_num.replace(/(\d{3})([\d|\*]{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${"".padStart(p2.length, "*")}-${p3}`;
							return str;
						});
					} else {
						formatNum = a_num.replace(/(\d{3})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
							let str = `${p1}-${p2}-${p3}`;
							return str;
						});
					}
				}
			}
		}

		if (formatNum.startsWith("02")) {
			formatNum = formatNum.substring(0, 12);
		} else {
			formatNum = formatNum.substring(0, 13);
		}

		//console.log("====>", a_num, formatNum)
	} catch (e) {
		formatNum = num;
	}


	return formatNum;
}

export function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

let default_opt = {
	prefix: '',
	suffix: '',
	thousands: ',',
	decimal: '.',
	precision: 2
};

export function edit_number_format(input, opt = default_opt, editing) {

	// console.log("before br_toFixed", input, opt, editing);

	if (typeof input === 'number') {
		// Decimal 0.9997500000001의 경우 1과 같다.
		// Fixed 한 후에 나오는 값을 integer / decimal에 넣어 주어야 한다.		
		input = input.toFixed(opt.precision);
		input = toStr(input);
	}

	opt = lodash.defaults(opt, default_opt);

	if (input == null) input = "";
	var negative = input.indexOf('-') >= 0 ? '-' : '';

	var numbers = onlyNumbers(input);

	//var currency = numbersToCurrency(numbers, opt.precision)
	var parts = toStr(numbers).split('.');
	// if (parts.length > 2) {
	// 	parts.slice(0, par)
	// }
	var integer = parts[0];
	var decimal = parts[1];

	if ( opt.fixedDecimal && integer == null ) {
		integer = "0";
	}

	if (editing == 'editing' && opt.precision > 0 && decimal == '') {
		decimal = ' ';
	} else {
		//console.log("before br_toFixed", decimal, opt.precision, editing, opt.fixedDecimal);
		decimal = br_toFixed(decimal, opt.precision, editing, opt.fixedDecimal);
	}

	if (opt.precision == 0) {
		integer = addThousandSeparator(integer, opt.thousands);
		return integer.replaceAll(' ', '');
	}
	else {
		integer = addThousandSeparator(integer, opt.thousands);
		const result = opt.prefix + negative + joinIntegerAndDecimal(integer, decimal, opt.decimal, parts) + opt.suffix;
		return result.replaceAll(' ', '');
	}

	// integer = addThousandSeparator(integer, opt.thousands);
	// const result = opt.prefix + negative + joinIntegerAndDecimal(integer, decimal, opt.decimal) + opt.suffix;
	// return result.replaceAll(' ', '');
}

function onlyNumbers(input) {
	let a;
	return (a = toStr(input).match(/[0-9|.]/g)) ? a.join("") : "";
}

function joinIntegerAndDecimal(integer, decimal, separator, parts) {
	// return decimal ? integer + separator + decimal : integer
	if (parts.length == 2) {
		return integer + separator + decimal;
	}
	else {
		return decimal ? integer + separator + decimal : integer
	}
}

function toStr(value) {
	return value != null ? value.toString() : ''
}

function addThousandSeparator(integer, separator) {
	return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`)
}

function br_toFixed(input, precision, editing, fixedDecimal) {
	if ( !fixedDecimal ) {
		if ( input == null || precision <= 0) {
			return null;
		} else {
			precision = between(0, precision, 20);
			if (editing != 'editing') {
				// input = lodash.trimEnd(input, '0');
			}
		}
	} else {
		if ( precision <= 0) {
			return null;
		} else {
			precision = between(0, precision, 20);
			if (editing != 'editing') {
				input = Number("0." + (input == null ? "" : input)).toFixed(precision);
				input = input.substring(2);
			} else if ( input == null ) {
				return null;
			}
	
			// console.log("111", input)
			// console.log("br_toFixed", input, editing, input.substr(0, precision), precision);
			
		}
	}
	return input.substr(0, precision);
}

function between(min, n, max) {
	return Math.max(min, Math.min(n, max));
}

export function setCursor(el, position) {
	let setSelectionRange = function () {
		el.setSelectionRange(position, position);
	}

	if (el === document.activeElement) {
		setSelectionRange();
		setTimeout(setSelectionRange, 1); // Android Fix
	}
}


export function unformat_number(input, precision) {
	if (input == null) return null;

	let val = toStr(input);
	let negative = val.indexOf('-') >= 0 ? -1 : 1
	let numbers = onlyNumbers(val);
	if (lodash.isEmpty(numbers) || isNaN(numbers)) {
		return null;
	}
	let currency = numbersToCurrency(numbers, precision);
	return parseFloat(currency) * negative;
}

export function unformat_number_to_str(input) {

	if (input == null) return null;

	let val = toStr(input);
	let negative = val.indexOf('-') >= 0 ? -1 : 1;
	let numbers = onlyNumbers(val);

	if (lodash.isEmpty(numbers) || isNaN(numbers)) {
		return null;
	}
	if (negative == 1) {
		return numbers;
	}
	return "-" + numbers;
}

function numbersToCurrency(numbers, precision) {
	precision = between(0, precision, 20);
	let exp = Math.pow(10, precision);
	let float = Math.round(parseFloat(numbers) * exp);
	//return float.toFixed(fixed(precision))
	return float / exp;
}

function onlyDates(input) {
	let a;
	return (a = toStr(input).match(/[0-9|/-]/g)) ? a.join("") : "";
}

export function edit_date_format(input, fmt) {
	if (input instanceof Date) {
		const year = input.getFullYear();
		const month = input.getMonth() + 1;
		const day = input.getDate();
		if (fmt == 'yyyy') {
			return `${year}`;
		} else if (fmt == 'yyyy-mm') {
			return `${year}-${month >= 10 ? month : '0' + month}`;
		} else {
			return `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`;
		}
	}
	input = toStr(input);
	if (input == null) return "";
	let str = onlyDates(input);
	let lastDash = str.endsWith("-");

	//^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$

	let regex = /(\d{0,4})[\-]{0,1}(\d{0,2})[\-]{0,1}(\d{0,2})/gm;

	let m;
	let year = "";
	let month = "";
	let day = "";

	while ((m = regex.exec(str)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		if (m.index > 1) break;
		// The result can be accessed through the `m`-variable.
		m.forEach((match, groupIndex) => {
			if (match && match.length) {
				if (groupIndex == 1) {
					year = match;
				} else if (groupIndex == 2) {
					month = match;
				} else if (groupIndex == 3) {
					day = match;
				}
			}
		});
	}

	let regMonth = /(0[1-9]|1[012]|^[1-9]|^0)/gm;
	let regDay = /(0[1-9]|[12][0-9]|3[01]|^[1-9]|^0)/gm;

	//let curDt = new Date();
	if (fmt == 'yyyy') {
		return year;
	} else if (fmt == 'yyyy-mm') {
		if (str.length <= 5 && year && year.length == 4 && lastDash) {
			year += "-";
		}
		if (month && month.length) {
			while ((m = regMonth.exec(month)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (m.index === regMonth.lastIndex) {
					regMonth.lastIndex++;
				}
				if (m.index > 1) break;
				// The result can be accessed through the `m`-variable.
				m.forEach((match, groupIndex) => {
					if (match && match.length) {
						if (groupIndex == 1) {
							month = match;
						}
					}
				});
			}

			if (month && month.length == 1 && (month >= "3" && month <= "9")) {
				month = "0" + month;
			}
			return `${year}-${month}`;
		}
		return year;
	} else {
		if (str.length <= 5 && year && year.length == 4 && lastDash) {
			year += "-";
		}

		//console.log("before month", month)
		if (month && month.length) {
			while ((m = regMonth.exec(month)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (m.index === regMonth.lastIndex) {
					regMonth.lastIndex++;
				}
				if (m.index > 1) break;
				// The result can be accessed through the `m`-variable.
				m.forEach((match, groupIndex) => {
					if (match && match.length) {
						if (groupIndex == 1) {
							month = match;
						}
					}
				});
			}

			if (month && month.length == 1 && (month >= "3" && month <= "9")) {
				month = "0" + month;
			}
		}

		if (day && day.length) {
			while ((m = regDay.exec(day)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (m.index === regDay.lastIndex) {
					regDay.lastIndex++;
				}
				if (m.index > 1) break;
				// The result can be accessed through the `m`-variable.
				m.forEach((match, groupIndex) => {
					if (match && match.length) {
						if (groupIndex == 1) {
							day = match;
						}
					}
				});
			}

			if (day && day.length == 1 && (day >= "4" && day <= "9")) {
				day = "0" + day;
			}
		}

		//console.log("after month", month)
		if (str.length > 5 && str.length <= 8 && month && month.length == 2 && lastDash) {

			month += "-";
		}

		if (month && month.length && day && day.length) {
			if (month.length == 1) {
				month = "0" + month;
			}
			if (day.length == 1 && (day >= "4" && day <= "9")) {
				day = "0" + day;
			}
			return `${year}-${month}-${day}`;
		} else if (month && month.length) {
			return `${year}-${month}`;
		}
		return year;
	}
}

export function dateToDayString(dt, dayfmt) {
	if (dayjs().diff(dayjs(dt).format("YYYY-MM-DD"), 'day', true) > 10) {
		return dayjs(dt).format(dayfmt);
	} else if (dayjs(dt).format("YYYY-MM-DD") == dayjs().format("YYYY-MM-DD")) {
		return "오늘";
	} else {
		return dayjs(dt).fromNow(false, "dd");
	}
}

