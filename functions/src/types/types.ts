import * as t from "io-ts";
import {NonEmptyString} from "io-ts-types/lib/NonEmptyString";

interface Range0_01to0_99Brand {
    readonly Range0_01to0_99: unique symbol
}
export const ScalePictureInstructionType = t.type({
    imageUrl: NonEmptyString,
    scaleFactor: t.brand(
        t.number,
        (n): n is t.Branded<number, Range0_01to0_99Brand> => n >= 0.01 && n <= 0.99,
        'Range0_01to0_99'
    ),
    upload: t.union([t.boolean, t.undefined])
})
export type ScalePictureInstruction = t.TypeOf<typeof ScalePictureInstructionType>