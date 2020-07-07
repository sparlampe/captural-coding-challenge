import {ScalePictureInstructionType} from "./types";
import {right, isLeft} from "fp-ts/lib/Either";

describe('DownscaleInputType', () => {
    it('should return a Right for valid input', () => {
        const validTestObject = {imageUrl: "someUrl", scaleFactor: 0.5}
        expect(ScalePictureInstructionType.decode(validTestObject)).toEqual(right(validTestObject));
    });

    it('should return a Left for invalid input', () => {
        const invalidImageUrlResult = ScalePictureInstructionType.decode({imageUrl: "", scaleFactor: 0.5})
        expect(isLeft(invalidImageUrlResult)).toBeTruthy();
        const invalidScaleFactorResult = ScalePictureInstructionType.decode({imageUrl: "someUrl", scaleFactor: 0.001})
        expect(isLeft(invalidScaleFactorResult)).toBeTruthy();
    });
});