import { render } from '@testing-library/react'
import React from 'react'
import { BrowserTab } from '.'

describe('UI Tab', () => {
    test('Render', () => {
        render(<BrowserTab tab={{ active: false, state: 'idle', title: 'test', url: 'https://example.com/' } as any} nextIsActive={false} />)
    })
})