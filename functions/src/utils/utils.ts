import {basename} from "path";
import {parse} from "url";
import {pipe} from "fp-ts/lib/pipeable";
import {PathReporter} from "io-ts/lib/PathReporter";
import {ScalePictureInstruction, ScalePictureInstructionType} from "../types/types";
import * as E from 'fp-ts/lib/Either'
import * as Stream from "stream";
import got from 'got';
import pumpify from 'pumpify';
import ImageDimensionSteam from 'image-dimensions-stream'
import sharp = require("sharp");
import {chain, fromEither, tryCatchK} from "fp-ts/lib/TaskEither";
import * as admin from 'firebase-admin';

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

export interface PictureWithScaleInstruction {
    pictureStream: Stream.Stream,
    instruction: ScalePictureInstruction
}

export const createPictureStream = (instruction: ScalePictureInstruction): PictureWithScaleInstruction => ({pictureStream: got.stream(instruction.imageUrl), instruction})

export const getScaledPictureStream = async ({pictureStream, instruction}:PictureWithScaleInstruction) => {
    const dimsStream: Stream.Transform  = new ImageDimensionSteam()
    const dimsPromise: Promise<{dimensions: {width: number, height: number}, pictureStream: Stream.Readable}> = new Promise((resolve, reject) => {
        const dimPictureStream = new pumpify(pictureStream, dimsStream)
        dimPictureStream.on('error', reject)
        dimsStream.on("dimensions",(dimensions) => {
            resolve({dimensions, pictureStream: dimPictureStream})
        })
        dimsStream.on("dimensions",(dimensions) => {
            resolve({dimensions, pictureStream: dimPictureStream})
        })
    })

    const dims = await  dimsPromise
    const {newWidth, newHeight} = scaleDimensions(instruction.scaleFactor, dims.dimensions.width, dims.dimensions.height)

    return {
        pictureStream: new pumpify(dims.pictureStream, sharp().resize(newWidth, newHeight)),
        instruction: instruction
    }
}

export const getScaledPictureStreamTask = tryCatchK(getScaledPictureStream, (e): ErrorWithStatus => ({status: 500, msg: `Could not determine size, error ${(e as Error).toString()}`}))

export interface WithHeader {
    header(name: string): string | undefined
}

export const extractToken= (request: WithHeader): E.Either<ErrorWithStatus, string> => {
    const authHeader = request.header('Authorization')
    const [bearer, token] = (authHeader||"").split(" ")
    return (bearer=== "Bearer" && token) ? E.right(token) : E.left({status: 403, msg: "Authorization header missing."})
}

export const getVerifiedIdToken = (verifier: (arg0:string)=>Promise<admin.auth.DecodedIdToken>) => (request: WithHeader) => pipe(
    request,
    extractToken,
    fromEither,
    chain(tryCatchK(verifier, (e): ErrorWithStatus => ({status:403, msg: (e as Error).toString()}))),
)