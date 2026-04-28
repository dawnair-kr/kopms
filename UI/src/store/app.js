// Utilities
import { defineStore } from 'pinia';
import lodash from 'lodash';
import dayjs from 'dayjs';
import { getMMDD } from '../util/lunarDate.js';

export const useAppStore = defineStore('app', {
  state: () => ({
    viewSystemNotice: true,
    // openInvoiceHomePage: true,
    companyHoliday: {
      dates: {},
      repeatDates: [],
      repeatLunarDate: [],
      repeatLunarYearProcess: {},
      repeatMonthDayMap: {},
      orgData: []
    },
  }),
  /*  */
  getters: {
    getCacheCompHoliday: (state) => {
      return (date) => {
        let year = date.substring(0, 4);
        let mmdd = date.substring(5, 10);
        if ( state.companyHoliday.dates[date] ) {
          
          return state.companyHoliday.dates[date];

        } else if ( state.companyHoliday.repeatMonthDayMap[mmdd] ) {

          lodash.forEach(state.companyHoliday.repeatDates, (rec) => {
            let solarDate;
            if ( Array.isArray(rec.date) ) {
              solarDate = [
                  year + "-" + rec.date[0],
                  year + "-" + rec.date[1],
              ];
            } else {
              solarDate = year + "-" + rec.date;
            }

            if ( Array.isArray(solarDate) ) {
              let startDt = dayjs(solarDate[0], "YYYY-MM-DD");
              let endDt = dayjs(solarDate[1], "YYYY-MM-DD");

              let nextDt = startDt;
              let isExistReplace = false;

              while( endDt.isAfter(nextDt) || endDt.isSame(nextDt) ) {
                if ( rec.replace == 1 ) {
                  if ( nextDt.get("day") == 0 ) {
                    isExistReplace = true;
                  }
                } else if ( rec.replace == 2 ) {
                  if ( nextDt.get("day") == 0 || nextDt.get("day") == 6 ) {
                    isExistReplace = true;
                  }
                }
                state.companyHoliday.dates[nextDt.format("YYYY-MM-DD")] = {
                  comment: rec.title
                };
                nextDt = nextDt.add(1, "day");
              }
              if ( isExistReplace ) {
                if ( endDt.get("day") == 0 ) {
                  state.companyHoliday.dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else if ( endDt.get("day") == 6 ) {
                  state.companyHoliday.dates[endDt.add(2, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else {
                  state.companyHoliday.dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                }
              }
            } else {
              let tmpDt = dayjs(solarDate, "YYYY-MM-DD");
              if ( rec.replace == 1 ) {
                if ( tmpDt.get("day") == 0 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    state.companyHoliday.dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    state.companyHoliday.dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              } else if ( rec.replace == 2 ) {
                if ( tmpDt.get("day") == 0 || tmpDt.get("day") == 6 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    state.companyHoliday.dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    state.companyHoliday.dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              }

              state.companyHoliday.dates[solarDate] = {
                comment: rec.title
              };
            }
          });

          if ( state.companyHoliday.dates[date] ) {
            return state.companyHoliday.dates[date];
          }
        } else {
          if ( state.companyHoliday.repeatLunarYearProcess[year] ) {
            return;
          }

          lodash.forEach(state.companyHoliday.repeatLunarDate, (rec) => {
            let solarDate;
            if ( Array.isArray(rec.lunarDate) ) {
              let startStr, endStr;
              if ( rec.lunarDate[0].indexOf("$prev_year") > -1 ) {
                startStr = rec.lunarDate[0].replace("$prev_year", parseInt(year) - 1)
              } else {
                startStr = year + "-" + rec.lunarDate[0];
              }
                
              endStr = year + "-" + rec.lunarDate[1];
              solarDate = [
                  year + "-" + getMMDD(startStr.replace(/-/g, "")),
                  year + "-" + getMMDD(endStr.replace(/-/g, "")),
              ];
            } else {
              let tmpStr = year + "-" + rec.lunarDate;
              solarDate = year + "-" + getMMDD(tmpStr.replace(/-/g, ""));
            }

            if ( Array.isArray(solarDate) ) {
              let startDt = dayjs(solarDate[0], "YYYY-MM-DD");
              let endDt = dayjs(solarDate[1], "YYYY-MM-DD");

              let nextDt = startDt;
              let isExistReplace = false;

              while( endDt.isAfter(nextDt) || endDt.isSame(nextDt) ) {
                if ( rec.replace == 1 ) {
                  if ( nextDt.get("day") == 0 ) {
                    isExistReplace = true;
                  }
                } else if ( rec.replace == 2 ) {
                  if ( nextDt.get("day") == 0 || nextDt.get("day") == 6 ) {
                    isExistReplace = true;
                  }
                }
                state.companyHoliday.dates[nextDt.format("YYYY-MM-DD")] = {
                  comment: rec.title
                };
                nextDt = nextDt.add(1, "day");
              }
              if ( isExistReplace ) {
                if ( endDt.get("day") == 0 ) {
                  state.companyHoliday.dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else if ( endDt.get("day") == 6 ) {
                  state.companyHoliday.dates[endDt.add(2, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else {
                  state.companyHoliday.dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                }
              }
            } else {
              let tmpDt = dayjs(solarDate, "YYYY-MM-DD");
              if ( rec.replace == 1 ) {
                if ( tmpDt.get("day") == 0 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    state.companyHoliday.dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    state.companyHoliday.dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              } else if ( rec.replace == 2 ) {
                if ( tmpDt.get("day") == 0 || tmpDt.get("day") == 6 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    state.companyHoliday.dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    state.companyHoliday.dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              }

              state.companyHoliday.dates[solarDate] = {
                comment: rec.title
              };
            }
          });

          state.companyHoliday.repeatLunarYearProcess[year] = true;

          if ( state.companyHoliday.dates[date] ) {
            return state.companyHoliday.dates[date];
          }

        }

      };
    },
  },

  actions: {
    setCompHoliday(data) {

      const companyHoliday_dates = {};
      const companyHoliday_repeatDates = [];
      const companyHoliday_repeatLunarDate = [];
      const companyHoliday_repeatMonthDayMap = {};

      lodash.forEach(data, rec => {
        
        if ( rec.lunarDate ) {
          if ( rec.repeat ) {
            companyHoliday_repeatLunarDate[companyHoliday_repeatLunarDate.length] = rec;
          } else {
            if ( Array.isArray(rec.lunarDate) ) {
              let startDt = dayjs(rec.lunarDate[0], "YYYY-MM-DD");
              let endDt = dayjs(rec.lunarDate[1], "YYYY-MM-DD");
              
              startDt = dayjs(startDt.get("year") + "-" + getMMDD(startDt.format("YYYY-MM-DD").replace(/-/g, "")), "YYYY-MM-DD");
              endDt = dayjs(endDt.get("year") + "-" + getMMDD(endDt.format("YYYY-MM-DD").replace(/-/g, "")), "YYYY-MM-DD");

              let nextDt = startDt;
              let isExistReplace = false;

              while( endDt.isAfter(nextDt) || endDt.isSame(nextDt) ) {
                if ( rec.replace == 1 ) {
                  if ( nextDt.get("day") == 0 ) {
                    isExistReplace = true;
                  }
                } else if ( rec.replace == 2 ) {
                  if ( nextDt.get("day") == 0 || nextDt.get("day") == 6 ) {
                    isExistReplace = true;
                  }
                }

                companyHoliday_dates[nextDt.format("YYYY-MM-DD")] = {
                  comment: rec.title
                };
                nextDt = nextDt.add(1, "day");
              }

              if ( isExistReplace ) {
                if ( endDt.get("day") == 0 ) {
                  companyHoliday_dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else if ( endDt.get("day") == 6 ) {
                  companyHoliday_dates[endDt.add(2, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else {
                  companyHoliday_dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                }
              }
            } else {
              let dt = dayjs(rec.lunarDate, "YYYY-MM-DD");
              
              let dateStr = dt.get("year") + "-" + getMMDD(dt.format("YYYY-MM-DD").replace(/-/g, ""));
              let tmpDt = dayjs(dateStr, "YYYY-MM-DD");
              if ( rec.replace == 1 ) {
                if ( tmpDt.get("day") == 0 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    companyHoliday_dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    companyHoliday_dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              } else if ( rec.replace == 2 ) {
                if ( tmpDt.get("day") == 0 || tmpDt.get("day") == 6 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    companyHoliday_dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    companyHoliday_dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              }
              companyHoliday_dates[dateStr] = {
                replace: rec.replace,
                comment: rec.title
              };
            }
          }
        } else if ( rec.date ) {
          if ( rec.repeat ) {
            let tmpYear = 2024;

            if ( Array.isArray(rec.date) ) {
              let startDt = dayjs(tmpYear + "-" + rec.date[0], "YYYY-MM-DD");
              let endDt = dayjs(tmpYear + "-" + rec.date[1], "YYYY-MM-DD");

              let nextDt = startDt;

              while( endDt.isAfter(nextDt) || endDt.isSame(nextDt) ) {
                companyHoliday_repeatMonthDayMap[nextDt.format("MM-DD")] = true;
                nextDt = nextDt.add(1, "day");
              }
            } else {
              companyHoliday_repeatMonthDayMap[rec.date] = true;
            }
            companyHoliday_repeatDates.push(rec);
          } else {
            if ( Array.isArray(rec.date) ) {
              let startDt = dayjs(rec.date[0], "YYYY-MM-DD");
              let endDt = dayjs(rec.date[1], "YYYY-MM-DD");
              let nextDt = startDt;

              let isExistReplace = false;

              while( endDt.isAfter(nextDt) || endDt.isSame(nextDt) ) {
                let dateStr = nextDt.format("YYYY-MM-DD");

                if ( rec.replace == 1 ) {
                  if ( nextDt.get("day") == 0 ) {
                    isExistReplace = true;
                  }
                } else if ( rec.replace == 2 ) {
                  if ( nextDt.get("day") == 0 || nextDt.get("day") == 6 ) {
                    isExistReplace = true;
                  }
                }

                companyHoliday_dates[dateStr] = {
                  replace: rec.replace,
                  comment: rec.title
                };
                nextDt = nextDt.add(1, "day");
              }

              if ( isExistReplace ) {
                if ( endDt.get("day") == 0 ) {
                  companyHoliday_dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else if ( endDt.get("day") == 6 ) {
                  companyHoliday_dates[endDt.add(2, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                } else {
                  companyHoliday_dates[endDt.add(1, "day").format("YYYY-MM-DD")] = {
                    comment: "대체공휴일"
                  };
                }
              }
            } else {
              let tmpDt = dayjs(rec.date, "YYYY-MM-DD");
              if ( rec.replace == 1 ) {
                if ( tmpDt.get("day") == 0 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    companyHoliday_dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    companyHoliday_dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              } else if ( rec.replace == 2 ) {
                if ( tmpDt.get("day") == 0 || tmpDt.get("day") == 6 ) {
                  if ( tmpDt.get("day") == 0 ) {
                    companyHoliday_dates[tmpDt.add(1, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  } else if ( tmpDt.get("day") == 6 ) {
                    companyHoliday_dates[tmpDt.add(2, "day").format("YYYY-MM-DD")] = {
                      comment: "대체공휴일"
                    };
                  }
                }
              }

              companyHoliday_dates[rec.date] = {
                comment: rec.title
              };
            }
          }
        }
      });

      this.companyHoliday = {
        dates: companyHoliday_dates,
        repeatDates: companyHoliday_repeatDates,
        repeatLunarDate: companyHoliday_repeatLunarDate,
        repeatLunarYearProcess: {},
        repeatMonthDayMap: companyHoliday_repeatMonthDayMap,
        orgData: data
      };

      //console.log("this.companyHoliday", this.companyHoliday);
    }
  }
  
});