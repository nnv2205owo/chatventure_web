const {initializeApp, applicationDefault, cert} = require('firebase-admin/app');
const {getFirestore, Timestamp, FieldValue, FieldPath} = require('firebase-admin/firestore');
const MessengerPlatform = require('facebook-bot-messenger');
const request = require('request');
// require('dotenv').config()

// Imports
const express = require('express')
const app = express()

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies

const
    FB_pageId = process.env.FB_pageId,
    FB_appId = process.env.FB_appId,
    FB_appSecret = process.env.FB_appSecret,
    FB_validationToken = process.env.FB_validationToken,
    FB_pageToken = process.env.FB_pageToken;


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

// Static Files
app.use(express.static('./'));

// Example for other olders
// app.use('/css', express.static(__dirname + 'public/css'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

var server = require('http').createServer(app);

var bot = MessengerPlatform.create({
    pageID: FB_pageId,
    appID: FB_appId,
    appSecret: FB_appSecret,
    validationToken: FB_validationToken,
    pageToken: FB_pageToken
}, server);

const {Server} = require("socket.io");
const io = new Server(server);


server.listen(process.env.PORT || 3000);


// io.on('connection', socket => {
//     console.log("New user connected")
// })

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

app.get('/', (req, res) => {
    res.render('index')
})

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
                await sendList(author_id, elements);

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

                await sendList(senderId, elements);

            }
        }
    )();
})

app.get('/countdown_timer', (req, res) => {
    res.render('countdown_timer')
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

        let userRef = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
        let doc = await userRef.get();

        // console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send('really?')
            return 0;
        }

        let senderId = doc.data().id;

        userRef = db.collection('users').doc(senderId);
        let senderData = await userRef.get();

        let ref = db.collection('game_rooms');
        let roomCollection = await ref.orderBy('timestamp', 'desc').get();

        let rooms_list = []

        roomCollection.forEach(room => {
            // console.log(room.data(), room.id);
            let data = room.data();
            data.id = room.id;

            data.isAuthor = data.author === senderMaskId;

            if (data.id === senderData.data().crr_meeting_room) {
                data.joined = true;
                rooms_list.unshift(data)
            } else {
                data.joined = false;
                rooms_list.push(data);
            }

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

            // console.log(req.body)

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

            if (params.room_id !== undefined) {
                let ref = db.collection('meeting_rooms').doc(params.room_id);
                let doc = await ref.get();
                if (!doc.exists) {
                    res.send({error: 5});
                    return
                }

                let room_data = doc.data()
                if (room_data.password !== params.room_password) {
                    // console.log(room_data, params.room_password)
                    res.send({error: 4})
                    return
                }

                res.send({
                    error: 6,
                    url: "https://share.streamlit.io/nnv2205owo/chatventure_matchmaker/main/main.py" +
                        "?id=" + senderMaskId + "&room_id=" + params.room_id
                })

                await ref.set({
                    authenticated_users: FieldValue.arrayUnion(senderMaskId)
                }, {merge: true})

                res.send({error: 0})

                return;
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
                author: senderMaskId,
                author_nickname: senderData.data().nickname,
                timestamp: Date.now(),
                authenticated_users: [senderMaskId],
                password: params.room_password,
                crr_participants: 0
            })

            res.send({error: 0})

        }
    )();
})

// Navigation
app.get('/game_rooms', (req, res) => {
    (async () => {
        let senderMaskId = req.query.id;
        if (senderMaskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let userRef = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
        let doc = await userRef.get();

        // console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send('really?')
            return 0;
        }

        let senderId = doc.data().id;

        userRef = db.collection('users').doc(senderId);
        let senderData = await userRef.get();

        let ref = db.collection('game_rooms');
        let roomCollection = await ref.orderBy('timestamp', 'desc').get();

        let rooms_list = []

        roomCollection.forEach(room => {
            // console.log(room.data(), room.id);
            let data = room.data();
            data.id = room.id;

            data.isAuthor = data.author === senderMaskId;

            if (data.id === senderData.data().crr_game_room) {
                data.joined = true;
                rooms_list.unshift(data)
            } else {
                data.joined = false;
                rooms_list.push(data);
            }

            // console.log(senderData.data())
            // console.log(data)

        });

        res.render('game_rooms',
            {
                rooms_list: JSON.stringify(rooms_list),
                sender_id: JSON.stringify(senderMaskId)
            })


    })();
})

app.post('/game_rooms', (req, res) => {
    (async () => {

            let params = req.body.data;
            let senderMaskId = params.id;
            // console.log(params);

            // console.log("Params : ", params);

            if (senderMaskId === undefined) {
                console.log('nope')
                res.send({error: 1})
                return 0;
            }

            let userRef = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
            let doc = await userRef.get();

            // console.log("hey", doc.data());

            if (!doc.exists) {
                console.log("User not found");
                res.send({error: 1})
                return 0;
            }

            let senderId = doc.data().id;

            userRef = db.collection('users').doc(senderId);
            let senderData = await userRef.get();


            if (params.action === 'join') {
                let ref = db.collection('game_rooms').doc(params.room_id);
                let doc = await ref.get();
                if (!doc.exists) {
                    res.send({error: 5});
                    return
                }

                let room_data = doc.data()
                if (room_data.password !== params.room_password) {
                    // console.log(room_data, params.room_password)
                    res.send({error: 4});
                    return
                }

                if (room_data.crr_participants === room_data.participants_number) {
                    res.send({error: 8});
                    return
                }

                if (senderData.data().crr_game_room !== null && senderData.data().crr_game_room !== undefined) {
                    let crrGame = await db.collection('game_rooms').doc(senderData.data().crr_game_room).get();
                    if (crrGame.data().crr_participants === crrGame.data().participants_number) {
                        res.send({error: 9});
                        return;
                    }

                    await db.collection('game_rooms').doc(senderData.data().crr_game_room).set({
                        crr_participants: FieldValue.increment(-1),
                    }, {merge: true});
                }

                await ref.set({
                    crr_participants: FieldValue.increment(1),
                }, {merge: true});

                params.nickname = params.nickname.trim();
                params.realname = params.realname.trim();

                let checkName = await db.collection('game_rooms').doc(params.room_id).collection('players')
                    .where('game_nickname', '==', params.nickname)
                    .where('game_realname', '==', params.realname).get();

                if (!checkName.empty) {
                    res.send({error: 10});
                    return;
                }

                await userRef.set({
                    crr_game_room: params.room_id,
                    game_nickname: params.nickname,
                    game_realname: params.realname
                }, {merge: true})

                if (room_data.crr_participants === room_data.participants_number - 1) {

                    let roomPlayerCollection = await db.collection('users')
                        .where('crr_game_room', '==', params.room_id)
                        .get();

                    let realnames_list = [];

                    roomPlayerCollection.forEach(player => {
                        // console.log(quest.id, '=>', quest.data());
                        (async () => {
                            let elements = [{
                                "title": 'Phòng game của bạn đã bắt đầu',
                                "buttons": [
                                    {
                                        'type': 'web_url',
                                        'url': 'http://lqdchatventure-web.herokuapp.com/game' +
                                            '?id=' + senderMaskId + '&game_id=' + params.room_id,
                                        'webview_height_ratio': 'full',
                                    }
                                ]
                            }];

                            await sendList(player.id, elements)

                            realnames_list.push(player.data().game_realname);
                        })();
                    });

                    let id = 0;

                    roomPlayerCollection.forEach(player => {
                        // console.log(quest.id, '=>', quest.data());
                        (async () => {
                            await db.collection('game_rooms').doc(params.room_id)
                                .collection('players').doc(player.data().mask_id).set({
                                    nickname: player.data().game_nickname,
                                    realname: player.data().game_realname,
                                    options: realnames_list,
                                    selected: false,
                                    right_guessed: 0,
                                    wrong_guessed: 0,
                                    id: player.id
                                }, {merge: true});
                        })();
                    });

                }

                res.send({error: 0})
                return;
            }

            if (params.action === 'out') {
                let ref = db.collection('game_rooms').doc(params.room_id);
                let doc = await ref.get();
                if (!doc.exists) {
                    res.send({error: 5});
                    return
                }

                if (senderData.data().crr_game_room !== params.room_id) {
                    res.send({error: 6})
                    return;
                }

                await db.collection('game_rooms').doc(params.room_id).set({
                    crr_participants: FieldValue.increment(-1),
                }, {merge: true})

                await userRef.set({
                    crr_game_room: null,
                    game_nickname: null,
                    game_realname: null
                }, {merge: true})

                res.send({error: 0})
                return;
            }

            if (params.action === 'remove') {
                let ref = db.collection('game_rooms').doc(params.room_id);
                let doc = await ref.get();
                if (!doc.exists) {
                    res.send({error: 5});
                    return
                }

                let room_data = await ref.get();

                // console.log(room_data.data().author, params.id)

                if (room_data.data().author !== params.id) {
                    res.send({error: 7})
                    return;
                }

                let roomPlayerCollection = await db.collection('users')
                    .where('crr_game_room', '==', params.room_id)
                    .get();

                roomPlayerCollection.forEach(player => {
                    // console.log(quest.id, '=>', quest.data());
                    (async () => {
                        await bot.sendTextMessage(player.id, 'Phòng game hiện tại bạn đang tham gia đã bị xóa')
                        await db.collection('users').doc(player.id).set({
                            crr_game_room: null,
                            game_nickname: null,
                            game_realname: null
                        }, {merge: true});
                    })();
                });

                await db.collection('game_rooms').doc(params.room_id).delete()

                res.send({error: 0})
                return;
            }

            if (isNaN(params.room_participants_number) || 22 < params.room_participants_number || params.room_participants_number < 3) {
                res.send({error: 3})
                return
            }

            await db.collection('game_rooms').add({
                name: params.room_name,
                description: params.room_description,
                participants_number: params.room_participants_number,
                author: senderMaskId,
                author_nickname: senderData.data().nickname,
                timestamp: Date.now(),
                password: params.room_password,
                crr_participants: 0,
                guessed_players: 0,
                selected_quests: [],
                selected_players: [],
                last_event: null,
                last_event_type: null,
                end: false
            })

            res.send({error: 0})

        }
    )();
})

// Navigation
app.get('/game', (req, res) => {
    (async () => {
        let senderMaskId = req.query.id;
        let gameId = req.query.game_id;

        if (senderMaskId === undefined || gameId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let userRef = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
        let doc = await userRef.get();

        // console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send('really?')
            return 0;
        }

        let roomDoc = await db.collection('game_rooms').doc(gameId).get();

        if (!roomDoc.exists) {
            console.log("room not found");
            res.send('really?')
            return 0;
        }

        if (roomDoc.data().crr_participants !== roomDoc.data().participants_number) {
            res.send('room not yet started');
            return 0;
        }

        let game_timestamp = roomDoc.data().game_started_timestamp === undefined
            ? 0 : roomDoc.data().game_started_timestamp;

        console.log(game_timestamp);

        let senderId = doc.data().id;

        userRef = db.collection('users').doc(senderId);
        let senderData = await userRef.get();

        if (senderData.data().crr_game_room !== gameId) {
            res.send('u r not a player');
            return 0;
        }

        let eventsSnapShot = await db.collection('game_rooms').doc(gameId)
            .collection('events').orderBy('timestamp', 'desc').get();

        let events_list = [];
        eventsSnapShot.forEach(event => {
            // console.log(quest.id, '=>', quest.data());
            let eventData = event.data();
            events_list.push(eventData);
        });

        let playersSnapShot;

        if (roomDoc.data().last_event_type !== 'end')
            playersSnapShot = await db.collection('game_rooms').doc(gameId)
                .collection('players').get();
        else
            playersSnapShot = await db.collection('game_rooms').doc(gameId)
                .collection('players').orderBy('score', 'desc').get();

        let players_list = {}
        let readied = false;
        playersSnapShot.forEach(player => {
            // console.log(player.id, '=>', player.data());
            let playerData = player.data();
            if (player.id === senderMaskId) readied = playerData.readied;
            players_list[player.id] = playerData;
        });

        console.log(events_list, players_list);

        res.render('game', {
            data: JSON.stringify({
                    events_list: events_list,
                    players_list: players_list,
                    readied: readied,
                    guessed: false,
                    score: 0,
                    game_id: gameId,
                    sender_id: senderMaskId,
                    timestamp: game_timestamp,
                }
            )
        })

    })();
});

app.post('/game', (req, res) => {
    (async () => {

        let params = req.body.data;
        let action = params.action;
        let senderMaskId = params.senderId;
        let gameId = params.gameId;

        if (senderMaskId === undefined) {
            console.log('nope')
            res.send({error: 1})
            return 0;
        }

        let userRef = db.collection('global_vars').doc('masks')
            .collection('users').doc(senderMaskId);
        let doc = await userRef.get();

        // console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send({error: 1})
            return 0;
        }

        let senderId = doc.data().id;

        userRef = db.collection('users').doc(senderId);
        let senderData = await userRef.get();

        if (senderData.data().crr_game_room !== gameId) {
            res.send('u r not a player');
            return 0;
        }

        if (action === 'ready') {

            let userDoc = await db.collection('game_rooms').doc(gameId)
                .collection('players').doc(senderMaskId).get()

            if (userDoc.exists && userDoc.data().readied === true) {
                res.send({error: 2});
                return 0;
            }

            let roomData = (await db.collection('game_rooms').doc(gameId).get()).data()

            if (roomData.crr_participants === roomData.readied_players) {
                res.send({error: 3});
                return 0;
            }

            await db.collection('game_rooms').doc(gameId).set({
                readied_players: FieldValue.increment(1)
            }, {merge: true});

            roomData.readied_players += 1;

            await db.collection('game_rooms').doc(gameId)
                .collection('players').doc(senderMaskId).set({
                    readied: true
                }, {merge: true});

            if (roomData.readied_players === roomData.participants_number) {

                let game_started_timestamp = Date.now()
                await db.collection('game_rooms').doc(gameId).set({
                    game_started_timestamp: game_started_timestamp
                }, {merge: true});

                console.log("hey1", game_started_timestamp);

                await updateGame(gameId, 'time', game_started_timestamp);

                res.send({error: -1});
            } else {
                res.send({error: 0.1});
            }
        } else if (action === 'unready') {

            let userDoc = await db.collection('game_rooms').doc(gameId)
                .collection('players').doc(senderMaskId).get()

            if (!userDoc.exists || userDoc.data().readied === false) {
                res.send({error: 4});
                return 0;
            }

            let roomData = (await db.collection('game_rooms').doc(gameId).get()).data()

            if (roomData.crr_participants === roomData.readied_players) {
                res.send({error: 3});
                return 0;
            }

            await db.collection('game_rooms').doc(gameId).set({
                readied_players: FieldValue.increment(-1)
            }, {merge: true});

            await db.collection('game_rooms').doc(gameId)
                .collection('players').doc(senderMaskId).set({
                    readied: false
                }, {merge: true});

            res.send({error: 0.1})

        } else if (action === 'select') {
            let game_data = (await db.collection('game_rooms').doc(gameId).get()).data()
            let last_event_data = (await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).get()).data()

            let selected_quest = {};
            selected_quest[params.questionId] = last_event_data.questions_list[params.questionId]
            await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).update({
                    selected_quest: selected_quest
                });

            // await updateGame(params.gameId);
            res.send({error: 0});
        } else if (action === 'answer') {
            let game_data = (await db.collection('game_rooms').doc(gameId).get()).data();
            let last_event_data = (await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).get()).data();

            let new_answer = last_event_data.answers;
            new_answer[senderMaskId] = params.answer;
            await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).set({
                    answers: new_answer
                }, {merge: true});

            // await updateGame(params.gameId);
            res.send({error: 0});
        } else if (action === 'vote') {
            let game_data = (await db.collection('game_rooms').doc(gameId).get()).data();
            let last_event_data = (await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).get()).data();

            let voted_player_data = (await db.collection('game_rooms').doc(gameId)
                .collection('players').doc(Object.keys(params.vote)[0]).get()).data();

            let new_vote = last_event_data.votes;

            //Nếu vote bỏ lượt
            if (voted_player_data !== undefined) {
                new_vote[senderMaskId] = {
                    nickname: voted_player_data.nickname,
                    realname: params.vote[Object.keys(params.vote)[0]],
                    id: Object.keys(params.vote)[0],
                    result: voted_player_data.realname === params.vote[Object.keys(params.vote)[0]]
                };

                await db.collection('game_rooms').doc(gameId)
                    .collection('events').doc(game_data.last_event).set({
                        votes: new_vote
                    }, {merge: true});
            }

            // await updateGame(params.gameId);
            res.send({error: 0});
        }
    })();
});

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


async function updateGame(gameId, option, param) {

    // console.log("hey2", game_started_timestamp);

    let events_list_collection = await db.collection('game_rooms').doc(gameId)
        .collection('events').orderBy('timestamp', 'desc').get();
    let game_data = (await db.collection('game_rooms').doc(gameId).get()).data();
    let game_timestamp;

    if (option === 'time') game_timestamp = param;
    else game_timestamp = game_data.game_started_timestamp;

    // console.log("hey3", game_timestamp);

    let crr_timestamp = Date.now();

    let players_list = {}, events_list = [];

    if (option === 'end') {

        let players_list_collection = await db.collection('game_rooms').doc(gameId)
            .collection('players').orderBy('score', 'desc').get();

        players_list_collection.forEach(player => {
            players_list[player.id] = player.data();
        });

        events_list_collection.forEach(event => {
            events_list.push(event.data());
        });

        console.log('end');

        let new_event = {
            type: 'end',
            timestamp: Date.now()
        };

        events_list.unshift(new_event)

        let new_event_doc = await db.collection('game_rooms').doc(gameId)
            .collection('events').add(new_event);

        await db.collection('game_rooms').doc(gameId).set({
            last_event: new_event_doc.id,
            last_event_type: 'vote'
        }, {merge: true});

        io.sockets.emit('new_event ' + gameId, {
            events_list: events_list,
            players_list: players_list,
            timestamp: game_timestamp
        });

        let players = await db.collection('game_rooms').doc(gameId).collection('players').get();

        players.forEach(player => {
            (async () => {
                await db.collection('users').doc(player.id).set({
                    crr_game_room: null
                }, {merge: true})
            })();
        });

        setTimeout(() => {
            (async () => {
                await db.collection('game_rooms').doc(gameId).delete();
            })();
        }, 5 * 60 * 1000)

        return;
    }

    let players_list_collection = await db.collection('game_rooms').doc(gameId)
        .collection('players').get();

    // console.log(events_list_collection.length);

    if (game_data.last_event === null || game_data.last_event_type === 'vote') {

        let not_selected_players_list = [];

        players_list_collection.forEach(player => {

            players_list[player.id] = player.data();

            if (game_data.selected_players.includes(player.id)) return;

            not_selected_players_list.push(player.id);
        });

        // console.log(not_selected_players_list);

        events_list_collection.forEach(event => {
            events_list.push(event.data());
        });

        if (events_list.length !== 0) {
            let end = false;
            let last_event_data = (await db.collection('game_rooms').doc(gameId)
                .collection('events').doc(game_data.last_event).get()).data();

            if (Object.keys(last_event_data.votes).length === 0) {
                await updateGame(gameId, 'end');
                return;
            }

            let players_list = (await db.collection('game_rooms').doc(gameId)
                .collection('players').get());

            players_list.forEach((player) => {
                (async () => {
                    if (!(player.id in last_event_data.votes)) {
                        await db.collection('game_rooms').doc(gameId)
                            .collection('players').doc(player.id).set({
                                score: FieldValue.increment(-3)
                            }, {merge: true})
                    } else {

                        let guessed = false;

                        if (!last_event_data.votes[player.id].result) {

                            let voted_player_data = (await db.collection('game_rooms').doc(gameId)
                                .collection('players').doc(last_event_data.votes[player.id].id).get()).data();

                            await db.collection('game_rooms').doc(gameId)
                                .collection('players').doc(player.id).set({
                                    score: FieldValue.increment(-2),
                                    wrong_guessed: FieldValue.increment(1)
                                }, {merge: true})

                            if (voted_player_data.options.length === 2) {
                                guessed = true;
                            }

                        } else {

                            await db.collection('game_rooms').doc(gameId)
                                .collection('players').doc(player.id).set({
                                    score: FieldValue.increment(3),
                                    right_guessed: FieldValue.increment(1)
                                }, {merge: true})

                            guessed = true;

                        }

                        await db.collection('game_rooms').doc(gameId)
                            .collection('players').doc(last_event_data.votes[player.id].id).set({
                                score: FieldValue.increment(1),
                                guessed: guessed,
                                options: FieldValue.arrayRemove(last_event_data.votes[player.id].realname)
                            }, {merge: true});

                        if (guessed === true) {
                            await db.collection('game_rooms').doc(gameId).set({
                                guessed_players: FieldValue.increment(1)
                            }, {merge: true})

                            if (game_data.crr_participants <= game_data.guessed_players + 3) {
                                if (!end) {
                                    await updateGame(gameId, 'end');
                                    end = true;
                                }
                            }
                        }
                    }
                })();
            });
            if (end) return;
        }

        let qa = await db.collection('global_vars').doc('qa').get();

        let selected_quests_list = game_data.selected_quests;
        let id_quests_list = [];
        let quests_list = {};
        let random_question;
        let not_selected_quests_list = [];

        for (let i = 0; i < qa.data().questions_count; i++) {
            if (i in selected_quests_list) continue;
            not_selected_quests_list.push(i);
        }

        for (let i = 0; i < 5; i++) {
            if (not_selected_quests_list.length === 0) {
                await updateGame(gameId, 'end');
                return;
            }

            random_question = not_selected_quests_list[
                Math.floor(Math.random() * not_selected_quests_list.length)];

            id_quests_list.push(random_question);

            not_selected_quests_list.splice(not_selected_quests_list.indexOf(random_question), 1);
        }

        let random_question_snapshot = await db.collection('questions')
            .where('random_id', 'in', id_quests_list).get();

        random_question_snapshot.forEach((question) => {
            (async () => {
                quests_list[question.data().random_id] = question.data().text;
            })();
        });

        if (quests_list.length === 0) return;

        let random_selected_player = not_selected_players_list[Math.floor(Math.random() * not_selected_players_list.length)];

        let default_selected_quest = {};
        default_selected_quest[Object.keys(quests_list)[0]] = quests_list[Object.keys(quests_list)[0]];

        let new_event = {
            questions_list: quests_list,
            selected_player: random_selected_player,
            selected_quest: default_selected_quest,
            type: 'select',
            timestamp: crr_timestamp
        };

        events_list.unshift(new_event);

        let new_event_doc = await db.collection('game_rooms').doc(gameId)
            .collection('events').add(new_event);

        await db.collection('game_rooms').doc(gameId).set({
            last_event: new_event_doc.id,
            last_event_type: 'select',
            selected_players: FieldValue.arrayUnion(random_selected_player),
        }, {merge: true});

        setTimeout(async () => {
            await updateGame(gameId);
        }, 45 * 1000)

    } else if (game_data.last_event_type === 'select') {

        let last_event_data = (await db.collection('game_rooms').doc(gameId)
            .collection('events').doc(game_data.last_event).get()).data();

        if (game_data.selected_players.length === game_data.crr_participants) {
            game_data.selected_players = [];
        }


        players_list_collection.forEach(player => {
            players_list[player.id] = player.data();
        });

        events_list_collection.forEach(event => {
            events_list.push(event.data());
        });

        let new_event = {
            type: 'answer',
            question: last_event_data.selected_quest,
            player: last_event_data.selected_player,
            answers: {},
            timestamp: crr_timestamp
        };

        events_list.unshift(new_event);

        let new_event_doc = await db.collection('game_rooms').doc(gameId)
            .collection('events').add(new_event);

        await db.collection('game_rooms').doc(gameId).set({
            selected_players: game_data.selected_players,
            selected_quests: FieldValue.arrayUnion(last_event_data.selected_quest),
            last_event: new_event_doc.id,
            last_event_type: 'answer',
        }, {merge: true});

        etTimeout(async () => {
            await updateGame(gameId);
        }, 105 * 1000)

    } else if (game_data.last_event_type === 'answer') {

        players_list_collection.forEach(player => {
            players_list[player.id] = player.data();
        });

        events_list_collection.forEach(event => {
            events_list.push(event.data());
        });

        let new_event = {
            type: 'vote',
            votes: {},
            timestamp: crr_timestamp
        };

        events_list.unshift(new_event);

        let new_event_doc = await db.collection('game_rooms').doc(gameId)
            .collection('events').add(new_event);

        await db.collection('game_rooms').doc(gameId).set({
            last_event: new_event_doc.id,
            last_event_type: 'vote'
        }, {merge: true});

        setTimeout(async () => {
            await updateGame(gameId);
        }, 90 * 1000)

    }

    // console.log('new_event ' + gameId);
    io.sockets.emit('new_event ' + gameId, {
        events_list: events_list,
        players_list: players_list,
        timestamp: game_timestamp
    });

    // io.sockets.emit('new_event', {
    //     events_list: events_list,
    //     players_list: players_list,
    // });
}