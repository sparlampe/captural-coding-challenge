import * as functions from 'firebase-functions';
import {
    createHeaders,
    createPictureStream,
    getScaledPictureStreamTask,
    getScalingInstruction, getVerifiedIdToken, saveInstructionTask
} from "./utils/utils";
import {pipe} from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";
import {fromEither, chain, taskEither,map} from "fp-ts/lib/TaskEither";
import * as admin from 'firebase-admin';
import {sequenceT} from "fp-ts/lib/Apply";

admin.initializeApp()
const db = admin.firestore();
export const downscaleImage = functions.https.onRequest(async (req, res) => {
    
    const tokenVerifier = (t: string) => admin.auth().verifyIdToken(t)
    const s = await pipe(
        sequenceT(taskEither)(getVerifiedIdToken(tokenVerifier)(req), fromEither(getScalingInstruction(req.body))),
        chain(([idToken, instruction]) => saveInstructionTask(db)(idToken, instruction)),
        map(createPictureStream),
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
