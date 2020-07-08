import * as firebase from '@firebase/testing';
import * as fs from 'fs';

function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
        throw new Error(
            `Expected 'val' to be defined, but received ${val}`
        );
    }
}

describe('Firestore rules', () => {
    const appNames = {testAppName:"", adminAppName:""}
    const projectName = "capturalcodingchallenge"
    const testObject = {key: "someValue"}
    beforeAll(async () => {
        const testAppName = firebase.initializeTestApp({
            projectId: projectName,
            auth: { uid: "alice", email: "alice@example.com" }
        }).name;
        const adminAppName = firebase.initializeAdminApp({
            projectId: projectName
        }).name;
        appNames.testAppName = testAppName
        appNames.adminAppName = adminAppName
        await firebase.loadFirestoreRules({
            projectId: projectName,
            rules: fs.readFileSync("../firestore.rules", "utf8")
        });
    });

    afterEach(async ()=>{
        await firebase.clearFirestoreData({
            projectId: projectName
        });
    })
    afterAll(async () => {
        (Object.keys(appNames) as Array<keyof typeof appNames>).forEach(k => appNames[k] = "")
        await Promise.all(firebase.apps().map(app => app.delete()))
    });
    
    it('should allow writing and reading own entries', async () => {
        const testApp = (await firebase.apps()).find(a=>a.name===appNames.testAppName);
        assertIsDefined(testApp);
        const db = testApp.firestore()
        await db.collection("users").doc("alice").collection("requests").add(testObject)
        const data = (await db.collection("users").doc("alice").collection("requests").get()).docs.map(d => d.data())
        expect(data).toEqual([testObject]);
    });

    it('should not allow reading private entries of others', async () => {
        const adminApp = (await firebase.apps()).find(a=>a.name===appNames.adminAppName);
        assertIsDefined(adminApp);
        const adminDb = adminApp.firestore()
        await adminDb.collection("users").doc("nonAlice").collection("requests").add(testObject)
        const adminData = (await adminDb.collection("users").doc("nonAlice").collection("requests").get()).docs.map(d => d.data())
        expect(adminData).toEqual([testObject]);
        
        const testApp = (await firebase.apps()).find(a=>a.name===appNames.testAppName);
        assertIsDefined(testApp);
        const testDb = testApp.firestore()
        firebase.assertFails(testDb.collection("users").doc("nonAlice").collection("requests").get())
    });

    it('should not allow creating private entries of others', async () => {
        const testApp = (await firebase.apps()).find(a=>a.name===appNames.testAppName);
        assertIsDefined(testApp);
        const db = testApp.firestore()
        firebase.assertFails(db.collection("users").doc("nonAlice").collection("requests").add(testObject))
    });
});
