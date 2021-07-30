import { render, screen } from '@testing-library/react'
import React from 'react'
import { Tabs } from '.'

describe('UI Tab', () => {
    test('Render', async () => {
        render(<Tabs><span>Inner text</span></Tabs>)

        expect(await screen.findByText(/Inner text/)).toBeInTheDocument()
    })
})