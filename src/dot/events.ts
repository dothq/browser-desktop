interface Event {
    handler: EventHandler,
    once?: boolean
}

type EventHandler = () => any;

export class Events {
    public _eventListeners: Record<string, Array<Event>> = {};

    public on(event: string, handler: EventHandler) {
        if(this._eventListeners[event]) {
            this._eventListeners[event].push({ handler });
        } else {
            this._eventListeners[event] = [{ handler }];
        }
    }

    public once(event: string, handler: EventHandler) {
        if(this._eventListeners[event]) {
            this._eventListeners[event].push({ handler, once: true });
        } else {
            this._eventListeners[event] = [{ handler, once: true }];
        }
    }

    public off(event: string, handler: EventHandler) {
        if(this._eventListeners[event]) {
            this._eventListeners[event].filter(i =>
                i == this._eventListeners[event]
                    .find(e => e.handler == handler)
            )    
        }
    }

    public emit(event: string, ...payload: any[]) {
        if(!this._eventListeners[event]) return;

        for(const ev of this._eventListeners[event]) {
            if(ev.once) {
                this.off(event, ev.handler);
            }

            ev.handler.bind(this, payload);
        }
    }
}