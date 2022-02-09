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
                    tag_list: JSON.stringify(tag_list),
                    find_tags: JSON.stringify(doc.data().find_tags),
                    exclude_last_connected: JSON.stringify(doc.data().exclude_last_connected),
                    find_gender: JSON.stringify(doc.data().find_gender),
                    age_range: JSON.stringify(doc.data().age_range),
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
            const Ref = db.collection('users').doc(senderId);
            const res = await Ref.set({
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

            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)
            res.render('profile',
                {
                    text: 'hey',
                    tags: JSON.stringify(doc.data().tags),
                    age: JSON.stringify(doc.data().age),
                    nickname: JSON.stringify(doc.data().nickname),
                    fb_link: JSON.stringify(doc.data().fb_link),
                    gender: JSON.stringify(doc.data().gender),
                    tag_list: JSON.stringify(tag_list),
                    senderId: JSON.stringify(maskId)
                })
        }
    })();
})

app.post('/profile', (req, res) => {
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
            const Ref = db.collection('users').doc(senderId);
            const res = await Ref.set({
                tags: params.tags,
                age: params.age,
                nickname: params.nickname,
                fb_link: params.fb_link,
                gender: params.gender,
            }, {merge: true});
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
        } else {
            let senderId = doc.data().id;

            // console.log(senderId);
            ref = db.collection('users').doc(senderId)
            doc = await ref.get();

            let questions_list = [];
            // console.log(doc.data());
            for (let i = 0; i < doc.data().asked_questions.length; i++) {
                let questionDoc = await db.collection('questions')
                    .doc(doc.data().asked_questions[i].toString())
                    .get();
                questions_list.push(
                    {
                        text: questionDoc.data().text,
                        timestamp: questionDoc.data().timestamp,
                        mask_id: questionDoc.data().mask_id,
                        answers_count: questionDoc.data().answers_count,
                        auth: questionDoc.data().author,
                        mask_sender_id: maskId
                    }
                )
            }
            // console.log('Document data:', doc.data());
            // console.log(doc.data().tags, doc.data().find_tags)
            res.render('quest',
                {
                    text: 'hey',
                    questions_list: JSON.stringify(questions_list),
                })
        }
    })();
})

// Navigation
app.get('/ans', (req, res) => {
    (async () => {
        let questMaskId = req.query.id;
        let senderMaskId = req.query.senderId;
        if (questMaskId === undefined || senderMaskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('questions').doc(questMaskId);
        let docQuest = await ref.get();

        if (!docQuest.exists) {
            res.send("Bruh");
        } else {

            // console.log("Doc data : ", doc.data());

            let questId = docQuest.data().id;

            // console.log(senderId);

            ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId);
            docQuest = await ref.get();

            if (!docQuest.exists) {
                res.send("Bruh2");
            } else {

                ref = db.collection('questions').doc(questId.toString());
                let snapShot = await ref.get();
                let question = snapShot.data().text;

                ref = db.collection('questions').doc(questId.toString()).collection("answers");
                snapShot = await ref.get();

                let answers_list = [];
                snapShot.forEach(doc => {
                    answers_list.push(
                        {
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            author: doc.data().author,
                        }
                    )
                });
                // console.log('Document data:', doc.data());
                // console.log(doc.data().tags, doc.data().find_tags)

                res.render('ans',
                    {
                        text: 'hey',
                        question: JSON.stringify(question),
                        answers_list: JSON.stringify(answers_list),
                        sender_id: JSON.stringify(senderMaskId),
                        quest_id: JSON.stringify(questMaskId)
                    })
            }
        }
    })();
})

app.post('/ans', (req, res) => {
    (async () => {

        let params = req.body;
        let senderMaskId = params.sender_id;
        let questMaskId = params.quest_id;
        let ansId = params.ans_id;

        console.log("Params : ", params);

        if (senderMaskId === undefined || questMaskId === undefined) {
            console.log('nope')
            res.send("Wha");
            return;
        }

        let ref = db.collection('global_vars').doc('masks').collection('users').doc(senderMaskId.toString());
        let doc = await ref.get();
        let senderId = doc.data().id;

        console.log("hey", doc.data());

        if (!doc.exists) {
            console.log("User not found");
            res.send("Bruh");
        } else {
            ref = db.collection('global_vars').doc('masks').collection('questions').doc(questMaskId.toString());
            doc = await ref.get();

            let questId = doc.data().id;

            if (params.type === 'a')
                ref = db.collection('questions').doc(questId.toString()).collection("answers").doc(ansId.toString());
            else
                ref = db.collection('questions').doc(questId.toString());


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

    })();
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