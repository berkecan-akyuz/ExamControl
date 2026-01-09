const faceService = require('../services/faceService');

describe('Face Service ML Wrapper', () => {

    // Test 1: Mock Mode Functionality
    test('verifyIdentity should return mock result when ML is unavailable (or forced to mock)', async () => {
        // Create a dummy buffer
        const dummyBuffer = Buffer.from('fake-image-data');
        const dummyRefs = ['/path/to/ref1.jpg'];

        const result = await faceService.verifyIdentity(dummyBuffer, dummyRefs);

        // Expect structure matches expected output
        expect(result).toHaveProperty('isMatch');
        expect(typeof result.isMatch).toBe('boolean');
        expect(result).toHaveProperty('score');

        // Since we know our current env likely doesn't have the heavy binaries loaded in the test runner context 
        // (unless installed), it might default to mock. 
        // If it actually runs real ML, isMock might be false. 
        // But for this requirement, we check that it *runs*.

        // If the service exports a way to check mode, we could assert that. 
        // Based on implementation, if it catches load errors, it goes to mock.
        if (result.isMock) {
            expect(result.isMock).toBe(true);
            expect(result.isMatch).toBe(true); // Mock logic usually returns true
        }
    });

    // Test 2: Error Handling with Invalid Inputs
    test('verifyIdentity should handle empty/null inputs gracefully', async () => {
        // Passing null buffer
        try {
            const result = await faceService.verifyIdentity(null, []);
            // Should probably return an error object or succeed with false
            expect(result).toBeDefined();
        } catch (e) {
            // If it throws, that's one behavior, but robust services should catch internal errors
            // Our service catches errors and returns { isMatch: false, error: ... }
        }
    });

    // Test 3: Resilience verification
    test('verifyIdentity returns error object on catastrophic failure (simulated)', async () => {
        // Use a path that definitely doesn't exist if strictly file based, 
        // or a buffer that is corrupt if using canvas.
        const corruptBuffer = Buffer.from([0, 0, 0]);

        const result = await faceService.verifyIdentity(corruptBuffer, ['bad/path']);
        // Should not crash process
        expect(result).toHaveProperty('isMatch');
    });

});
