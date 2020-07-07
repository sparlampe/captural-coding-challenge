import {basename} from "path";
import {parse} from "url";
import {pipe} from "fp-ts/lib/pipeable";
import {PathReporter} from "io-ts/lib/PathReporter";
import {ScalePictureInstruction, ScalePictureInstructionType} from "../types/types";
import * as E from 'fp-ts/lib/Either'

export const createHeaders = (imageUrl: string, scaleFactor: number) => {
    const [fileName, format] = basename(parse(imageUrl).pathname || "originalFile").split(".")
    const newFileName = `${fileName}_scaled${`${scaleFactor}`.replace(".", "_")}.${format}`
    return [
        ["Content-Type", `image/${format}`],
        ["Content-Disposition", `attachment; filename="${newFileName}"`]
    ]
}

export const scaleDimensions = (scaleFactor: number, origWidth: number | undefined, origHeight: number | undefined) => ({
    newWidth: origWidth ? Math.round(origWidth * scaleFactor) : null,
    newHeight: origHeight ? Math.round(origHeight * scaleFactor) : null,
})

export const getScalingInstruction = (reqBody: any):E.Either<ErrorWithStatus,ScalePictureInstruction> => pipe(
    ScalePictureInstructionType.decode(reqBody),
    E.mapLeft((e):ErrorWithStatus => ({status:422, msg: PathReporter.report(E.left(e))}))
)

export interface ErrorWithStatus {
    status: number
    msg: string | string[]
}