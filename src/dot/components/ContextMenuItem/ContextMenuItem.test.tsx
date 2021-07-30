import { render } from '@testing-library/react'
import React from 'react'
import { ContextMenuItem } from '.'

describe('UI Context Menu Item', () => {
    test('Render', async () => {
        render(<ContextMenuItem id="test" label="label" icon="anIcon" />)
    })
})