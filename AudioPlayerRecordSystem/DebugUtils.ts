// add following line:
// import { DebugUtils } from './DebugUtils';
// to another file in same directory to use

// reads and prints all component details
export function serializeComponent(component: any): string {
    const seen = new WeakSet();
    return JSON.stringify(component, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        } else if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
}