const {initializeApp, applicationDefault, cert} = require('firebase-admin/app');
const {getFirestore, Timestamp, FieldValue} = require('firebase-admin/firestore');
const MessengerPlatform = require('facebook-bot-messenger');
const request = require('request');
// require('dotenv').config()

// Imports
const express = require('express')
const app = express()
var server = require('http').createServer(app);
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies

const
    FB_pageId = process.env.FB_pageId,
    FB_appId = process.env.FB_appId,
    FB_appSecret = process.env.FB_appSecret,
    FB_validationToken = process.env.FB_validationToken,
    FB_pageToken = process.env.FB_pageToken;

var bot = MessengerPlatform.create({
    pageID: FB_pageId,
    appID: FB_appId,
    appSecret: FB_appSecret,
    validationToken: FB_validationToken,
    pageToken: FB_pageToken
}, server);

const tag_list = {
    'Bóng đá': {
        img: 'https://nypost.com/wp-content/uploads/sites/2/2020/02/soccer-ball.jpg?quality=80&strip=all',
        description: 'Đá bóng thú vị abc xyz'
    },
    'Bóng rổ': {
        img: 'https://res.cloudinary.com/grohealth/image/upload/f_auto,fl_lossy,q_auto/v1581678662/DCUK/Content/iStock-959080376.jpg',
        description: 'Bóng và rổ'
    },
    'LOL': {
        img: 'https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_LeagueofLegends_RiotGames_S1_2560x1440-ee500721c06da3ec1e5535a88588c77f',
        description: 'Đừng'
    },
    'Tốc Chiến': {
        img: 'https://kenh14cdn.com/thumb_w/660/203336854389633024/2021/5/6/photo-1-16203008157591628679888.jpg',
        description: 'Đừng'
    },
    'Valorant': {
        img: 'https://cdn.tgdd.vn/Files/2020/04/17/1249881/valorant-2_800x450.jpg',
        description: 'Valorant'
    },
    'Arcade': {
        img: 'https://media.pocketgamer.com/artwork/ra-84589-1606309331/pgcom-highlight-top12-arcade-games-android-1010x505.jpg',
        description: 'yo'
    },
    'EDM': {
        img: 'https://tuoitrechinhphuc.com/wp-content/uploads/2020/12/edm-la-gi-696x392-1.jpg',
        description: 'yo'
    },
    'Netflix': {
        img: 'https://invest7979.com/wp-content/uploads/2021/12/20211227-netflix-da-thay-doi-nganh-giai-tri-toan-cau-nhu-the-nao-1.jpg',
        description: 'yo'
    },
    'Anime': {
        img: 'https://i.pinimg.com/originals/ed/bc/3a/edbc3a7338293dbcc034ce5ee15c99f4.png',
        description: 'yo'
    },

}

// Listen on Port 5000
app.listen(process.env.PORT || 3000);

// Static Files
app.use(express.static('./'));

// Example for other olders
// app.use('/css', express.static(__dirname + 'public/css'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

const serviceAccount = JSON.parse(process.env.FIREBASE_serviceAccount)

// const fs = require('fs');
//
// fs.appendFile('.env', JSON.stringify(serviceAccount), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// });

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// (async () => {
//     let senderId = '4007404939324313';
//     let senderData = await db.collection('users').doc(senderId).get();
//
//     let quest = await db.collection('questions')
//         .where('id', 'in', [0, 1, 2, 3])
//         .get()
//
//     quest.forEach(doc => {
//         console.log(doc.id, '=>', doc.data());
//     });
//
// })();

// Navigation
app.get('/advance_search', (req, res) => {
    (async () => {
        let maskId = req.query.id;
        if (maskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
        let doc = await ref.get();

        if (!doc.exists) {
            console.log("Tags sender id not found");
            res.send("Bruh");
        } else {
            let senderId = doc.data().id;
            if (senderId === undefined) {
                console.log('nope')
                res.send("Wha");
                return;
            }
            // console.log(senderId);
            ref = db.collection('users').doc(senderId);
            doc = await ref.get();

            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)
            res.render('advance_search',
                {
                    text: 'hey',
                    senderData: JSON.stringify(doc.data()),
                    tag_list: JSON.stringify(tag_list),
                    senderId: JSON.stringify(maskId)
                })
        }
    })();
})

app.post('/advance_search', (req, res) => {
    (async () => {

        let params = req.body;
        let maskId = params.senderId;
        if (maskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
        let doc = await ref.get();

        if (!doc.exists) {
            console.log("User not found");
            res.send("Bruh");
        } else {
            let senderId = doc.data().id;
            // console.log(params);
            const ref = db.collection('users').doc(senderId);
            const res = await ref.set({
                find_tags: params.find_tags,
                age_range: params.age_range,
                exclude_last_connected: params.exclude_last_connected,
                find_gender: params.find_gender
            }, {merge: true});
        }

    })();
})

// Navigation
app.get('/profile', (req, res) => {
    (async () => {
        let maskId = req.query.id;
        if (maskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
        let doc = await ref.get();

        if (!doc.exists) {
            console.log("Tags sender id not found");
            res.send("Bruh");
        } else {
            let senderId = doc.data().id;
            if (senderId === undefined) {
                console.log('nope')
                res.send("Wha");
                return;
            }
            // console.log(senderId);
            ref = db.collection('users').doc(senderId);
            doc = await ref.get();

            let questdoc;
            if (doc.data().crr_question !== null) {
                ref = db.collection('questions').doc(doc.data().crr_question);
                questdoc = (await ref.get()).data();
            } else questdoc = null;

            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)
            // console.log(questdoc);

            res.render('profile',
                {
                    text: 'hey',
                    senderData: JSON.stringify(doc.data()),
                    questData: JSON.stringify(questdoc),
                    tag_list: JSON.stringify(tag_list),
                    senderId: JSON.stringify(maskId)
                })
        }
    })();
})

app.post('/profile', (req, res) => {
    (async () => {

        let params = req.body.data;
        let maskId = params.senderId;
        if (maskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
        let doc = await ref.get();

        if (!doc.exists) {
            console.log("User not found");
            res.send("Bruh");
        } else {
            let senderId = doc.data().id;
            // console.log(params);
            let ref = db.collection('users').doc(senderId);
            await ref.set({
                tags: params.tags,
                age: params.age,
                nickname: params.nickname,
                fb_link: params.fb_link,
                gender: params.gender,
            }, {merge: true});

            if (params.answer !== '') {
                let senderData = await ref.get();
                if (senderData.data().crr_question === null) return;
                ref = db.collection('questions').doc(senderData.data().crr_question).collection('answers');
                await ref.add({
                    text: params.answer,
                    author: params.nickname,
                    author_id: senderId,
                    timestamp: params.timestamp
                });

                ref = db.collection('users').doc(senderId);
                await ref.set({
                    crr_question: null,
                    answered_questions: FieldValue.arrayUnion(senderData.data().crr_question)
                }, {merge: true});

                ref = db.collection('questions').doc(senderData.data().crr_question);
                let answers_count = (await ref.get()).data().answers_count;
                await ref.set({
                    answers_count: answers_count + 1
                }, {merge: true});

                let questMaskId = (await ref.get()).data().mask_id

                let link = 'https://lqdchatventure-web.herokuapp.com/ans?id=' + questMaskId +
                    '&senderId=' + maskId;

                let elements = [{
                    'title': 'Câu hỏi của bạn đã được ghi lại',
                    'default_action': {
                        'type': 'web_url',
                        'url': link,
                        'webview_height_ratio': 'full',
                    },
                    'buttons': [
                        {
                            'type': 'web_url',
                            'url': link,
                            'title': 'Các câu trả lời khác'
                        }
                    ]
                }];
                await sendList(senderId, elements);
            }

        }

    })();
})

// Navigation
app.get('/quest', (req, res) => {
    (async () => {
            let maskId = req.query.id;
            if (maskId === undefined) {
                console.log('nope')
                res.send("Wha");
                return;
            }

            let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
            let doc = await ref.get();

            if (!doc.exists) {
                console.log("User not found");
                res.send("Bruh");
                return
            }

            let senderId = doc.data().id;

            // console.log(senderId);
            ref = db.collection('users').doc(senderId)
            doc = await ref.get();

            let questions_list = [];

            // console.log(doc.data());

            let questCollection = await db.collection('questions')
                .where('author_id', '==', senderId)
                .orderBy('timestamp', 'desc')
                .get();

            questCollection.forEach(quest => {
                // console.log(quest.id, '=>', quest.data());
                let addQuestionDoc = quest.data();
                addQuestionDoc.mask_sender_id = maskId;
                questions_list.push(addQuestionDoc)
            });

            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)
            res.render('quest',
                {
                    text: 'hey',
                    questions_list: JSON.stringify(questions_list),
                })

        }
    )();
})

// Navigation
app.get('/answered', (req, res) => {
    (async () => {
        let maskId = req.query.id;
        if (maskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(maskId);
        let doc = await ref.get();

        if (!doc.exists) {
            console.log("User not found");
            res.send("Bruh");
            return;
        }

        let senderId = doc.data().id;

        // console.log(senderId);
        ref = db.collection('users').doc(senderId)
        doc = await ref.get();

        let questions_list = [];

        let questCollection = await db.collection('questions')
            .where('answered_users', 'array-contains', senderId)
            .get();

        for (let quest in questCollection.docs) {
            let addQuestionDoc = questCollection.docs[quest].data();
            addQuestionDoc.mask_sender_id = maskId;
            addQuestionDoc.id = questCollection.docs[quest].id;
            questions_list.push(addQuestionDoc)
        }

        // console.log('Document data:', doc.data());
        // console.log(doc.data().tags, doc.data().find_tags)
        res.render('answered',
            {
                text: 'hey',
                questions_list: JSON.stringify(questions_list),
            })

    })();
})

// Navigation
app.get('/ans', (req, res) => {
    (async () => {
            let questId = req.query.questId;
            let senderMaskId = req.query.id;
            // console.log(req.query);
            if (questId === undefined || senderMaskId === undefined) {
                console.log('nope')
                res.send("Wha");
                return;
            }

            let ref = db.collection('questions').doc(questId);
            let docQuest = await ref.get();

            if (!docQuest.exists) {
                res.send("Bruh");
                return
            }

            // console.log(senderId);

            ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
            let docUserMask = await ref.get();

            if (!docUserMask.exists) {
                res.send("Bruh2");
                return;
            }

            let senderRealId = docUserMask.data().id;

            ref = db.collection('questions').doc(questId);
            let snapShot = await ref.get();
            let question = snapShot.data().text;

            let questAuthorId = snapShot.data().author_id;
            let isQuestAuthor = false;
            if (questAuthorId === senderRealId) isQuestAuthor = true;
            // console.log(questAuthorId, senderRealId);

            ref = db.collection('questions').doc(questId).collection("answers");
            snapShot = await ref.get();

            let answers_list = [];
            snapShot.forEach(doc => {
                let answerData = doc.data();
                answerData.isAnsAuthor = doc.data().author_id === senderRealId;
                answerData.id = doc.id;
                answers_list.push(
                    answerData
                );
            });
            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)

            res.render('ans',
                {
                    text: 'hey',
                    question: JSON.stringify(question),
                    answers_list: JSON.stringify(answers_list),
                    sender_id: JSON.stringify(senderMaskId),
                    quest_id: JSON.stringify(questId),
                    isQuestAuthor: JSON.stringify(isQuestAuthor)
                })


        }
    )();
})

app.post('/ans', (req, res) => {
    (async () => {

            let params = req.body;
            let senderMaskId = params.sender_id;
            let questId = params.quest_id;
            let ansId = params.ans_id;

            console.log("Params : ", params);

            if (senderMaskId === undefined || questId === undefined) {
                console.log('nope')
                res.send("Wha");
                return;
            }

            let ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
            let doc = await ref.get();

            if (!doc.exists) {
                console.log("User not found");
                res.send("Bruh");
                return;
            }

            let senderId = doc.data().id;

            // console.log("hey", doc.data());

            ref = db.collection('global_vars').doc('masks').collection('questions').doc(questId);
            doc = await ref.get();

            if (params.type === 'a')
                ref = db.collection('questions').doc(questId).collection("answers").doc(ansId);
            else
                ref = db.collection('questions').doc(questId);


            doc = await ref.get();
            let author_id = doc.data().author_id;

            ref = db.collection('users').doc(senderId);
            doc = await ref.get();

            if (doc.data().qa_requesting_id !== null || doc.data().crr_timestamp !== null
                || doc.data().queued_timestamp !== null || doc.data().history_requesting_id) {
                bot.sendTextMessage(senderId, "Bạn đang yêu cầu hoặc kết nối với người khác")
            } else if (author_id === senderId) {
                bot.sendTextMessage(senderId, "Đấy là bạn");
            } else {

                await db.collection("global_vars").doc("queue").set({

                    queue_list: FieldValue.arrayUnion(senderId)

                }, {merge: true});

                await db.collection('users').doc(senderId).set({

                    qa_requesting_id: author_id

                }, {merge: true});

                let elements = [{
                    "title": 'Có người dùng muốn kết nối với bạn',
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Đồng ý kết nối",
                            "payload": "QA_ACCEPT_REQUEST_PAYLOAD " + senderId
                        },
                        {
                            "type": "postback",
                            "title": "Từ chối yêu cầu",
                            "payload": "QA_REJECT_REQUEST_PAYLOAD " + senderId
                        }
                    ]
                }];
                sendList(author_id, elements);

                elements = [{
                    "title": 'Bạn đã yêu cầu kết nối với người dùng',
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Hủy kết nối",
                            "payload": "QA_REMOVE_REQUEST_PAYLOAD " + author_id
                        }
                    ]
                }];

                sendList(senderId, elements);

            }


        }
    )();
})

function sendList(senderID, elements) {
    request({
        url: "https://graph.facebook.com/v12.0/me/messages",
        qs: {
            access_token: "EAAshcZC1o1R0BABaRWFHOBFcmQqOrXqaBU71hl5HLxbSWHYIB4Y83sHWqH00ewhkNkDPnw9JKfJlwZCrBZAmJk5Jqzw7wZCDzasncotQIsfoLjGnCElfZC2IhYGoDQmMfiXCjtnDx6afJd3LBGOr4rUQ6HPL3DZBKyKP0QRGEWN9pHLLoCOlNyhilIL7b1Ou1eMGt04QFNnAZDZD",
        },
        method: "POST",
        json: {
            "recipient": {
                "id": senderID
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements
                    }
                }
            }
        }
    });
}

// Navigation
app.get('/meeting_rooms', (req, res) => {
    (async () => {
        let senderMaskId = req.query.id;
        if (senderMaskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('meeting_rooms').collection('rooms');
        let roomCollection = await ref.get();

        // console.log("Doc data : ", doc.data());

        let rooms_list = []

        roomCollection.forEach(room => {
            let data = room.data();
            data.id = room.id;
            rooms_list.push(room.data());
        });

        // console.log(senderId);

        res.render('meeting_rooms',
            {
                rooms_list: JSON.stringify(rooms_list),
                sender_id: JSON.stringify(senderMaskId)
            })


    })();
})

app.post('/meeting_rooms', (req, res) => {
    (async () => {

        let params = req.body;
        let senderMaskId = params.sender_id;

        console.log("Params : ", params);

        if (senderMaskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
        let doc = await ref.get();

        // console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send("Bruh");
            return;
        }

        let senderId = doc.data().id;

        ref = db.collection('users').doc(senderId);
        let senderData = await ref.get();

        if (params.room_id !== undefined) {

            let meetingRoomId = params.room_id;

            if (senderData.data().crr_meeting_room !== null) {
                bot.sendTextMessage(senderId, "Bạn đang ở trong phòng họp khác")
                res.send({error: 1})
                return;
            }

            await ref.set({
                crr_meeting_room: meetingRoomId
            }, {merge: true})

            bot.sendTextMessage(senderId, "Bạn đã đăng ký tham gia phòng thành công");

        } else {

        }
    })();
})