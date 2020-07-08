import * as functions from 'firebase-functions';
import {
    createHeaders,
    createPictureStream,
    getScaledPictureStreamTask,
    getScalingInstruction, getVerifiedIdToken, saveInstructionTask
} from "./utils/utils";
import {pipe} from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";
import {fromEither, chain, taskEither, map} from "fp-ts/lib/TaskEither";
import * as admin from 'firebase-admin';
import {sequenceT} from "fp-ts/lib/Apply";
import * as serviceAccount from './capturalcodingchallenge-firebase-adminsdk.json'
import {pipeline} from "stream";
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://capturalcodingchallenge.firebaseio.com",
    storageBucket: "capturalcodingchallenge.appspot.com"
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })
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
        const headers = createHeaders(inst.imageUrl, inst.scaleFactor)
        if (inst.upload) {
                       const fileRef = admin.storage().bucket().file(uuidv4())
            const fileStream = fileRef.createWriteStream();
            const disposition = headers.find(([header]) => header == 'Content-Disposition')
            const downloadUrl = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
                responseDisposition: disposition? disposition[1]: undefined
            })
            pipeline(s.right.pictureStream, fileStream, err => {
                if (err) {
                    res.status(500)
                } else {
                    res.send(downloadUrl)
                    res.status(200)
                }
                res.end()
            })
        } else {
            res.status(200)
            headers.forEach(([k, v]) => res.header(k, v))
            s.right.pictureStream.pipe(res)
        }

    }
});
