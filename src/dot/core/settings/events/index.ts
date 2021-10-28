export class SettingsEvent {
    public constructor(event: string) {
        window.addEventListener(
            event,
            (this as any).action
        );
    }
}
