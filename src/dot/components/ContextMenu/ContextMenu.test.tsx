import { render } from '@testing-library/react'
import React from 'react'
import { ContextMenu } from '.'

describe('UI Context Menu', () => {
    test('Render', async () => {
        render(<ContextMenu id="test"><span>child</span></ContextMenu>)
    })
})