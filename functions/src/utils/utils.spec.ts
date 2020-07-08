import {createHeaders, scaleDimensions, getScalingInstruction, getScaledPictureStream} from "./utils";
import {isLeft, right} from "fp-ts/lib/Either";
import * as fs from 'fs'
import {ScalePictureInstruction} from "../types/types";

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

describe('getScaledPictureStream', () => {
    it('should produce a scaled picture stream consuming several bytes to determine the pic size', async () => {
        const instruction = {imageUrl: "someUrl", scaleFactor: 0.5} as ScalePictureInstruction
        const pictureStream = fs.createReadStream('src/test-resources/Lichtenstein_img_processing_test.png')
        let consumedBytes = 0
        pictureStream.on('data', function(chunk){
            consumedBytes += chunk.length;
        })
        const scaleTransform = await getScaledPictureStream({pictureStream, instruction})
        expect(scaleTransform.instruction).toEqual(instruction);
        expect(consumedBytes).toEqual(65536); // default buffer size for image-dimension-stream
    });
});
