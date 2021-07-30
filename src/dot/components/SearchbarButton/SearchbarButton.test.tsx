import { render } from '@testing-library/react'
import React from 'react'
import { SearchbarButton } from '.'

describe('UI Search Button', () => {
    test('Render', async () => {
        render(<SearchbarButton id="test" />)
    })
})