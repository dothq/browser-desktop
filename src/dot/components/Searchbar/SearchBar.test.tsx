import { render } from '@testing-library/react'
import React from 'react'
import { Searchbar } from '.'

describe('UI Search Bar', () => {
    test('Render', async () => {
        render(<Searchbar />)
    })
})