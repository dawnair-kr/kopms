import lodash from 'lodash';

function Plugin(options = {}) {
    
    const weekdays = options.weekdays || [6, 0];
    
    let className, isDay = false;

    

    return function(props) {
        const onDestroy = [];

        className = options.className || "br-chart-timeline-grid-row-cell--weekend";

        const value = props.state.get("config.plugin.HighlightWeekends");
        
        if ( value ) {
            options = lodash.merge({}, [options, value]);
        }
        
        onDestroy.push(props.state.subscribe("$data.chart.time.format.period", (value => isDay = "day" === value)));
        
        function HighlightWeekends (data = {}, reactiveProps) {
            function highlight(reactiveProps, dt) {
    
                const { classArr } = reactiveProps;
                const isClassInclude = classArr.includes(className);
    
                if (!isDay) {
                    let fIdx = classArr.indexOf(className);
                    if ( fIdx > -1 ) {
                        classArr.splice(fIdx, 1);
                    }
                    return;
                }
    
                const isWeekDay = weekdays.includes(dt.day());
    
                if ( !isClassInclude && isWeekDay ) {
                    classArr.push(className);
                } else if (isClassInclude && !isWeekDay) {
                    let fIdx = classArr.indexOf(className);
                    if ( fIdx > -1 ) {
                        classArr.splice(fIdx, 1);
                    }
                }
            }
    
            const {cell} = data;
            if ( cell ) {
                //console.log("highlight", cell);
                highlight(reactiveProps, cell.time.leftGlobalDate)
            }
            
        }

        props.state.update("config.actions.br-chart-timeline-grid-row-cell", (value => (value.push(HighlightWeekends), value)));

        props.gapi.pluginInitialized("HighlightWeekends");

        return function() {
            onDestroy.forEach((f => f())); 
            props.state.update("config.actions.br-chart-timeline-grid-row-cell", (value => value.filter((v => v !== HighlightWeekends))));
            api.pluginDestroyed("HighlightWeekends");
        };
    }
}

export {
    Plugin
}