import {createHeaders, scaleDimensions} from "./utils";

describe('createHeaders', () => {
    it('should create content type and disposition headers', () => {
        const headers = createHeaders("https://somedomain.com/somePic.png", 0.5)
        expect(headers).toEqual([
            ["Content-Type", "image/png"],
            ["Content-Disposition", 'attachment; filename="somePic_scaled0_5.png"']
        ]);
    });
});

describe('scaleDimensions', () => {
    it('should produce integer pixel sizes', () => {
        const newDimensions = scaleDimensions(0.5, 3, 3)
        expect(newDimensions).toEqual({
            newWidth: 2,
            newHeight: 2,
        });
    });
});