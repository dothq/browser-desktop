import { builtInExtensions } from "./built-in"

describe('Built In', () => {
    it('built in extensions types', () => {
        builtInExtensions.forEach(ext => {
            expect(typeof ext.id).toBe('string')
            expect(typeof ext.version).toBe('number')
            expect(typeof ext.mount).toBe('string')
        })
    })
})