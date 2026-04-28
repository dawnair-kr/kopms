import lodash from 'lodash';

const DependencyLinesStateName = "config.plugin.DependencyLines",
    OuterSlotStateName = "config.slots.br-chart-timeline-items.outer", 
    dependencyLinesClass = "br-chart-timeline-dependency-lines-lines",
    dependencyLineClass = "br-chart-timeline-dependency-lines-lines-line",
    pointsClass = "br-chart-timeline-dependency-lines-points",
    pointClass = "br-chart-timeline-dependency-lines-points-point"; 

export class DependencyLines {
    constructor(props, options) {
        this.onDestroy = [];
        this.api = props.gapi;
        this.state = props.state;

        const leftPointSlot = (<div class={pointClass+"--left"}></div>),
            rightPointSlot = (<div class={pointClass+"--right"}></div>);
        

        this.data = function(options) {
            return Object.assign(Object.assign({}, options), {
                lines: []
            });
        }(function(options, leftPointSlot, rightPointSlot) {
            const result = Object.assign(Object.assign({}, function(left, right) {
                return {
                    type: "smooth",
                    onLines: [],
                    onLine: [],
                    leftPoint: {
                        content: left,
                        width: 10,
                        height: 10
                    },
                    rightPoint: {
                        content: right,
                        width: 10,
                        height: 10
                    }
                };
            }(leftPointSlot, rightPointSlot)), options);

            options.leftPoint && (result.leftPoint = Object.assign(Object.assign({}, result.leftPoint), options.leftPoint));
            options.rightPoint && (result.rightPoint = Object.assign(Object.assign({}, result.rightPoint), options.rightPoint));
            return result;
        }(options||{}, leftPointSlot, rightPointSlot));

        this.getDependencyLinesSlot = this.getDependencyLinesSlot.bind(this);
        
        this.generateLines = this.generateLines.bind(this);
        this.destroy = this.destroy.bind(this);
        this.updateData();

        this.onDestroy.push(this.state.subscribe(DependencyLinesStateName, (value => {
            this.data = value;
        })));

        this.state.update(OuterSlotStateName, value => {
            if ( !value.includes(this.getDependencyLinesSlot) ) {
                value.push(this.getDependencyLinesSlot);
            }
            return value;
        });

        this.onDestroy.push(this.state.subscribeAll(["$data.chart.items", 
            "$data.list.rowsHeight", "$data.scroll", 
            "$data.chart.time.leftGlobal", "$data.chart.time.rightPx"], this.generateLines, {
            group: true
        }));
    }

    destroy() {
        this.state.update(OuterSlotStateName, value => value.filter((v => v !== this.getDependencyLinesSlot)));
        this.onDestroy.forEach((v => v()));
    }
    updateData() {
        this.state.update(DependencyLinesStateName, this.data);
    }
    setStraightPoints(lineData) {
        const {
            topOffset,
            leftOffset,
            fromItemData,
            toItemData,
            fromRowData,
            toRowData
        } = lineData;

        if (!this.api.parentsExpanded(fromRowData.id) || !this.api.parentsExpanded(toRowData.id)) return;
        
        const fromY = this.api.getRowViewTop(fromRowData.id),
            toY = this.api.getRowViewTop(toRowData.id);

        lineData.points.push({
            x: fromItemData.position.right + leftOffset,
            y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromY,
            type: "M",
            content: this.data.leftPoint.content
        });

        lineData.points.push({
            x: toItemData.position.left - leftOffset,
            y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toY,
            type: "L",
            content: this.data.rightPoint.content
        });
    }
    setSquareAltPoints(lineData) {
        const {
            topOffset,
            leftOffset,
            fromItemData,
            toItemData,
            fromRowData,
            toRowData
        } = lineData;

        if (!this.api.parentsExpanded(fromRowData.id) && !this.api.parentsExpanded(toRowData.id)) return;

        const halfWidth = (toItemData.position.left - fromItemData.position.right) / 2,
            centerX = fromItemData.position.right + halfWidth,
            halfHeight = (toItemData.position.viewTop - fromItemData.position.viewTop) / 2,
            centerY = fromItemData.position.viewTop + halfHeight,
            fromTop = this.api.getRowViewTop(fromRowData.id),
            toTop = this.api.getRowViewTop(toRowData.id);
        
        lineData.points.push({
            x: fromItemData.position.right + leftOffset,
            y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
            type: "M",
            content: this.data.leftPoint.content
        });
        
        if ( toItemData.position.left < fromItemData.position.right ) {
            lineData.points.push({
                x: fromItemData.position.right + leftOffset + 10,
                y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                type: "L",
                content: null
            });
            lineData.points.push({
                x: fromItemData.position.right + leftOffset + 10,
                y: this.api.parentsExpanded(fromRowData.id) ? centerY + topOffset : fromTop,
                type: "L",
                content: null
            });
        } else {
            lineData.points.push({
                x: centerX,
                y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                type: "L",
                content: null
            });
        }
        
        lineData.points.push({
            x: centerX,
            y: this.api.parentsExpanded(fromRowData.id) ? centerY + topOffset : fromTop,
            type: "L",
            content: null
        });
        
        if ( this.api.parentsExpanded(toRowData.id) ) {
            if ( toItemData.position.left < fromItemData.position.right ) {
                lineData.points.push({
                    x: toItemData.position.left - leftOffset - 10,
                    y: this.api.parentsExpanded(fromRowData.id) ? centerY + topOffset : fromTop,
                    type: "L",
                    content: null
                });
                lineData.points.push({
                    x: toItemData.position.left - leftOffset - 10,
                    y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : fromTop,
                    type: "L",
                    content: null
                });
            } else {
                lineData.points.push({
                    x: centerX,
                    y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : fromTop,
                    type: "L",
                    content: null
                });
            }

            lineData.points.push({
                x: toItemData.position.left - leftOffset,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "L",
                content: this.data.rightPoint.content
            });
        } else {
            lineData.points.push({
                x: centerX,
                y: toTop,
                type: "L",
                content: this.data.rightPoint.content
            });
        }
    }
    setSquarePoints(lineData) {
        const {
            topOffset,
            leftOffset,
            fromItemData,
            toItemData,
            fromRowData,
            toRowData
        } = lineData;

        if (!this.api.parentsExpanded(fromRowData.id) && !this.api.parentsExpanded(toRowData.id)) return;

        const fromTop = this.api.getRowViewTop(fromRowData.id),
            toTop = this.api.getRowViewTop(toRowData.id);

        lineData.points.push({
            x: fromItemData.position.right + leftOffset,
            y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
            type: "M",
            content: this.data.leftPoint.content
        });

        if ( fromItemData.position.viewTop !== toItemData.position.viewTop ) {
            if ( toItemData.position.left < fromItemData.position.right ) {
                lineData.points.push({
                    x: fromItemData.position.right + leftOffset + 10,
                    y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                    type: "L",
                    content: null
                });

                if ( toItemData.position.viewTop > fromItemData.position.viewTop ) {
                    lineData.points.push({
                        x: fromItemData.position.right + leftOffset + 10,
                        y: this.api.parentsExpanded(fromRowData.id) ? fromTop + fromRowData.outerHeight : fromTop,
                        type: "L",
                        content: null
                    });
                    lineData.points.push({
                        x: toItemData.position.left + leftOffset + 10,
                        y: this.api.parentsExpanded(fromRowData.id) ? fromTop + fromRowData.outerHeight : fromTop,
                        type: "L",
                        content: null
                    });
                    lineData.points.push({
                        x: toItemData.position.left + leftOffset + 10,
                        y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop : toTop,
                        type: "L",
                        content: this.data.rightPoint.content
                    });
                } else {
                    lineData.points.push({
                        x: fromItemData.position.right + leftOffset + 10,
                        y: fromTop,
                        type: "L",
                        content: null
                    });
                    lineData.points.push({
                        x: toItemData.position.left + leftOffset + 10,
                        y: fromTop,
                        type: "L",
                        content: null
                    });
                    lineData.points.push({
                        x: toItemData.position.left + leftOffset + 10,
                        y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + toItemData.actualHeight : toTop,
                        type: "L",
                        content: this.data.rightPoint.content
                    });
                }
            } else {
                lineData.points.push({
                    x: toItemData.position.left + 10,
                    y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                    type: "L",
                    content: null
                });
                if ( toItemData.position.viewTop > n.position.viewTop ) {
                    lineData.points.push({
                        x: toItemData.position.left + 10,
                        y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop : toTop,
                        type: "L",
                        content: this.data.rightPoint.content
                    });
                } else {
                    lineData.points.push({
                        x: toItemData.position.left + 10,
                        y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + toItemData.actualHeight : toTop,
                        type: "L",
                        content: this.data.rightPoint.content
                    });
                }
            }
        } else {
            lineData.points.push({
                x: toItemData.position.left - leftOffset,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "L",
                content: this.data.rightPoint.content
            });
        }

    }
    setSmoothPoints(lineData) {
        const {
            topOffset,
            leftOffset,
            fromItemData,
            toItemData,
            fromRowData,
            toRowData
        } = lineData;

        if (!this.api.parentsExpanded(fromRowData.id) && !this.api.parentsExpanded(toRowData.id)) return;

        const fromTop = this.api.getRowViewTop(fromRowData.id),
            toTop = this.api.getRowViewTop(toRowData.id);

        lineData.points.push({
            x: fromItemData.position.right + leftOffset,
            y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
            type: "M",
            content: this.data.leftPoint.content
        });
        if (fromItemData.position.viewTop === toItemData.position.viewTop) {
            lineData.points.push({
                x: toItemData.position.left - leftOffset,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "L",
                content: this.data.rightPoint.content
            });
            return; 
        }
        const halfWidth = (toItemData.position.left - fromItemData.position.right) / 2,
            centerX = fromItemData.position.right + halfWidth;

        if (fromItemData.position.right <= toItemData.position.left) {
            lineData.points.push({
                x: centerX,
                y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                type: "C",
                content: null
            });
            lineData.points.push({
                x: centerX,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "",
                content: null
            });
            lineData.points.push({
                x: toItemData.position.left - leftOffset,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "",
                content: this.data.rightPoint.content
            });
        } else {
            const halfHeight = (toItemData.position.viewTop - fromItemData.position.viewTop) / 2,
                centerY = fromItemData.position.viewTop + halfHeight + topOffset;

            lineData.points.push({
                x: fromItemData.position.right + 20,
                y: this.api.parentsExpanded(fromRowData.id) ? fromItemData.position.viewTop + topOffset : fromTop,
                type: "C",
                content: null
            });
            lineData.points.push({
                x: fromItemData.position.right + 40,
                y: centerY,
                type: "",
                content: null
            });
            lineData.points.push({
                x: centerX,
                y: centerY,
                type: "",
                content: null
            });
            lineData.points.push({
                x: toItemData.position.left + leftOffset - 20,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "S",
                content: null
            });
            lineData.points.push({
                x: toItemData.position.left + leftOffset,
                y: this.api.parentsExpanded(toRowData.id) ? toItemData.position.viewTop + topOffset : toTop,
                type: "",
                content: this.data.rightPoint.content
            });
        }
    }
    setPoints(lineData) {
        const {
            fromItemData,
            toItemData,
            fromRowData,
            toRowData,
            toItem,
            fromItem
        } = lineData, time = this.state.get("$data.chart.time");

        if (!this.state.get("$data.chart.allItemsOnTheLeftOrRight")) {
            this.api.calculateItemPosition(fromItemData.id, fromItemData, fromRowData, time, fromItem);
            this.api.calculateItemPosition(toItemData.id, toItemData, toRowData, time, toItem);
            switch (lineData.type) {
                case "straight":
                    this.setStraightPoints(lineData);
                    break;
                case "square":
                    this.setSquarePoints(lineData);
                    break;
                case "smooth":
                    this.setSmoothPoints(lineData);
                    break;
                case "square-alt":
                    this.setSquareAltPoints(lineData);
                    break;
            }
        }
    }
    generateLines() {
        const res = [],
            allItems = this.api.getAllItems(),
            rowsData = this.api.getRowsData(),
            itemsData = this.api.getItemsData(),
            time = this.state.get("$data.chart.time"),
            chartDimensions = this.state.get("$data.chart.dimensions"),
            dataScrollVert = this.state.get("$data.scroll.vertical"),
            width = Math.round(time.rightPx - time.leftPx),
            type = this.data.type;

        if (!this.state.get("$data.chart.allItemsOnTheLeftOrRight")) {

            for (const itemId in allItems) {
                const item = allItems[itemId];
                if (!item.dependant) continue;
                if (!item.dependant.length) continue;
                const rowData = rowsData[item.rowId],
                    itemData = itemsData[itemId],
                    fromItem = item;

                if (itemData && rowData) {
                    for (const dependantItemId of item.dependant) {
                        const dependantItem = allItems[dependantItemId],
                            toItem = dependantItem,
                            toRowData = rowsData[dependantItem.rowId],
                            toItemData = itemsData[dependantItemId];
                        if (!toItemData || !toRowData) continue;
                        if (time.calculatedZoomMode) {
                            if (fromItem.time.end < time.leftGlobal && toItem.time.start > time.rightGlobal) continue;
                            if (toItem.time.end < time.leftGlobal && fromItem.time.start > time.rightGlobal) continue;
                            if (fromItem.time.start > time.rightGlobal && toItem.time.start > time.rightGlobal) continue;
                            if (fromItem.time.end < time.leftGlobal && toItem.time.end < time.leftGlobal) continue
                        }
                        this.api.calculateItemPosition(itemId, itemData, rowData, time);
                        this.api.calculateItemPosition(dependantItemId, toItemData, toRowData, time);
                        
                        if ( -1 === itemData.width && -1 === toItemData.width) continue;

                        const topOffset = itemData.actualHeight / 2,
                            leftOffset = 0;

                        let lineData = {
                            x: 0,
                            y: 0,
                            width,
                            height: chartDimensions.height - dataScrollVert.preciseOffset,
                            topOffset,
                            leftOffset,
                            points: [],
                            type,
                            fromItemData: itemData,
                            toItemData,
                            fromItem,
                            toItem,
                            fromRowData: rowData,
                            toRowData,
                            className: dependencyLineClass
                        };
                        for (const func of this.data.onLine) lineData = func(lineData);
                        this.setPoints(lineData);
                        res.push(lineData);
                        /*
                        const visibleItems = this.state.get("$data.chart.visibleItems");

                        console.log("DDDD", toItem.id, this.api.isItemInViewport(toItem), visibleItems.includes(toItem.id));
                        let changedVisibleItems = false;
                        if ( !this.api.isItemInViewport(fromItem) && !visibleItems.includes(fromItem.id) ) {
                            visibleItems.push(fromItem.id);
                            changedVisibleItems = true;
                        }
                        if ( !this.api.isItemInViewport(toItem) && !visibleItems.includes(toItem.id) ) {
                            visibleItems.push(toItem.id);
                            changedVisibleItems = true;
                        }
                        if ( changedVisibleItems ) {
                            this.state.update("$data.chart.visibleItems", visibleItems);
                        }
                        */
                    }
                }
            }
        }
        this.data.lines = res;
        for (const func of this.data.onLines) this.data.lines = func(this.data.lines);
        this.updateData();
    }
    getDependencyLinesSlot(props) {

        const element = this.state.get("$data.elements.chart-timeline-items");
        if ( element && element instanceof HTMLElement ) {
            if ( element.__vnode && element.__vnode.ctx && element.__vnode.ctx.ctx ) {
                const vueComp = element.__vnode.ctx.ctx;
                this.onDestroy.push(this.state.subscribeAll(["$data.chart.time", 
                        "$data.chart.dimensions", "$data.scroll.vertical.preciseOffset"], (() => {
                        
                        if ( typeof vueComp.$forceUpdate == "function" ) {
                            vueComp.$forceUpdate();
                        }
                })));
            }
        }

        return (data = {}, outerVNode) => {
            const styleMap = {};

            function generateSquarePaths(lineData) {
                if (!lineData.points.length) return "";
                const points = lineData.points.slice(),
                    firstPoint = points.shift();
                return [`${firstPoint.type} ${firstPoint.x} ${firstPoint.y}`, [...points.map((pt => `${pt.type} ${pt.x} ${pt.y}`))]].join(" ");
            }
    
            function generateStraightPaths(lineData) {
                if (!lineData.points.length) return "";
                const points = lineData.points;
                return[`${points[0].type} ${points[0].x} ${points[0].y}`,`${points[1].type} ${points[1].x} ${points[1].y}`].join(" ");
            }
    
            function generateSmoothPaths(lineData) {
                if (!lineData.points.length) return "";
    
                const points = lineData.points.slice(),
                    firstPoint = points.shift();
    
                    return[`${firstPoint.type} ${firstPoint.x} ${firstPoint.y}`, [...points.map((pt => `${pt.type} ${pt.x} ${pt.y}`))]].join(" ");
            }
    
            function generatePaths(lineData) {
                switch(lineData.type) {
                    case"straight":
                        return generateStraightPaths(lineData);
                    case"square":
                    case"square-alt":
                        return generateSquarePaths(lineData);
                    case "smooth":
                        return generateSmoothPaths(lineData);   
                }
            }
    
            const generatePoint = (pt, i, lineData) => {
                const styleStr = `left:${pt.x-(0===i?this.data.leftPoint.width/2:this.data.rightPoint.width/2)}px;
                               top:${pt.y-(0===i?this.data.leftPoint.height/2:this.data.rightPoint.height/2)}px;
                               width:${0===i?this.data.leftPoint.width:this.data.rightPoint.width}px;
                               height:${0===i?this.data.leftPoint.width:this.data.rightPoint.width}px`;
                               
                return pt.content ? (<div key={lineData.fromItem.id + "^" + lineData.toItem.id + "^" + i} class={pointClass+" "+pointClass+"--"+this.data.type} style={styleStr}>
                                        {pt.content}
                                    </div>) :  null;
            };
    
            const generateLine = (lineData) => {
                return (
                    <svg key={lineData.fromItem.id + "^" + lineData.toItem.id} width={lineData.width} height={lineData.height} xmlns="http://www.w3.org/2000/svg">
                        <path d={generatePaths(lineData)} />
                    </svg>
                );
            };
    
            let linesVNode = null, pointsVNode = null;

            const time = this.state.get("$data.chart.time");
    
            styleMap.width = Math.round(time.rightPx - time.leftPx) + "px";

            const chartDimensions = this.state.get("$data.chart.dimensions"),
                scrollVertOffset = this.state.get("$data.scroll.vertical.preciseOffset");

            styleMap.height = chartDimensions.innerHeight - scrollVertOffset + "px";

            linesVNode = (
                <div class={dependencyLinesClass}>
                    { this.data.lines.map(lineData => (
                        <div
                            class={lineData.className}
                            style={`left: ${lineData.x}px; top: ${lineData.y}px; width: ${lineData.width}px; height: ${lineData.height}px;`}
                        >
                            {generateLine(lineData)}
                        </div>
                    ))}
                </div>
            );
    
            pointsVNode = (
                <div class={pointsClass} style={styleMap}>
                    {
                        this.data.lines.map(lineData => {
                            return lineData.points.map((pt, i) => generatePoint(pt,i,lineData));
                        })
                    }
                </div>
            );

            return (<>
                {linesVNode}
                {outerVNode}
                {pointsVNode}
            </>);
        };
        //renderFunc, renderReactive, 
        // lines, styleMap
         

        /*
        return () => {
            return {
                lines: ,
                points: 
            };
        };
        */
    }
}

function Plugin(options = {}) {
    return function(props) {
        const api = props.gapi,
            value = props.state.get(DependencyLinesStateName);
        
        if ( value ) {
            options = lodash.merge({}, [options, value]);
        }

        const instance = new DependencyLines(props, options);

        api.pluginInitialized("DependencyLines");

        return instance.destroy;
    }
}
export {
    Plugin
};