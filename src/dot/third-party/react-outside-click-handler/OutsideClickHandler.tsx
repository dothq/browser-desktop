/*
    MIT License

    Copyright (c) 2018 Airbnb

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

import contains from 'document.contains';
import React from 'react';

const DISPLAY = {
    BLOCK: 'block',
    FLEX: 'flex',
    INLINE: 'inline',
    INLINE_BLOCK: 'inline-block',
    CONTENTS: 'contents',
};

interface Props {
    children: React.ReactChildren,
    onOutsideMouseDown?: () => void,
    onOutsideMouseUp?: () => void,
    disabled?: boolean,
    useCapture?: boolean,

    display: 'block' | 'flex' | 'inline' | 'inline-block' | 'contents'
}

export default class OutsideClickHandler extends React.Component {
    public props: Props | any;
    public childNode: any;
    public removeMouseUp: any;
    public removeMouseDown: any;

    constructor(args: Props) {
        super(args);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.setChildNodeRef = this.setChildNodeRef.bind(this);
    }

    componentDidMount() {
        const { disabled, useCapture } = this.props;

        if (!disabled) this.addMouseDownEventListener(useCapture);
    }

    componentDidUpdate({ disabled: prevDisabled }: { disabled: any }) {
        const { disabled, useCapture } = this.props;
        if (prevDisabled !== disabled) {
            if (disabled) {
                this.removeEventListeners();
            } else {
                this.addMouseDownEventListener(useCapture);
            }
        }
    }

    componentWillUnmount() {
        this.removeEventListeners();
    }

    // Use mousedown/mouseup to enforce that clicks remain outside the root's
    // descendant tree, even when dragged. This should also get triggered on
    // touch devices.
    onMouseDown(e: Event) {
        const { useCapture, onOutsideMouseDown } = this.props;

        const isDescendantOfRoot = this.childNode && contains(this.childNode, e.target);
        if (!isDescendantOfRoot) {
            if (this.removeMouseUp) {
                this.removeMouseUp();
                this.removeMouseUp = null;
            }

            if (onOutsideMouseDown) onOutsideMouseDown(e);

            this.removeMouseUp = document.addEventListener(
                'mouseup',
                this.onMouseUp,
                { capture: useCapture },
            );
        }
    }

    // Use mousedown/mouseup to enforce that clicks remain outside the root's
    // descendant tree, even when dragged. This should also get triggered on
    // touch devices.
    onMouseUp(e: Event) {
        const { onOutsideMouseUp } = this.props;

        const isDescendantOfRoot = this.childNode && contains(this.childNode, e.target);
        if (this.removeMouseUp) {
            this.removeMouseUp();
            this.removeMouseUp = null;
        }

        if (!isDescendantOfRoot) {
            if (onOutsideMouseUp) onOutsideMouseUp(e);
        }
    }

    setChildNodeRef(ref: any) {
        this.childNode = ref;
    }

    addMouseDownEventListener(useCapture: boolean) {
        this.removeMouseDown = document.addEventListener(
            'mousedown',
            this.onMouseDown,
            { capture: useCapture },
        );
    }

    removeEventListeners() {
        if (this.removeMouseDown) this.removeMouseDown();
        if (this.removeMouseUp) this.removeMouseUp();
    }

    render() {
        const { children, display } = this.props;

        return (
            <div
                ref={this.setChildNodeRef}
                style={
                    display !== DISPLAY.BLOCK
                        ? { display }
                        : undefined
                }
            >
                {children}
            </div>
        );
    }
}