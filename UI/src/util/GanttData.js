import {GregorianCalendar, TimeUnit} from "./GregorianCalendar.js";
import lodash from 'lodash';

let _calendar = new GregorianCalendar();

let _taskDataset;
let _datasetMap;
let _taskItemLinksMap = {};
let _taskLinksGElementPool = {};

let _sample_data = [
    {
        id: 1,
        level: 1,
        TaskName: "Planning",
        Start: null,
        Finish: null,
        Done: null,
    },
    {
        id: 11,
        level: 2,
        TaskName: "Investigate",
        Start: "2023-07-18",
        Finish: "2023-07-30",
        Done: 50,
    },
    {
        id: 12,
        level: 2,
        TaskName: "Assign resources",
        Start: "2023-07-18",
        Finish: "2023-07-30",
        Done: 50,
    },
    {
        id: 13,
        level: 2,
        TaskName: "Gather documents (not resizable)",
        Start: "2023-07-18",
        Finish: "2023-07-30",
        Done: 50,
    },
    {
        id: 17,
        level: 2,
        TaskName: "Report to management",
        Start: "2023-07-31",
        Finish: "2023-07-31",
        Done: 0,
        Predecessors: "11;12;13",
        milestone: "Y"
    },
    {
        id: 4,
        level: 1,
        TaskName: "Implementation Phase 1",
        Start: null,
        Finish: null,
        Done: null,
        Predecessors: null,
        milestone: null
    },
    {
        id: 34,
        level: 2,
        TaskName: "Preparation work",
        Start: "2023-08-01",
        Finish: "2023-08-04",
        Done: 30,
        Predecessors: "17",
        milestone: null
    },
    {
        id: 14,
        level: 2,
        TaskName: "Evaluate chipsets",
        Start: "2023-08-01",
        Finish: "2023-08-04",
        Done: 30,
        Predecessors: "17",
        milestone: null
    },
    {
        id: 16,
        level: 2,
        TaskName: "Choose technology suite",
        Start: "2023-08-01",
        Finish: "2023-08-04",
        Done: 30,
        Predecessors: "17",
        milestone: null
    },
    {
        id: 15,
        level: 2,
        TaskName: "Build prototype",
        Start: null,
        Finish: null,
        Done: 0,
        Predecessors: null,
        milestone: null
    },
    {
        id: 20,
        level: 3,
        TaskName: "Step 1",
        Start: "2023-08-08",
        Finish: "2023-08-10",
        Done: 60,
        Predecessors: "16",
        milestone: null
    },
    {
        id: 19,
        level: 3,
        TaskName: "Step 2",
        Start: "2023-08-08",
        Finish: "2023-08-10",
        Done: 60,
        Predecessors: "16",
        milestone: null
    },
    {
        id: 18,
        level: 3,
        TaskName: "Step 3",
        Start: "2023-08-08",
        Finish: "2023-08-10",
        Done: 60,
        Predecessors: "16",
        milestone: null
    },
    {
        id: 21,
        level: 3,
        TaskName: "Follow up with customer",
        Start: "2023-08-11",
        Finish: "2023-08-11",
        Done: 60,
        Predecessors: "18",
        milestone: null
    },
    {
        id: 5,
        level: 1,
        TaskName: "Customer approval",
        Start: "2023-08-11",
        Finish: "2023-08-11",
        Done: 0,
        Predecessors: "21",
        milestone: "Y"
    },
    {
        id: 6,
        level: 1,
        TaskName: "Implementation Phase 2",
        Start: null,
        Finish: null,
        Done: null,
        Predecessors: null,
        milestone: null
    },
    {
        id: 25,
        level: 2,
        TaskName: "Task 1",
        Start: "2023-08-15",
        Finish: "2023-08-23",
        Done: 10,
        Predecessors: "5",
        milestone: null
    },
    {
        id: 26,
        level: 2,
        TaskName: "Task 2",
        Start: "2023-08-15",
        Finish: "2023-08-23",
        Done: 20,
        Predecessors: "5",
        milestone: null
    },
    {
        id: 27,
        level: 2,
        TaskName: "Task 3",
        Start: "2023-08-15",
        Finish: "2023-08-23",
        Done: 20,
        Predecessors: "5",
        milestone: null
    },
    {
        id: 10,
        level: 1,
        TaskName: "Customer approval 2 (not draggable)",
        Start: "2023-08-24",
        Finish: "2023-08-24",
        Done: 0,
        Predecessors: "27",
        milestone: "Y"
    },
    {
        id: 8,
        level: 1,
        TaskName: "Production phase 1",
        Start: null,
        Finish: null,
        Done: 41,
        Predecessors: null,
        milestone: null
    },
    {
        id: 22,
        level: 2,
        TaskName: "Assemble",
        Start: "2023-08-25",
        Finish: "2023-09-11",
        Done: 50,
        Predecessors: "10",
        milestone: null
    },
    {
        id: 23,
        level: 2,
        TaskName: "Load SW",
        Start: "2023-09-15",
        Finish: "2023-09-28",
        Done: 20,
        Predecessors: "22",
        milestone: null
    },
    {
        id: 24,
        level: 2,
        TaskName: "Basic testing (inc some test)",
        Start: "2023-09-30",
        Finish: "2023-10-13",
        Done: 50,
        Predecessors: "23",
        milestone: null
    },
    {
        id: 9,
        level: 1,
        TaskName: "Final testing",
        Start: "2023-10-15",
        Finish: "2023-10-21",
        Done: 0,
        Predecessors: "24",
        milestone: null
    },
    {
        id: 7,
        level: 1,
        TaskName: "Delivery",
        Start: "2023-10-22",
        Finish: "2023-10-22",
        Done: 40,
        Predecessors: "9",
        milestone: "Y"
    },
];

export function setDataset(arr) {
    if ( arr == null ) {
        arr = _sample_data;
    }
    let n_arr = [];
    let depths = [];
    lodash.forEach(arr, (o, row) => {
        o.parent = depths[o.level - 1];
        o.row = row;
        if ( o.parent ) {
            if ( !lodash.isArray(o.parent.children) ) {
                o.parent.children = [];
            }
            o.parent.children.push(o);
        } else {
            n_arr.push(o);
        }
        depths[o.level] = o;
        
    });

    _taskDataset = n_arr;

	datasetToDatasetMap();
	updateAllSummaryDataForTaskItem();
	makeAllTaskItemLinksMap();
	updateDatasetWithAllSummaryTaskItem();
	updateDatasetAllForDuration();

    //console.log("Gantt", n_arr, _datasetMap, _taskItemLinksMap, _taskLinksGElementPool);

}

export function getTaskInfo() {
    return {
        taskdata: _taskDataset,
        taskMap: _datasetMap,
        LinksMap: _taskItemLinksMap,
    }
}

function datasetToDatasetMap() {
	let dataArr = _taskDataset;
	let n_map = {};
	lodash.forEach(dataArr, o => {
		traverseTree(o, createTaskItem, n_map);
	});
	_datasetMap = n_map;
}

function updateAllSummaryDataForTaskItem() {
	let dataArr = _taskDataset;
	lodash.forEach(dataArr, o => {
		traverseTree(o, updateSummaryDataForTaskItem);
	});
}

function makeAllTaskItemLinksMap() {
	let dataArr = _taskDataset;
	lodash.forEach(dataArr, o => {
		traverseTree(o, setTaskItemLinksMap);
	});
}

function updateDatasetWithAllSummaryTaskItem() {
	let dataArr = _taskDataset;
	lodash.forEach(dataArr, o => {
		traverseTree(o, updateDatasetWithSummaryTaskItem);
	});
}

function updateDatasetAllForDuration() {
	let dataArr = _taskDataset;
	lodash.forEach(dataArr, o => {
		traverseTree(o, updateDatasetForDuration);
	});
}

function traverseTree(obj, func, map) {
	let children = obj.children;

	if ( children && children.length ) {
		lodash.forEach(children, o => {
			traverseTree(o, func, map);
		});
		if ( typeof func == "function" ) {
			func(obj);
		}
		if ( map ) {
			map[obj.id + ""] = obj;
		}
	} else {
		if ( typeof func == "function" ) {
			func(obj);
		}
		if ( map ) {
			map[obj.id + ""] = obj;
		}
	}
}

/**
 * taskItem 객체를 생성하는 함수
 * @param {Object} taskInfo 
*/
export function createTaskItem(taskInfo) {
    if ( taskInfo == null ) return null;

	let links = taskInfo["Predecessors"];
	if ( links && links.length ) {
		links = links.split(";");
	} else {
		links = null;
	}
	if ( isSummary(taskInfo) ) {
		taskInfo.displayInfo = {
			start: null,
			end: null,
			text: taskInfo["TaskName"],
			predecessors: links,
			isMilestone: false,
			isSummary: true,
			duration: 0,
			done: 0,
			level: taskInfo["level"],
			needCalcSummary: true, //summary 이면 child items 정보로 일정 기간 및 진행율 계산 처리 필요하다는 flag
			needSettingLinksMap: true, //linksMap 정보 구성이 필요하다는 flag
			taskTimeLineChanged: true, //start, end 가 변경된 flag => duration 계산 및 상위 milestone 변경 필요.
		};
		return taskInfo;
	} else {
		let sdt = convertDate(taskInfo["Start"]);
		let edt = convertDate(taskInfo["Finish"], true);
		let dur = _calendar.getElapsedDays(sdt, edt, 2);
		//ds.setColumn(row, "Duration", dur);
		taskInfo.displayInfo = {
			start: sdt,
			end: edt,
			text: taskInfo["TaskName"],
			predecessors: links,
			isMilestone: isMilestone(taskInfo),
			isSummary: false,
			duration: dur,
			done: taskInfo["Done"],
			level: taskInfo["level"],
			needCalcSummary: false, //summary 이면 child items 정보로 일정 기간 및 진행율 계산 처리 필요하다는 flag
			needSettingLinksMap: true, //linksMap 정보 구성이 필요하다는 flag
			taskTimeLineChanged: false, //start, end 가 변경된 flag => duration 계산 및 상위 milestone 변경 필요.
		};
		return taskInfo;
	}
}

/**
 * taskItem 객체의 값들을 주어진 ds의 row해당하는 값으로 반영하는 함수
 * @param {object} taskInfo 
 * @param {object} taskItem taskItem 객체
*/
export function updateTaskItem(taskInfo, taskItem) {
	if ( taskItem.isMilestone ) {
		taskItem.oldShape = "milestone";
	} else if ( taskItem.isSummary ) {
		taskItem.oldShape = "summary";
	} else {
		taskItem.oldShape = "normal";
	}
	
	let sdt = convertDate(taskInfo["Start"]);
	let edt = convertDate(taskInfo["Finish"], true);
	let links = taskInfo["Predecessors"];
	let level = taskInfo["level"];
	if ( links && links.length ) {
		links = links.split(";");
	} else {
		links = null;
	}
	let issummary = isSummary(taskInfo);
	let text = taskInfo["TaskName"],
		textChanged = false,
		linksChanged = false,
		taskShapeChanged = false,
		taskBarLayoutChanged = false,
		oldLinks;

	if ( text != taskItem.text ) {
		taskItem.text = text;
		textChanged = true;
	}

	if ( !lodash.isEqual(links, taskItem.predecessors) ) {
		oldLinks = taskItem.predecessors;
		taskItem.predecessors = links;
		taskItem.needSettingLinksMap = true;
		linksChanged = true;
	}
	//trace("isMile:::" + isMile);
	if ( !issummary ) {
		let isMile = isMilestone(taskInfo);
		let done = taskInfo["Done"];
		if ( sdt.getTime() != taskItem.start.getTime() ||
			 edt.getTime() != taskItem.end.getTime() ||
			 done != taskItem.done ) {
			taskItem.start = sdt;
			taskItem.end = edt;
			taskItem.done = done;
			let dur = _calendar.getElapsedDays(sdt, edt, 2);
			taskItem.duration = dur;
			taskBarLayoutChanged = true;
		}
		if ( isMile !== taskItem.isMilestone ) {
			taskItem.isMilestone = isMile;
			taskShapeChanged = true;
		}
		if ( taskItem.isSummary ) {
			taskItem.isSummary = issummary;
			taskShapeChanged = true;
		}
	} else {
		if ( !taskItem.isSummary ) {
			taskItem.isSummary = issummary;
			taskItem.isMilestone = false;
			taskItem.needCalcSummary = true;
			updateFlagSummary([row], true);
			taskShapeChanged = true;
		} else if ( taskItem.needCalcSummary ) {
			updateFlagSummary([row], true);
			taskShapeChanged = true;
		}
	}

	if ( linksChanged ) {
		setTaskItemLinksMap(row, oldLinks);
		taskItem.needDrawPredecessors = true;
	}
	if ( textChanged ) {
		taskItem.needDrawText = true;
	}

	let parentSummaryChanged = false;
	if ( taskItem.level != level ) {
		taskItem.level = level;
		//taskItem.needTaskShapeDraw = true;
		parentSummaryChanged = true;
	}

	if ( taskShapeChanged ) {
		taskItem.needTaskShapeDraw = true;
		parentSummaryChanged = true;
	}
	if ( taskBarLayoutChanged ) {
		taskItem.needTaskBarDraw = true;
		parentSummaryChanged = true;
	}

	if ( parentSummaryChanged ) {
		let rows = getRowsOfParentSummary(row);
		//trace(taskItem.key + "===>" + rows);
		if ( rows.length ) updateFlagSummary(rows, true);
		return rows;
	}
}

/**
 * 주어진 row, key에 해당하는 taskItem 객체를 _datasetMap에서 삭제하고, dataset의 row도 같이 삭제한다.
 * 삭제 처리 시에 하위에 존재하는 child 행들도 같이 삭제한다.
 * @param {number} delRow 삭제할 데이타 row
 * @param {boolean=} isUpdateSummary 부모 summary의 row들에 대하여 수정이 필요하는 flag를 update할 것인지 여부(default: true)
 * @param {number=} cntChildren delRow의 child 개수
*/
export function deleteTaskItem(delRow, isUpdateSummary, cntChildren) {
	let grd = _taskGrid,
		ds = _taskDataset,
		dsMap = _datasetMap,
		cnt = (cntChildren != null ? cntChildren : grd.getTreeChildCount(delRow)),
		childDsRow, childCnt;
	for ( let i = cnt - 1; i >= 0 ; i-- ) {
		childDsRow = grd.getTreeChildRow(delRow, i);
		childCnt = grd.getTreeChildCount(childDsRow);
		if ( childCnt > 0 ) {
			deleteTaskItem(childDsRow, false, childCnt);
            let removeItem = ds.splice(childDsRow, 1);
			delete dsMap[removeItem.key];
		} else {
            let removeItem = ds.splice(childDsRow, 1);
			delete dsMap[removeItem.key];
		}
	}

	if ( isUpdateSummary !== false ) {
		var rows = getRowsOfParentSummary(delRow);
        let removeItem = ds.splice(delRow, 1);
        delete dsMap[removeItem.key];
		if ( rows.length ) {
			updateFlagSummary(rows, true);
		}
	}
}

/**
 * 주어진 row의 부모 summary의 row들을 array로 얻는다.
 * @param {number} startRow 데이타 row
 * @return {array} 주어진 row의 부모 milestone의 row들
*/
export function getRowsOfParentSummary(startRow) {
	let pDsRow, resRows = [], grd = _taskGrid;
	while (true) {
		pDsRow = grd.getTreeParentRow(startRow);
		if ( pDsRow > -1 ) {
			resRows.push(pDsRow);
			startRow = pDsRow;
		} else {
			break;
		}
	}
	return resRows;
}

/**
 * 주어진 rows에 해당하는 taskItem 객체에 대하여 수정이 필요하다는 flag를 true로 구성한다.
 * @param {array} rows 데이타 rows
 * @param {boolean=} isTaskItemUpdate taskItem의 data값까지 갱신할 것인지 여부(default: false)
*/
export function updateFlagSummary(rows, isTaskItemUpdate) {
	if ( !lodash.isArray(rows) ) {
		console.error("rows argument는 반드시 array type이여야 한다.");
	}
	let tmpTaskItem,
		dsMap = _datasetMap;
	for ( let i = 0, len = rows.length ; i < len ; i++ ) {
		tmpTaskItem = dsMap[rows[i].key];
		if ( tmpTaskItem ) {
			tmpTaskItem.needCalcSummary = true;
			if ( isTaskItemUpdate ) updateSummaryDataForTaskItem(rows[i]);
		}
	}
}

/**
 * 주어진 dsVal 값을 Script의 Date type 객체로 convert한다.
 * dsVal는 string값이 아니라, dataset에 DATE type의 값 또는 Calendar00.value 값이다. 
 * @param {TobeDate} dsVal convert할 tobeDate type의 값 
 * @param {boolean} isEndDate 주어진 dsVal이 finish일자 값인지 구분(default: false)
 * @return {Date} Date type으로 convert된 값
*/
export function convertDate(dsVal, isEndDate) {
	let dt = new Date(dsVal),
		timeUnit = TimeUnit;
	dt.setHours(0);
	dt.setMinutes(0);
	dt.setSeconds(0);
	dt.setMilliseconds(0);
	//var millisec = dt.getTime() + (dt.getTimezoneOffset()*timeUnit.MINUTE.milliseconds);
	//dt = new Date(millisec);
	if ( isEndDate ) {
		//if ( dt.getHours() == 0 && dt.getMinutes() == 0 &&
		//	dt.getSeconds() == 0 && dt.getMilliseconds() == 0 )
		//{
			dt = _calendar.addUnits(dt, timeUnit.DAY, 1, true);
		//}
	} else {
		//if ( dt.getHours() == 0 && dt.getMinutes() == 0 &&
		//	dt.getSeconds() == 0 && dt.getMilliseconds() == 0 )
		//{
			//dt = _calendar.addUnits(dt, timeUnit.HOUR, 0, true);
		//}
	}
	return dt;
}

/**
 * 주어진 dsRow가 summary인지 얻는다.
 * @param {Object} taskInfo
*/
function isSummary(taskInfo) {
	return taskInfo.children && !!taskInfo.children.length;
}

/**
 * 주어진 dsRow가 mileStone인지 얻는다.
 * @param {Object} taskInfo
*/
function isMilestone(taskInfo) {
	return taskInfo && taskInfo["milestone"] == "Y";
}


/**
 * 주어진 dsRow의 taskItem 객체의 start, end, duration, done 데이터를 child taskItem의 정보를 가지고 갱신한다.
 * 주어진 dsRow의 taskItem는 milestone이어야 한다.
 * @param {object} taskInfo
*/
export function updateSummaryDataForTaskItem(taskInfo) {
	let dsMap = _datasetMap,
		taskItem = dsMap[taskInfo.id].displayInfo;
	if ( !taskItem || !taskItem.isSummary ) return;
	if ( !taskItem.needCalcSummary ) return;
	let cnt = taskInfo.children ? taskInfo.children.length : 0,
		childTaskInfo, childCnt,
		sdt, edt, done, tmpTaskItem, elaspedDays,
		totalElaspedDays = 0, sumVal = 0,
		calcSdt, calcEdt;
	for ( let i = 0; i < cnt ; i++ ) {
		childTaskInfo = taskInfo.children[i];
		childCnt = childTaskInfo.children ? childTaskInfo.children.length : 0;
		if ( childCnt > 0 ) {
			updateSummaryDataForTaskItem(childTaskInfo);
		}
		tmpTaskItem = childTaskInfo.displayInfo;
		sdt = tmpTaskItem.start;
		edt = tmpTaskItem.end;
		done = tmpTaskItem.done;
		if ( !tmpTaskItem.taskTimeLineChanged ) elaspedDays = tmpTaskItem.duration;
		else elaspedDays = null;
		if ( calcSdt == null ) {
			calcSdt = sdt;
		} else {
			if ( calcSdt.getTime() > sdt.getTime() ) {
				calcSdt = sdt;
			}
		}

		if ( calcEdt == null ) {
			calcEdt = edt;
		} else {
			if (calcEdt.getTime() < edt.getTime() ) {
				calcEdt = edt;
			}
		}
		done = (done > -1 ? done : 0);
		if ( elaspedDays == null ) elaspedDays = _calendar.getElapsedDays(sdt, edt);
		sumVal += elaspedDays*done;
		totalElaspedDays += elaspedDays;
	}
	sdt = new Date(calcSdt.getTime());
	edt = new Date(calcEdt.getTime());
    /*
	if ( sdt.getHours() != 0 ) 
		sdt = _calendar.addUnits(sdt, TimeUnit.HOUR, -9, true);
	if ( edt.getHours() != 23 ) 
		edt = _calendar.addUnits(edt, TimeUnit.HOUR, 5.9, true);
    */

	taskItem.start = sdt;
	taskItem.end = edt;
	taskItem.done = Math.round(sumVal/totalElaspedDays);
	let dur = _calendar.getElapsedDays(sdt, edt, 2);
	taskItem.duration = dur;
	taskItem.needCalcSummary = false;
	taskItem.taskTimeLineChanged = false;
	taskItem.needTaskBarDraw = true;
	//return taskItem;
}

/**
 * 주어진 dsRow의 taskItem 데이터가 가지는 선행 Task들의 정보를 가지고 _taskItemLinksMap 정보를 구성한다.
 * _taskItemLinksMap 정보는 선행 Task와 연결된 선를 그리는 처리에 참조한다.
 *
 * a 의 선행 task가 b, c가 있다면 아래와 같이 정보가 구성된다.
 *
 * _taskItemLinksMap['a']에 값 구성
 * _taskItemLinksMap['a']['b_a'] = {from: 'taskItem of b', to: 'taskItem of a'}; 
 * _taskItemLinksMap['a']['c_a'] = {from: 'taskItem of c', to: 'taskItem of a'}; 
 *
 * _taskItemLinksMap['b']에 값 구성
 * _taskItemLinksMap['b']['b_a'] = {from: 'taskItem of b', to: 'taskItem of a'}; 
 *
 * _taskItemLinksMap['c']에 값 구성
 * _taskItemLinksMap['c']['c_a'] = {from: 'taskItem of c', to: 'taskItem of a'}; 
 *
 * @param {object} taskInfo
 * @param {array} oldLinksArr links 정보 갱신 전에 기존에 보유한 선행 task key값들
*/
function setTaskItemLinksMap(taskInfo, oldLinksArr) {
	let dsMap = _datasetMap,
		linksMap = _taskItemLinksMap,
		taskItem = dsMap[taskInfo.id].displayInfo;
	if ( !taskItem ) return;
	if ( !taskItem.needSettingLinksMap ) return;

	let toKey = taskInfo.id,
		fromKey, targetMap, linkKey,
		taskLinksGElementPool = _taskLinksGElementPool,
		taskLinkItem, linkComp;
	if ( oldLinksArr && oldLinksArr.length ) {
		for ( let j = 0, jlen = oldLinksArr.length ; j < jlen ; j++ ) {
			fromKey = oldLinksArr[j];
			linkKey = fromKey + "_" + toKey;
			targetMap = linksMap[toKey];
			if ( targetMap ) {
				delete targetMap[linkKey];
			}
			targetMap = linksMap[fromKey];
			if ( targetMap ) {
				delete targetMap[linkKey];
			}
			linkComp = taskLinksGElementPool["link_" + linkKey];
			if ( linkComp ) {
				if ( linkComp.Parent ) {
					linkComp.Parent.removeChild(linkComp);
				}
				delete taskLinksGElementPool["link_" + linkKey];
			}
		}
	}

	let linkData = taskItem.predecessors;
	if ( linkData && linkData.length ) {
		for ( let j = 0, jlen = linkData.length ; j < jlen ; j++ ) {
			fromKey = linkData[j];
			taskLinkItem = {
				to: dsMap[toKey],
				from: dsMap[fromKey]
			};
			//link key 명칭 fromKey_toKey
			linkKey = fromKey + "_" + toKey;
			targetMap = linksMap[toKey];
			if ( !targetMap ) {
				linksMap[toKey] = {};
				targetMap = linksMap[toKey];
			}
			targetMap[linkKey] = taskLinkItem;
			targetMap = linksMap[fromKey];
			if ( !targetMap ) {
				linksMap[fromKey] = {};
				targetMap = linksMap[fromKey];
			}
			targetMap[linkKey] = taskLinkItem;
		}
	}
	taskItem.needSettingLinksMap = false;
}

function updateDatasetWithSummaryTaskItem(taskInfo) {
	let taskItem = taskInfo.displayInfo;
	if ( !taskItem || !taskItem.isSummary ) return;
	taskInfo.Start = new Date(taskItem.start.getTime());
	taskInfo.Finish = new Date(taskItem.end.getTime());
	taskInfo.Done = taskItem.done;
	taskInfo.Duration = taskItem.duration;
}

function updateDatasetForDuration(taskInfo, isExceptSummary) {
	let taskItem = taskInfo.displayInfo;
	if ( !taskItem ) return;
	if ( isExceptSummary && taskItem.isSummary ) return;
	taskInfo.Duration = taskItem.duration;
}