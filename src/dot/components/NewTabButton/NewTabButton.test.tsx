import { render } from '@testing-library/react'
import React from 'react'
import { NewTabButton } from '.'

describe('UI New Tab Button', () => {
    test('Render tabstrip variant', async () => {
        render(<NewTabButton variant="tab-bar" />)
    })

    test('Render navigation bar variant', async () => {
        render(<NewTabButton variant="navigation-bar" />)
    })
})