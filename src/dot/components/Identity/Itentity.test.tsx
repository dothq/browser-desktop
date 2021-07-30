import { render } from '@testing-library/react'
import React from 'react'
import { Identity } from '.'

describe('UI Identity', () => {
    test('Render', async () => {
        render(<Identity type="search" />)
    })
})