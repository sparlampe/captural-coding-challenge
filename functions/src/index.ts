import * as functions from 'firebase-functions';
import {
    createHeaders,
    createPictureStream,
    getScaledPictureStreamTask,
    getScalingInstruction, getVerifiedIdToken
} from "./utils/utils";
import {pipe} from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";
import {fromEither, chain} from "fp-ts/lib/TaskEither";
import * as admin from 'firebase-admin';

admin.initializeApp({
    projectId: "capturalcodingchallenge"
})

export const downscaleImage = functions.https.onRequest(async (req, res) => {
    
    const s = await pipe(
        req,
        getVerifiedIdToken((t) => admin.auth().verifyIdToken(t)),
        chain((_) => pipe(
            req.body,
            getScalingInstruction,
            E.map(createPictureStream),
            fromEither)),
        chain(getScaledPictureStreamTask)
    )()

    if (E.isLeft(s)) {
        const err = s.left
        res.send(err.msg)
        res.status(err.status)
        res.end()
    } else {
        const inst = s.right.instruction
        res.status(200)
        createHeaders(inst.imageUrl, inst.scaleFactor).forEach(([k, v]) => res.header(k, v))
        s.right.pictureStream.pipe(res)
    }
});
