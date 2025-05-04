import { app } from "@/firebase";
import { collection, addDoc, getDoc, getDocs, setDoc, updateDoc, doc, query, where, orderBy, deleteDoc, limit, startAt, endAt, and, onSnapshot } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
/*eslint-disable*/

export const db = getFirestore(app),
discussionsColl = collection(db, 'Discussions');
export const repliesColl = collection(db, 'Replies');
export const usersColl = collection(db, 'users');
const notifColl = collection(db, 'notifications');
const activityColl = collection(db, 'Activities');

let discussionDocument = (discussionId) => doc(discussionsColl, discussionId);

let userDocument = (userId) => doc(usersColl, userId);

let notificationDocument = (notificationId) => doc(notifColl, notificationId);

export async function addNewDiscussion(discussion) {
    try {
        const newDiscussion = await addDoc(discussionsColl, discussion);
        return {'id': newDiscussion.id, 'status': true};
    } catch (error){
        return {'error': "Error when adding a new discussion: " + error, 'status': false};
    }
}

export async function getDiscussionById(discussionID) {
    const discussionDoc = discussionDocument(discussionID);

    const discussionShot = await getDoc(discussionDoc);

    if(discussionShot.exists()) {
        const discussion = discussionShot.data();
        return {'discussion': discussion, 'status': true};
    } else {
        return {'error': "Discussion doesn't exist.", 'status': false};
    }
}

export async function modifyDiscussion(discussionID, newDisc) {
    const discussionDoc = discussionDocument(discussionID);

    try{
        await updateDoc(discussionDoc, newDisc);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when modifying the discussion: " + error, 'status': false};
    }
}

export async function delDiscussion(discussionID) {
    const discussionDoc = discussionDocument(discussionID);

    try{
        const replies = await queriyngRepliesForMssg(discussionID);
        for (let doc of replies) {
            const repDel = await delReply(doc.id);
            if (!repDel.status) {
                throw new Error("Can't delete reply.");
            }
        }
        await deleteDoc(discussionDoc);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when deleting the discussion: " + error, 'status': false};
    }
}


let replyDocument = (replyID) => {
    const replyPath = "Replies/" + replyID;
    return doc(db, replyPath);
}

export async function addNewReply(reply) {
    try {
        const newReply = await addDoc(repliesColl, reply);
        return {'id': newReply.id, 'status': true};
    } catch (error){
        return {'error': "Error when adding a new Reply: " + error, 'status': false};
    }
}

export async function getReplyById(replyID) {
    const replyDoc = replyDocument(replyID);

    const replyShot = await getDoc(replyDoc);

    if(replyShot.exists()) {
        const reply = replyShot.data();
        return {'reply': reply, 'status': true};
    } else {
        return {'error': "Reply doesn't exist.", 'status': false};
    }
}

export async function modifyReply(replyID, newReply) {
    const replyDoc = replyDocument(replyID);

    try{
        await updateDoc(replyDoc, newReply);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when modifying the reply: " + error, 'status': false};
    }
}

export async function delReply(replyID) {
    const replyDoc = replyDocument(replyID);

    try{
        const replies = await queriyngRepliesForMssg(replyID, );
        for (let doc of replies) {
            const repDel = await delReply(doc.id);
            if (!repDel.status) {
                throw new Error("Can't delete reply.");
            }
        }
        await deleteDoc(replyDoc);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when deleting the reply: " + error, 'status': false};
    }
}

export async function queriyngRepliesForMssg(mssgID) {
    const repliesQuery = query(
        repliesColl,
        where('replyToID', '==' ,mssgID),
        orderBy('upvotes', "desc")
    );

    const querySnapshot = await getDocs(repliesQuery);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}



export async function queryingDiscussion(order) {
    const discQuery = query(
        discussionsColl,
        orderBy(order, "desc")
    );

    const querySnapshot = await getDocs(discQuery);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}

export async function addNewUser(userID, user) {
    try {
        await setDoc(userDocument(userID), user);
    } catch (error) {
        throw new Error(error);
    }
    
}

export async function getUserById(userID) {
    const userDoc = userDocument(userID);

    const userShot = await getDoc(userDoc);

    if(userShot.exists()) {
        const user = userShot.data();
        return {'user': user, 'status': true};
    } else {
        return {'error': "User doesn't exist.", 'status': false};
    }
}

export async function updateUserDoc(userID, data) {
    const userDoc = userDocument(userID);

    try {
        const res = await updateDoc(userDoc, data);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when updating the user: " + error, 'status': false};
    }
}

export async function queryingUsersByName(name, userUID) {
    if (name.length == 0) {
        return [];
    }

    const userQuery = query(
        usersColl,
        orderBy("name"),
        startAt(name),
        endAt(name + '\uf8ff'),
        where("userUID", "!=", userUID),
        limit(10)
    );

    const querySnapshot = await getDocs(userQuery);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}

export async function fetchReportedDiscussion(l) {
    const ContentQ = query(
        discussionsColl,
        where("reportTimes", ">=", l),
        orderBy("reportTimes"),
    );

    const querySnapshot = await getDocs(ContentQ);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}

export async function fetchReportedReplies(l) {
    const ContentQ = query(
        repliesColl,
        where("reportTimes", ">=", l),
        orderBy("reportTimes"),
    );

    const querySnapshot = await getDocs(ContentQ);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}

export async function addNewNotification(notification) {
    try {
        const newDiscussion = await addDoc(notifColl, notification);
        return {'status': true};
    } catch (error){
        return {'error': "Error when sending notification: " + error, 'status': false};
    }
}

export async function getNumOfNotifications(userUID, notificationRef) {
    const notifiQ = query(
        notifColl,
        and(
            where('visited', '==', false),
            where('userUID', '==', userUID),
        ),
    );

    onSnapshot(notifiQ, (querySnapshot) => {
        notificationRef.value = querySnapshot.size;
    });
}

export async function getNotifications(userUID, notificationRef) {
    const notifiQ = query(
        notifColl,
        where('userUID', '==', userUID),
        orderBy('visited', 'asc'),
        orderBy('sendDate', 'desc'),
    );

    onSnapshot(notifiQ, (querySnapshot) => {
        notificationRef.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log(notificationRef.value);
    });
}

export async function updateNotification(notificationID, data) {
    const notiDoc = notificationDocument(notificationID);

    try {
        const res = await updateDoc(notiDoc, data);
        return {'status': true};
    } catch (error) {
        return {'error': "Error when updating the notification: " + error, 'status': false};
    }
}

export async function addNewActivity(activity) {
    try {
        const newDiscussion = await addDoc(activityColl, activity);
        return {'status': true};
    } catch (error){
        return {'error': "Error when sending notification: " + error, 'status': false};
    }
}


/*
export async function getAdminsOfDiscussion(DiscID, userUID) {
    const usersQuery = query(
        usersColl,
        and(
            where("userUID", "!=", userUID),
            where("priviliges", "array-contains", DiscID),
        ),
        orderBy("name")
    );
    const querySnapshot = await getDocs(usersQuery);
    const AllDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return AllDocs;
}
*/