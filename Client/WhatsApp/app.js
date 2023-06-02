// ----------------------------------------------------------------------------
// Name         : SmaBot [ WhatsApp ]
// Desc         : SmaBot is a WhatsApp bot that aims to assist users in
//                completing their tasks using the power of AI. It has a
//                range of features, including image searching,
//                that can aid in the completion of tasks. Additionally,
//                SmaBot provides numerous other features that users
//                can explore and use to their advantage.
// Author       : Wildy Sheverando [WildyBytes]
// Date         : 25-05-2023
// License      : GNU General Public License V3
// License Link : https://raw.githubusercontent.com/wildybytes/lcn/main/gplv3
// ----------------------------------------------------------------------------

// Declare required variable & library
const config_files                        = require('./config.json')
const qrcode                              = require('qrcode-terminal')
const figlet                              = require('figlet')
const fs                                  = require('fs')
const axios                               = require('axios')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')

// Initialize the client
const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth(),
    ffmpegPath: 'ffmpeg-linux/ffmpeg', // Set path to ur ffmpeg location
})

// Function used to logger
function logger(message) {
    const now = new Date()
    const time = now.toLocaleTimeString()
    const date = now.toLocaleDateString()
    console.log(`[ ${time} | ${date} ] | ${message}`)
}

// Output QR code for session login
client.on("qr", (qr) => {
    console.clear()
    console.log("Scan this QR code to login:")
    qrcode.generate(qr, { small: true })
});

// If authenticated, log success message
client.on("authenticated", (session) => {
    console.clear()
    console.log("Successfully logged in to WhatsApp!")
});

// Check status
client.on("ready", () => {
    client.sendMessage(`${config_files.owner_number}@c.us`, '[ Log From SmaBot ]\nSmaBot has been started')
    console.clear()
    console.log(figlet.textSync('SmaBot - WildyBytes'))
    console.log(`\n                   SmaBot / SmartBot [ WhatsApp ] - Version 1.0.0 [ Stable ]\n                            Author : Wildy Sheverando [ WildyBytes ]\n                       This Project Licensed Under GNU Public License V3\n\n--------------------------------------------------------------------------------------------------`)
    logger("SmaBot has been started.")
})

// declare the global gpt35prompt
let gpt35prompt = [
    {
        "role": "system",
        "content": "Halo saya SmaBot - Assistent whatsapp pintar, anda dapat panggil saya SmaBot, saya di develop oleh Wildy Sheverando atau biasa di kenali WildyBytes menggunakan API dari openai.com"
    }
]

// function to appendgpt35prompt
function appendgpt35prompt(role, content) {
  gpt35prompt.push({ role: role, content: content });
  return gpt35prompt
}

// function to reset gpt35prompt
function resetgpt35prompt() {
    gpt35prompt = [{"role": "system", "content": "Halo saya SmaBot"}];
}

// Client message handle
client.on("message_create", async (message) => {
    try {
        const prefix  = config_files.prefix
        const api_key = config_files.unofficial_openai_token
        const api_url = config_files.unofficial_openai_url
        const num_own = config_files.owner_number
        const chat    = await message.getChat()
        const type    = await message.type
        const body    = await message.body
        const gcnts   = await message.getContact()
        const cnsname = await gcnts.pushname
        const cnsnum  = await gcnts.number
        const isgroup = chat.isGroup
        const to = chat.id._serialized

        // Get current date
        const currentDate = new Date();

        // Convert the date to string
        const date = currentDate.toLocaleDateString();
        const time = currentDate.toLocaleTimeString();

        // event handle for sticker
        if (body.startsWith(`${prefix}sticker`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            if (!((type == 'image') || (type == 'video') || (type == 'gif'))) {
                message.reply("Sorry this feature support for image, video and gif only !")
                return
            } else {
                message.react('⏱️')
                logger(``)
                logger(`Model: Sticker Maker | SUCCESS`)
                logger(`${cnsname} | ${cnsnum} | Success created sticker`)
                const media = await message.downloadMedia() // download the media
                message.react('✅')
                client.sendMessage(to, media, {
                    sendMediaAsSticker: true,
                    stickerName: "Created By SmaBot",
                    stickerAuthor: "WildyBytes"
                })
                return
            }
        }

        // used to handle gpt30
        else if (body.startsWith(`${prefix}gpt30`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            // validate text only
            if (!type == 'chat') {
                message.reply("Sorry this feature only support text !")
                return
            }

            // Parsing message and sending to api then return as reply
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}gpt30 `, "")
            const msgparse = msgparse1.replace(`${prefix}gpt30`, "")
            if (msgparse == "") {
                message.reply(`Invalid Usage !\n\nExample:\n${prefix}gpt30 why cannot use object oriented at golang ?`);
                return
            } else {
                // declare datapost for axios template
                const datapost = {
                    method: 'POST',
                    url: `${api_url}/gpt30`,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${api_key}`
                    },
                    data: JSON.stringify({
                        "prompt": msgparse
                    })
                }

                axios(datapost)
                .then(
                    async function (response) {
                        message.react('✅')
                        logger(``)
                        logger(`Model: GPT-30 | SUCCESS`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${response.data.result}`)
                        message.reply(response.data.result)
                        return
                    }
                )
                .catch(
                    async function (error) {
                        message.react('🚫')
                        logger(``)
                        logger(`Model: GPT-30 | ERROR`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${error}`)
                        message.reply(`${api_url}/gpt30\nnot return any response !`)
                        return
                    }
                )
            }
        }

        // used to handle gpt35
        else if (body.startsWith(`${prefix}gpt35`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            // validate text only
            if (!type == 'chat') {
                message.reply("Sorry this feature only support text !")
                return
            }

            // Parsing message and sending to api then return as reply
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}gpt35 `, "")
            const msgparse = msgparse1.replace(`${prefix}gpt35`, "")
            if (msgparse == "") {
                message.reply(`Invalid Usage !\n\nExample:\n${prefix}gpt35 why cannot use object oriented at golang ?`);
                return
            } else {
                // declare datapost for axios template
                const datapost = {
                    method: 'POST',
                    url: `${api_url}/gpt35`,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${api_key}`
                    },
                    data: JSON.stringify({
                        "prompt": appendgpt35prompt("user", msgparse)
                    })
                }

                axios(datapost)
                .then(
                    async function (response) {
                        message.react('✅')
                        logger(``)
                        logger(`Model: GPT-35 | SUCCESS`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${response.data.result}`)
                        message.reply(response.data.result)
                        return
                    }
                )
                .catch(
                    async function (error) {
                        message.react('🚫')
                        logger(``)
                        logger(`Model: GPT-35 | ERROR`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${error}`)
                        message.reply(`${api_url}/gpt35\nnot return any response !`)
                        return
                    }
                )
            }
        }

        // used to handle gpt35reset
        else if (body.startsWith(`${prefix}resetgpt35`)) {
            resetgpt35prompt() // call the function to reset
            message.react('✅')
            logger(`GPT35 History has been reset !`)
            message.reply(`GPT35 History has been reset !`)
            return
        }

        // used to handle gpt30
        else if (body.startsWith(`${prefix}dalle2`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            // validate text only
            if (!type == 'chat') {
                message.reply("Sorry this feature only support text !")
                return
            }

            // Parsing message and sending to api then return as reply
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}dalle2 `, "")
            const msgparse = msgparse1.replace(`${prefix}dalle2`, "")
            if (msgparse == "") {
                message.reply(`Invalid Usage !\n\nExample:\n${prefix}dalle2 Capybara on swiming`);
                return
            } else {
                // declare datapost for axios template
                const datapost = {
                    method: 'POST',
                    url: `${api_url}/dalle2`,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${api_key}`
                    },
                    data: JSON.stringify({
                        "prompt": msgparse
                    })
                }

                axios(datapost)
                .then(
                    async function (response) {
                        message.react('✅')
                        logger(``)
                        logger(`Model: DALLE-2 | SUCCESS`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${response.data.result}`)
                        const media = await MessageMedia.fromUrl(response.data.result, { unsafeMime: true });
                        client.sendMessage(to, media)
                        return
                    }
                )
                .catch(
                    async function (error) {
                        message.react('🚫')
                        logger(``)
                        logger(`Model: DALLE-2 | ERROR`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${error}`)
                        message.reply(`${api_url}/dalle2\nnot return any response !`)
                        return
                    }
                )
            }
        }

        // used to handle bing
        else if (body.startsWith(`${prefix}bing`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            // validate text only
            if (!type == 'chat') {
                message.reply("Sorry this feature only support text !")
                return
            }

            // Parsing message and sending to api then return as reply
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}bing `, "")
            const msgparse = msgparse1.replace(`${prefix}bing`, "")
            if (msgparse == "") {
                message.reply(`Invalid Usage !\n\nExample:\n${prefix}bing why cannot use object oriented at golang ?`);
                return
            } else {
                // declare datapost for axios template
                const datapost = {
                    method: 'POST',
                    url: `http://127.0.0.1:3891/chat`,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: JSON.stringify({
                        "question": msgparse
                    })
                }

                axios(datapost)
                .then(
                    async function (response) {
                        message.react('✅')
                        logger(``)
                        logger(`Model: BING | SUCCESS`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${response.data.result}`)
                        message.reply(response.data.result)
                        return
                    }
                )
                .catch(
                    async function (error) {
                        logger(``)
                        message.react('🚫')
                        logger(`Model: BING | ERROR`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${error}`)
                        message.reply(`bing not return any response !`)
                        return
                    }
                )
            }
        }

        // used to handle resetbing
        else if (body.startsWith(`${prefix}resetbing`)) {
            // reaction
            message.react('⏱️')

            // declare datapost for axios template
            const datapost = {
                method: 'POST',
                url: `http://127.0.0.1:3891/reset`,
            }

            axios(datapost)
            .then(
                async function (response) {
                    message.react('✅')
                    logger(`Bing History has been reset !`)
                    message.reply(`Bing History has been reset !`)
                    return
                }
            )
            .catch(
                async function (error) {
                    message.react('🚫')
                    logger(`${error}`)
                    message.reply(`API Connection failure !`)
                    return
                }
            )
        }

        // used to handle bard
        else if (body.startsWith(`${prefix}bard`)) {
            // Validate access for owner only
            if (!(num_own == cnsnum)) {
                logger(`Chat from (${cnsname}, ${cnsnum}) | but access restricted`)
                return
            }

            // validate text only
            if (!type == 'chat') {
                message.reply("Sorry this feature only support text !")
                return
            }

            // Parsing message and sending to api then return as reply
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}bard `, "")
            const msgparse = msgparse1.replace(`${prefix}bard`, "")
            if (msgparse == "") {
                message.reply(`Invalid Usage !\n\nExample:\n${prefix}bard why cannot use object oriented at golang ?`);
                return
            } else {
                // declare datapost for axios template
                const datapost = {
                    method: 'POST',
                    url: `http://127.0.0.1:3892/chat`,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: JSON.stringify({
                        "question": msgparse
                    })
                }

                axios(datapost)
                .then(
                    async function (response) {
                        message.react('✅')
                        logger(``)
                        logger(`Model: BARD | SUCCESS`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${response.data.result}`)
                        message.reply(response.data.result)
                        return
                    }
                )
                .catch(
                    async function (error) {
                        logger(``)
                        message.react('🚫')
                        logger(`Model: BARD | ERROR`)
                        logger(`From: ${cnsname} | ${cnsnum}`)
                        logger(`Question: ${msgparse}`)
                        logger(`Result: ${error}`)
                        message.reply(`bard not return any response !`)
                        return
                    }
                )
            }
        }

        // handle for /offline
        else if (body.startsWith(`${prefix}offline`)) {
            message.react('⏱️')
            const msgparse1 = message.body.replace(`${prefix}offline `, "")
            const msgparse = msgparse1.replace(`${prefix}offline`, "")

            // create json data template
            let datajson = {
                status: "offline",
                reason: msgparse,
                lastseen: `${time} | ${date}`
            };

            // make the data to json using json stringify
            let jsonData = JSON.stringify(datajson)

            // writing tto status.json
            fs.writeFile('status.json', jsonData, (err) => {
                if (err) {
                    logger(`Failed to saving status files`)
                    message.react('🚫')
                    message.reply("Failed to writing status files")
                    return
                } else {
                    logger(`Success set status to offline`)
                    message.react('✅')
                    message.reply("Success set status to offline")
                    return
                }
            })
        }

        // handle for /online
        else if (body.startsWith(`${prefix}online`)) {
            // react processing
            message.react('⏱️')

            // create online data tempalte
            let onlinetemplate = {
                status: "online",
                reason: "online",
                lastseen: "none"
            }

            // make the data to json
            let jsonconverted = JSON.stringify(onlinetemplate)

            // Writing to status.json
            fs.writeFile('status.json', jsonconverted, (err) => {
                if (err) {
                    logger(`Failed to writign status files`)
                    message.react('🚫')
                    message.reply("Failed to writing status files")
                    return
                } else {
                    logger(`Success set status to online`)
                    message.react('✅')
                    message.reply("Success set status to online")
                    return
                }
            })
        }

        // handle for status is offline
        else {
            // Validate if is group
            if (isgroup) {
                return
            }
      
            // Validate for owner
            if ((num_own == cnsnum)) {
                return
            }

            // function to read status files
            function readStatusJson() {
                try {
                  const data = fs.readFileSync('status.json', 'utf8');
                  return JSON.parse(data);
                } catch (error) {
                  console.error('Error cannot load status files !');
                  return null;
                }
            }

            // handle if status is afk / offline
            const callstatusconfig = readStatusJson();
            if (callstatusconfig && callstatusconfig.status === 'offline') {
                setTimeout(() => {
                    message.reply(`Status: ${callstatusconfig.status}\nLast seen: ${callstatusconfig.lastseen}\nReason: ${callstatusconfig.reason}\n\nAutoReply - SmaBot`)
                    return
                }, 2000) // sleeping 2 seconds
            }
        }

    } catch(error) {
        logger(error) // terjadi kesalahan pada exception handle
    }
})

// Start the client
client.initialize();
