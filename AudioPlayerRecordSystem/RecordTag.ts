import * as hz from 'horizon/core';
export class RecordTag extends hz.Component<typeof RecordTag> {
    static propsDefinition = {
        // set corresponding trackId in properties panel
        trackId: { type: typeof hz.PropTypes.Number }, 
    };
    
    override start() {
    }
}
hz.Component.register(RecordTag);
