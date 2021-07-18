export class Menu {
    public id: string;

    public isOpen: boolean = false;

    private menuEl: HTMLMenuElement | null;

    public open(x: number, y: number) {
        this.element.setAttribute("open", "true");

        this.element.style.setProperty("--menu-x", `${x}px`);
        this.element.style.setProperty("--menu-y", `${y}px`);

        this.isOpen = true;
    }

    public close() {
        this.element.removeAttribute("open");

        this.element.style.removeProperty("--menu-x");
        this.element.style.removeProperty("--menu-y");

        this.isOpen = false;
    }

    public toggle(event: MouseEvent) {
        if (this.isOpen) this.close()
        else this.open(event.pageX, event.pageY)
    }

    public get element() {
        if (!this.menuEl) {
            this.menuEl = document.getElementById(this.id) as HTMLMenuElement;
        }

        return this.menuEl;
    }

    constructor(id: string) {
        this.id = id;
        this.menuEl = document.getElementById(this.id) as HTMLMenuElement;
    }
}