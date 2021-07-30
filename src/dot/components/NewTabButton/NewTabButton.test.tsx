import { render } from '@testing-library/react'
import React from 'react'
import { NewTabButton } from '.'

describe('UI New Tab Button', () => {
    test('Render', async () => {
        render(<NewTabButton variant="tab-bar" />)
    })
})