const deepFind = (obj: any, path: string) => {
    return path.split(".")
        .reduce((o, key) => o && o[key] ? o[key] : null, obj);
}

export function R(callback: (args: { _: any, value?: any, previousValue?: any }) => any): any {
    return function(target: any, propertyKey: string) { 
        if(!("__$OIKIA__REACTIVE" in target)) {
            target.__$OIKIA__REACTIVE = {};
        }

        target.__$OIKIA__REACTIVE[propertyKey] = callback;
    }
}

export function Delegate(type: 'on' | 'listener', event: string, callback: (...args: any) => any): any {
    return function(target: any, propertyKey: string) {
        if(
            !("__$OIKIA__REACTIVE" in target) ||
            !(propertyKey in target.__$OIKIA__REACTIVE)
        ) {
            console.warn("Oikia: Target is not reactive or you have called @Delegate before @R.");
            return;
        }

        const parts = event.split(".");
        const eventName = parts.pop();

        const eventTarget = deepFind(target, parts.join("."));

        const functionName = type == "listener" ? "addEventListener" : type;

        eventTarget[functionName](eventName, (...args: any) => {
            // Get result from callback
            const result = callback(args);

            // Apply it to our decorated prop
            // Because @R is above our @Delegate decorator, we 
            // can receive the value and update it in the DOM.
            target[propertyKey] = result;
        })
    }
}

export const makeReactive = (target: any) => {
    if("__$OIKIA__REACTIVE" in target) {
        for (const [key, callback] of Object.entries(target.__$OIKIA__REACTIVE)) {
            let val: any = target[key];

            Object.defineProperty(target, key, {
                get: () => val,
                set: (newValue: any) => {
                    (callback as Function).call(target, {
                        _: target,
                        value: newValue,
                        previousValue: val
                    })

                    val = newValue;
                }
            })
        }
    }
}