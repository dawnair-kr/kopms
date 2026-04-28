import lodash from 'lodash';

const ItemTypesStateName = "config.plugin.ItemTypes",
    TemplatesStateName = "config.templates.br-chart-timeline-items-row-item",
    defaultOptions = {
        task({ className, labelClassName, actions, styleMap,
        cutterLeft, cutterRight,
        getContent, props }) {

            const { itemData, item } = props.itemInfo,
                changedLeft = itemData.position.left !== itemData.position.actualLeft,
                changedRight = itemData.position.right !== itemData.position.actualRight,
                width = itemData.actualWidth,
                height = itemData.actualHeight,
                centerY = Math.min(8, height / 2);

            props.renderProps.styleMap.left = (itemData.position.actualLeft + props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.width = (itemData.actualWidth - props.renderProps.rightSpace - props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.top = itemData.position.actualRowTop + "px";
            props.renderProps.styleMap.height = itemData.actualHeight + "px";

            let pathdata = [`M ${centerY} ${height}`, `Q 0 ${height} 0 ${height-centerY}`, `L 0 ${centerY}`, 
                    `Q 0 0 ${centerY} 0`, `L ${width-centerY} 0`, `Q ${width} 0 ${width} ${centerY}`, 
                    `L ${width} ${height-centerY}`, `Q ${width} ${height} ${width-centerY} ${height}`, 
                    `L ${centerY} ${height}`].join(" ");

            if ( changedLeft && !changedRight ) {
                pathdata = ["M 0 0", `L ${width-centerY} 0`, `Q ${width} 0 ${width} ${centerY}`, 
                           `L ${width} ${height-centerY}`, `Q ${width} ${height} ${width-centerY} ${height}`, 
                           `L 0 ${height}`].join(" ");
            } else {
                if ( changedLeft && changedRight ) {
                    pathdata = ["M 0 0", `L ${width} 0`, `L ${width} ${height}`, `L 0 ${height}`].join(" ");
                } else {
                    if ( !changedLeft && changedRight ) {
                        pathdata = [`M ${centerY} ${height}`, `Q 0 ${height} 0 ${height-centerY}`, `L 0 ${centerY}`, 
                        `Q 0 0 ${centerY} 0`, `L ${width} 0`, `L ${width} ${height}`, `L ${centerY} ${height}`].join(" ");
                    }
                }
            }

            const clipPathId = `br-clip-path-${item.id}`,
                patternId = `br-pattern-${item.id}`,
                progress = null == item.progress ? 100 : item.progress,
                progressOffset = itemData.width - itemData.width / 100 * progress;
            
            let pgX = itemData.width - progressOffset;

            if ( changedLeft ) {
                pgX += itemData.position.left;
            }
            if ( pgX < 0 ) {
                pgX = 0;
            }

            const progressPath = [`M ${pgX} 0`, `L ${width} 0`, `L ${width} ${height}`, `L ${pgX} ${height}`].join(" "),
                fillColor = item.fill ? item.fill : "#e74c3c",
                addClass = ["br-item-type", `br-item-type--${item.type}`];

            return (
                <div class={addClass.concat(props.renderProps.classArr)} data-brid={item.id} data-actions={actions({
                    itemInfo: props.itemInfo}, props.renderProps)} style={props.renderProps.styleMap}>
                    {
                        width >=0 ? 
                            <svg width={width} height={itemData.actualHeight} xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id={clipPathId}>
                                        <path d={pathdata}></path>
                                    </clipPath>
                                    <pattern
                                        id={patternId}
                                        width="20"
                                        height="20"
                                        patternTransform="rotate(45 0 0)"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <line
                                            class="br-item-type-progress-line"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="20"
                                        />
                                    </pattern>
                                </defs>
                                <path class="br-item-type-item" d={pathdata} fill={fillColor} />
                                <path
                                    class="br-item-type-progress"
                                    clip-path={`url(#${clipPathId})`}
                                    d={progressPath}
                                    style={`fill: url('#${patternId}');`} />
                                <g clip-path={`url(#${clipPathId})`}>
                                    <foreignObject  x="0" y="0" width="100%" height="100%">
                                        <div class="br-item-type-content" xmlns="http://www.w3.org/1999/xhtml">
                                            {getContent(addClass.concat([labelClassName]))}
                                        </div>
                                    </foreignObject>
                                </g>
                            </svg>
                        : null
                    }
                </div>
            );
        },
        milestone({ className, labelClassName, actions, styleMap,
            cutterLeft, cutterRight,
            getContent, props
        }) {
            const { itemData, item } = props.itemInfo,
                arrowSize = 16,
                width = itemData.actualWidth,
                height = itemData.actualHeight,
                changedLeft = itemData.position.left !== itemData.position.actualLeft,
                changedRight = itemData.position.right !== itemData.position.actualRight;

            
            props.renderProps.styleMap.left = (itemData.position.actualLeft + props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.width = (itemData.actualWidth - props.renderProps.rightSpace - props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.top = itemData.position.actualRowTop + "px";
            props.renderProps.styleMap.height = itemData.actualHeight + "px";
            
            let pathdata = ["M 0 " + itemData.actualHeight / 2, 
                `L ${width>=32?arrowSize:width/2} 0`, `L ${width>=32?width-arrowSize:width/2} 0`, 
                `L ${width} ${itemData.actualHeight/2}`, `L ${width>=32?width-arrowSize:width/2} ${itemData.actualHeight}`, 
                `L ${width>=32?arrowSize:width/2} ${itemData.actualHeight}`, "L 0 " + itemData.actualHeight / 2].join(" ");

            if ( changedLeft && !changedRight ) {
                pathdata = ["M 0 0", `L ${width>=32?width-arrowSize:width/2} 0`, 
                           `L ${width} ${itemData.actualHeight/2}`, `L ${width>=32?width-arrowSize:width/2} ${itemData.actualHeight}`, 
                           `L 0 ${height}`].join(" ");
            } else {
                if ( changedLeft && changedRight ) {
                    pathdata = ["M 0 0", `L ${width} 0`, `L ${width} ${height}`, `L 0 ${height}`].join(" ");
                } else {
                    if ( !changedLeft && changedRight ) {
                        pathdata = ["M 0 " + itemData.actualHeight / 2, 
                             `L ${width>=32?arrowSize:width/2} 0`, `L ${width} 0`, `L ${width} ${height}`, 
                             `L ${width>=32?arrowSize:width/2} ${itemData.actualHeight}`, "L 0 " + itemData.actualHeight / 2].join(" ");
                    }
                }
            }

            const clipPathId = `br-clip-path-${item.id}`,
                patternId = `br-pattern-${item.id}`,
                progress = null == item.progress ? 100 : item.progress,
                progressOffset = itemData.width - itemData.width / 100 * progress;

            let pgX = itemData.width - progressOffset;

            changedLeft && (pgX += itemData.position.left);
            pgX < 0 && (pgX = 0);
            
            const progressPath = [`M ${width} 0`, `L ${width} ${height}`, `L ${pgX} ${height}`, `L ${pgX} 0`].join(" "),
                fillColor = item.fill ? item.fill : "#e74c3c",
                addClass = ["br-item-type", `br-item-type--${item.type}`];

            return (
                <div class={addClass.concat(props.renderProps.classArr)} data-brid={item.id} data-actions={actions({
                    itemInfo: props.itemInfo}, props.renderProps)} style={props.renderProps.styleMap}>
                    {
                        width >= 0 ?
                            <svg width={width} height={itemData.actualHeight} xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id={clipPathId}>
                                        <path d={pathdata}></path>
                                    </clipPath>
                                    <pattern
                                        id={patternId}
                                        width="20"
                                        height="20"
                                        patternTransform="rotate(45 0 0)"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <line
                                            class="br-item-type-progress-line"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="20"
                                        />
                                    </pattern>
                                </defs>
                                <path class="br-item-type-item" d={pathdata} stroke="none" fill={fillColor} />
                                <path
                                    class="br-item-type-progress"
                                    clip-path={`url(#${clipPathId})`}
                                    d={progressPath}
                                    style={`fill: url('#${patternId}');`} />

                                <g clip-path={`url(#${clipPathId})`}>
                                    <foreignObject x="0" y="0" width="100%" height="100%">
                                        <div class="br-item-type-content" xmlns="http://www.w3.org/1999/xhtml">
                                            {getContent(addClass.concat([labelClassName]))}
                                        </div>
                                    </foreignObject>
                                </g>
                            </svg>
                        : null
                    }
                </div>        
            );
        },
        project({ className, labelClassName, actions, styleMap,
            cutterLeft, cutterRight,
            getContent, props
        }) {
            const {itemData, item} = props.itemInfo,
                width = itemData.actualWidth,
                height = itemData.actualHeight,
                changedLeft = itemData.position.left !== itemData.position.actualLeft,
                clipPathId = `br-clip-path-${item.id}`,
                patternId = `br-pattern-${item.id}`,
                progress = null == item.progress ? 100 : item.progress,
                progressOffset = itemData.width - itemData.width / 100 * progress;

            function getDownPentagonPath (x, y, size, arr) {
                    //let arr = [];
                    arr.push("L" + (x + size*2) + " " + (y));
                    arr.push("L" + (x + size*2) + " " + (y + size));
                    arr.push("L" + (x + size) + " " + (y + size*2));
                    arr.push("L" + x + " "  + (y + size));
                    arr.push("L" + x + " " + (y));
                    //return arr.join(" ");
                    /*
                    ctx.lineTo((x + size*2), y);
                    ctx.lineTo((x + size*2), (y + size));
                    ctx.lineTo((x + size), (y + size*2));
                    ctx.lineTo(x, (y + size));
                    ctx.lineTo(x, y);
                    */
               }
            
            
            //let pathdata = ["M 0 0", `L ${width} 0`, `L ${width} ${height}`, `L 0 ${height}`].join(" ");
            let pathdata = [];
            let prjHeight = height;
            let overWidth = prjHeight*0.4;
            let prjWidth =  width + (overWidth*2);
            let prjInnerHeight = prjHeight*0.7;
            
            pathdata.push(`M${0} ${0}`);
            //pathdata = ["M 0 0", `L ${width} 0`, `L ${width} ${height}`, `L 0 ${height}`].join(" ")
            getDownPentagonPath(0, 0, overWidth, pathdata);
            pathdata.push("L" + (prjWidth) + " " + (0));
            getDownPentagonPath(prjWidth - overWidth*2, 0, overWidth, pathdata);
            pathdata.push("L" + (prjWidth - overWidth) + " " + (0 + prjInnerHeight));
            pathdata.push("L" + (overWidth) + " " + (0 + prjInnerHeight));
            
            pathdata = pathdata.join(" ");
            props.renderProps.styleMap.left = (itemData.position.actualLeft + props.renderProps.leftSpace - overWidth) + "px";
            //props.renderProps.styleMap.width = (width - props.renderProps.rightSpace - props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.width = (prjWidth - props.renderProps.rightSpace - props.renderProps.leftSpace) + "px";
            props.renderProps.styleMap.top = itemData.position.actualRowTop + "px";
            //props.renderProps.styleMap.top = "0px";
            props.renderProps.styleMap.height = prjHeight + "px";
            
            let pgX = itemData.width - progressOffset;

            changedLeft && (pgX += itemData.position.left);
            pgX < 0 && (pgX = 0);

            const progressPath = [`M ${prjWidth} 0`, `L ${prjWidth} ${height}`, `L ${pgX} ${prjHeight}`, `L ${pgX} 0`].join(" "),
                fillColor = item.fill ? item.fill : "#e74c3c",
                addClass = ["br-item-type", `br-item-type--${item.type}`];

            return (
                <div class={addClass.concat(props.renderProps.classArr)} data-brid={item.id} data-actions={actions({
                    itemInfo: props.itemInfo}, props.renderProps)} style={props.renderProps.styleMap}>
                    {
                        width >= 0 ?
                            <svg width={prjWidth} height={prjHeight} xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id={clipPathId}>
                                        <path d={pathdata}></path>
                                    </clipPath>
                                    <pattern
                                        id={patternId}
                                        width="20"
                                        height="20"
                                        patternTransform="rotate(45 0 0)"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <line
                                            class="br-item-type-progress-line"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="20"
                                        />
                                    </pattern>
                                </defs>
                                <path class="br-item-type-item" d={pathdata} fill={fillColor} />
                                <path
                                    class="br-item-type-progress"
                                    clip-path={`url(#${clipPathId})`}
                                    d={progressPath}
                                    style={`fill: url('#${patternId}');`} />
                                <g clip-path={`url(#${clipPathId})`}>
                                    <foreignObject x="0" y="0" width="100%" height="100%">
                                        <div class="br-item-type-content" xmlns="http://www.w3.org/1999/xhtml">
                                            {/*<div class={addClass.concat([labelClassName])}>{getContent()}</div>*/ getContent(addClass.concat([labelClassName]))}
                                        </div>
                                    </foreignObject>
                                </g>
                            </svg>
                        : null
                    }        
                </div>        
            );
        }
    };

class ItemTypes {
    constructor(options, props) {
        this.unsub = [];
        this.options = function(options) {
            return Object.assign(Object.assign({}, defaultOptions), options);
        }(options);
        
        this.state = props.state;
        this.api = props.gapi;
        
        this.componentTemplate = this.componentTemplate.bind(this);
        this.destroy = this.destroy.bind(this);
        
        this.state.update(ItemTypesStateName, this.options);

        this.state.update(TemplatesStateName, (() => this.componentTemplate));

        this.unsub.push(this.state.subscribe(ItemTypesStateName, (value => this.options = value)));
        this.api.pluginInitialized("ItemTypes");
    }
    destroy() {
        this.unsub.forEach((f => f()));
        this.state.update(TemplatesStateName, null);
        this.api.pluginDestroyed("ItemTypes");
    }
    componentTemplate(options) {
        const item = options.props.itemInfo.item;
        if (!item) return null;
        const type = item.type;
        if (!type) {
            throw new Error(`Item (${item.id}) must have a 'type' {string} property 'task', 'milestone' or 'project'.`);
        }
        return this.options[type](options);
    }
}

function Plugin(options = {}) {
    return function(props) {
        const value = props.state.get(ItemTypesStateName);
        if ( value ) {
            options = lodash.merge({}, [options, value]);
        }
        return new ItemTypes(options, props).destroy;
    }
}

export {
    Plugin, 
    ItemTypesStateName as pluginPath, 
    TemplatesStateName as templatePath
};