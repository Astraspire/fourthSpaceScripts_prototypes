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