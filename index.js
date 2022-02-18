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

const firebase_app = initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

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
            if (doc.data().crr_question !== null && doc.data().crr_question !== undefined) {
                console.log(doc.data());
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
                addQuestionDoc.id = quest.id;
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
            if (questAuthorId === senderRealId || questAuthorId === 'SYSTEM') isQuestAuthor = true;
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

            // console.log("Params : ", params);

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

                    qa_requesting_id: author_id,
                    queued_timestamp: Date.now()

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

        let ref = db.collection('meeting_rooms');
        let roomCollection = await ref.get();

        let rooms_list = []

        roomCollection.forEach(room => {
            // console.log(room.data(), room.id);
            let data = room.data();
            data.id = room.id;
            rooms_list.push(data);
        });

        res.render('meeting_rooms',
            {
                rooms_list: JSON.stringify(rooms_list),
                sender_id: JSON.stringify(senderMaskId)
            })


    })();
})

app.post('/meeting_rooms', (req, res) => {
    (async () => {

            console.log(req.body)

            if (req.body.action !== undefined) {
                console.log("hey");

                let data = JSON.parse(req.body.data)
                console.log(data)

                for (let pair in data.paired_users) {
                    for (let mask in pair) {
                        let ref = db.collection('global_vars').doc('masks')
                            .collection('users').doc(mask);
                        let senderId = (await ref.get()).id

                        bot.sendTextMessage(senderId, 'Bạn chuẩn bị tham gia phòng gặp mặt sau 15 phút nữa, dù muốn hay không')
                    }

                    for (let mask in data.remain_list.length) {
                        let ref = db.collection('global_vars').doc('masks')
                            .collection('users').doc(mask);
                        let senderId = (await ref.get()).id

                        bot.sendTextMessage(senderId, 'Bạn chuẩn bị tham gia phòng gặp mặt sau 15 phút nữa, dù muốn hay không')
                    }
                }

                res.send({error: 0})

                setTimeout(async function () {
                    for (let pair in data.paired_users) {
                        for (let mask in pair) {

                            ref = db.collection('global_vars').doc('masks').collection('users').doc(mask);
                            let senderId = (await ref.get()).id
                            let sender_ref = db.collection('users').doc(senderId);
                            let senderData = await sender_ref.get();


                            //Check nếu đang trong hàng đợi hoặc đã kết nối hoặc đang request
                            if (senderData.data().queued_timestamp === null
                                && senderData.data().crr_timestamp === null
                                && senderData.data().history_requesting_timestamp === null
                                && senderData.data().qa_requesting_id === null) {
                                return 0;
                            }

                            //Nếu đang kết nối
                            if (senderData.data().crr_timestamp !== null) {

                                //Hủy kết nối cho partner
                                await db.collection('users').doc(senderData.data().partner).set({
                                    partner: null,
                                    crr_timestamp: null,
                                    find_gender: null,
                                }, {merge: true});

                                await sendQuickReply(senderData.data().partner, 'Người kia đã thoát khỏi cuộc trò chuyện ' +
                                    'để tham gia phòng gặp mặt');
                            }

                            //Nếu đang request
                            if (senderData.data().history_requesting_timestamp !== null) {

                                //Hủy lời mời kết nối cho bản thân
                                await db.collection('users')
                                    .doc(senderId)
                                    .collection('history')
                                    .doc(senderData.data().history_requesting_timestamp.toString())
                                    .set({
                                        requested: false
                                    }, {merge: true});

                                //Query lấy psid người được request
                                let docRef = db.collection('users')
                                    .doc(senderId)
                                    .collection('history')
                                    .doc(senderData.data().history_requesting_timestamp.toString())

                                let docSnapHistory = await docRef.get();

                                //Hủy lời mời cho người được request
                                await db.collection('users')
                                    .doc(docSnapHistory.data().psid)
                                    .collection('history')
                                    .doc(docSnapHistory.id).set({
                                        requesting: false
                                    }, {merge: true});
                            }

                            //Reset
                            await db.collection('users').doc(senderId).set({
                                    partner: null,
                                    // nickname: null,
                                    history_requesting_timestamp: null,
                                    history_requesting_id: null,
                                    crr_timestamp: null,
                                    find_gender: null,
                                    queued_timestamp: null,
                                    qa_requesting_id: null,
                                    crr_meeting_room: null
                                }, {merge: true}
                            );

                            //Xóa queue
                            await db.collection('global_vars').doc('queue').set({
                                queue_list: FieldValue.arrayRemove(senderId)
                            }, {merge: true});
                        }

                        await joinInRoom(pair[0], pair[1])
                    }

                    for (let i = 0; i < data.remain_list.length; i += 2) {
                        await joinInRoom(data.remain_list[i], data.remain_list[i + 1])
                    }
                }, 15 * 60 * 1000);

                return;
            }

            let params = req.body.data;
            let senderMaskId = params.id;
            // console.log(params);

            // console.log("Params : ", params);

            if (senderMaskId === undefined) {
                console.log('nope')
                res.send({error: 1})
                return 0;
            }

            let ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
            let doc = await ref.get();

            // console.log("hey", doc.data());

            if (!doc.exists) {
                console.log("User not found");
                res.send({error: 1})
                return 0;
            }

            let senderId = doc.data().id;

            ref = db.collection('users').doc(senderId);
            let senderData = await ref.get();

            if (isNaN(params.room_participants_number) || 122 < params.room_participants_number || params.room_participants_number < 4 || params.room_participants_number % 2 !== 0) {
                res.send({error: 3})
                return
            }

            await db.collection('meeting_rooms').add({
                name: params.room_name,
                description: params.room_description,
                participants_number: params.room_participants_number,
                author: senderId,
                author_nickname: senderData.data().nickname,
                timestamp: Date.now(),
                crr_participants: 0
            })

            res.send({error: 0})


        }
    )();
})

async function sendQuickReply(senderId, text) {
    try {
        await request({
            url: 'https://graph.facebook.com/v12.0/me/messages',
            qs: {
                access_token: FB_pageToken,
            },
            method: 'POST',
            json: {
                "recipient": {
                    "id": senderId,
                },
                "messaging_type": "RESPONSE",
                "message": {
                    "text": text,
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "Tìm kiếm",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons-for-free.com/iconfiles/png/512/search-131964753234672616.png"
                        },
                        {
                            "content_type": "text",
                            "title": "Tìm nam",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Male-icon.png"
                        }, {
                            "content_type": "text",
                            "title": "Tìm nữ",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-7/512/Female-icon.png"
                        }, {
                            "content_type": "text",
                            "title": "Lệnh",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://image.flaticon.com/icons/png/512/59/59130.png"
                        }, {
                            "content_type": "text",
                            "title": "Hồ sơ",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://cdn.iconscout.com/icon/free/png-256/profile-417-1163876.png"
                        }, {
                            "content_type": "text",
                            "title": "Tìm kiếm nâng cao",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://static.thenounproject.com/png/2161054-200.png"
                        }, {
                            "content_type": "text",
                            "title": "Tìm câu hỏi",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://icon-library.com/images/question-icon/question-icon-0.jpg"
                        }, {
                            "content_type": "text",
                            "title": "Câu hỏi của tôi",
                            "payload": "RANDOM_PAYLOAD",
                            "image_url": "https://i.imgur.com/YwjvVyv.png"
                        },
                    ]
                }
            }
        });
    } catch (e) {
        console.log("Error at sendQuickReply : ", e);
    }
}

async function joinInRoom(senderId, gettedId) {
    let timestamp = Date.now();

    await db.collection('users').doc(senderId).set({
        partner: gettedId,
        history_requesting_timestamp: null,
        history_requesting_id: null,
        crr_timestamp: timestamp,
        last_connect: gettedId,
        queued_timestamp: null,
        find_gender: null,
        qa_requesting_id: null,
    }, {merge: true});

    let docRef = db.collection('users').doc(gettedId);
    let docSnap = await docRef.get();

    await db.collection('users', senderId, 'history').doc(timestamp.toString()).set({
        timestamp: timestamp,
        psid: gettedId,
        tags: null,
        nickname: docSnap.data().nickname,
        set_nickname: null,
        fb_link: null,
        img: null,
        requested: false,
        requesting: false,
    }, {merge: true});

    await db.collection('users').doc(gettedId).set({
        partner: senderId,
        history_requesting_timestamp: null,
        history_requesting_id: null,
        crr_timestamp: timestamp,
        last_connect: senderId,
        queued_timestamp: null,
        find_gender: null,
        qa_requesting_id: null,

    }, {merge: true});

    docRef = db.collection('users').doc(senderId);
    docSnap = await docRef.get();

    await db.collection('users').doc(gettedId).collection('history')
        .doc(timestamp.toString()).set({
            timestamp: timestamp,
            psid: senderId,
            tags: null,
            nickname: docSnap.data().nickname,
            set_nickname: null,
            fb_link: null,
            img: null,
            requested: false,
            requesting: false,
        }, {merge: true});

    await bot.sendTextMessage(senderId, 'Bạn đã được kết nối. Nói lời chào với người bạn mới đi nào');
    await bot.sendTextMessage(gettedId, 'Bạn đã được kết nối. Nói lời chào với người bạn mới đi nào');

}