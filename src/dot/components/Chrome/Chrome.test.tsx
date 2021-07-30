import { render } from '@testing-library/react'
import React from 'react'
import { Chrome } from '.'

describe('UI Chrome', () => {
    test('Render', async () => {
        render(<Chrome />)
    })
})