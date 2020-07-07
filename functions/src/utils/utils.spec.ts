import {createHeaders, scaleDimensions, getScalingInstruction} from "./utils";
import {isLeft, right} from "fp-ts/lib/Either";

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

describe('getScalingInstruction', () => {
    it('should return a Right for valid input', () => {
        const validTestObject = {imageUrl: "someUrl", scaleFactor: 0.5}
        expect(getScalingInstruction(validTestObject)).toEqual(right(validTestObject));
    });

    it('should return a Left for invalid input', () => {
        const invalidImageUrlResult = getScalingInstruction({imageUrl: "", scaleFactor: 0.5})
        expect(isLeft(invalidImageUrlResult)).toBeTruthy();

    });
});