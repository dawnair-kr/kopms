import lodash from 'lodash';

//ProgressBarStateName
const ProgressBarStateName = "config.plugin.ProgressBar";

class ProgressBar {
    constructor(options, props) {
        this.options = function(options) {
            return Object.assign({
                enabled: true,
                className: "br-chart-timeline-items-row-item-progress-bar"
            }, options);
        }(options);

        this.state = props.state;
        this.api = props.gapi;
        this.className = this.options.className;
        this.getProgressBarSlot = this.getProgressBarSlot.bind(this);
        this.destroy = this.destroy.bind(this);
        this.state.update("config.slots.br-chart-timeline-items-row-item.inner", (value => {
            if ( !value.includes(this.getProgressBarSlot) ) {
                value.push(this.getProgressBarSlot);
            }
            return value;
        }));
    }
    destroy() {
        this.state.update("config.slots.br-chart-timeline-items-row-item.inner", (value => {
            value = value.filter((v => v !== this.getProgressBarSlot));
            return value;
        }));
        this.api.pluginDestroyed("ProgressBar");
    }
    getProgressBarSlot(props) {

        return (data = {}, innerVNode) => {

            const {itemInfo, renderProps} = data;

            if (!itemInfo || !itemInfo.item) return innerVNode;
            
            const itemData = this.api.getItemData(itemInfo.item.id);

            if (!itemData || null == itemInfo.item.progress) return innerVNode;

            if (!itemInfo.item) return;

            const item = itemInfo.item,
                progressVal = null == item.progress ? 100 : item.progress;

            const styleMap = {
                width: "0px"
            };

            if ( 0 == Math.floor(itemData.width) ) {
                styleMap.width = 100 - progressVal + "%";
            } else {
                let w = itemData.width - itemData.width / 100 * progressVal;   
                w -= itemData.position.right - itemData.position.actualRight;
                if ( w < 0 ) {
                    w = 0;
                }
                styleMap.width = Math.floor(w) + "px";
            }
            return (
                <>
                { itemInfo && itemInfo.item && null != itemInfo.item.progress ?
                    <div class={this.className} style={styleMap}></div> : null 
                }
                {innerVNode}
                </>
            )
        };
    }
}

function Plugin(options = {}) {
    return function(props) {
        const value = props.state.get(ProgressBarStateName);
        value && (options = lodash.merge({}, [options, value]));
        const instance = new ProgressBar(options, props);
        props.gapi.pluginInitialized("ProgressBar");
        return instance.destroy;
    }
}

export {
    Plugin
};