import {createHeaders} from "./utils";

describe('createHeaders', () => {
    it('should create content type and disposition headers', () => {
        const headers = createHeaders("https://somedomain.com/somePic.png", 0.5)
        expect(headers).toEqual([
            ["Content-Type", "image/png"],
            ["Content-Disposition", 'attachment; filename="somePic_scaled0_5.png"']
        ]);
    });
});