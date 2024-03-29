import { Context, Scenes, Telegraf, session } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
const fs = require('fs');
const path = require('path');

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

// import botData from 'bot_data.json' assert {type: "json"};
// import botData from 'bot_data_debug.json' assert {type: "json"};
const botDataPath = path.resolve(__dirname, "bot_data.json");

interface SessionData extends Scenes.WizardSessionData {
    waitingMessage?: Message,
    textMessage?: Message,
    messageAuthor?: string,
    confirmationMessage?: Message,
}

interface CumdebotContext extends Context {
    // declare scene type
	scene: Scenes.SceneContextScene<CumdebotContext, SessionData>;
	// declare wizard type
	wizard: Scenes.WizardContextWizard<CumdebotContext>;
}

export async function initBot() {

    const sendWizard = new Scenes.WizardScene<CumdebotContext>(
        'SEND_SCENE',
        // step 0
        async (ctx) => {
            const userId = ctx.from?.id;
            if (userId != undefined && botData.admins.includes(userId)) {
                console.log(`${userId} is admin!`)

                ctx.deleteMessage()
                .catch(e => {
                    console.log(e)
                })

                ctx.scene.session.waitingMessage = await ctx.sendMessage(`Жду послание от @${ctx.from?.username}`)
                return ctx.wizard.next();
            }
            else {
                ctx.deleteMessage()
                .catch(e => {
                    console.log(e)
                })
                
                return ctx.scene.leave();
            }
        },
        async (ctx) => {
            if (ctx.message != undefined) {
                if ('media_group_id' in ctx.message) {
                    console.log("Media group!! Retreat!!")
                    return ctx.scene.leave();
                }
                ctx.deleteMessage(ctx.scene.session.waitingMessage?.message_id)
                .catch(e => {
                    console.log(e)
                })
                ctx.scene.session.textMessage = ctx.message;
                console.log(ctx.scene.session.textMessage)
                ctx.scene.session.messageAuthor = ctx.from?.username;
                console.log("Message received!")             
            }

            ctx.scene.session.confirmationMessage = await ctx.sendMessage("Отправляем? (Да/Нет)")
            return ctx.wizard.next();
        },
        async (ctx) => {
            
            ctx.deleteMessage()
            .catch(e => {
                console.log(e)
            })

            ctx.deleteMessage(ctx.scene.session.textMessage?.message_id)
            .catch(e => {
                console.log(e)
            })

            ctx.deleteMessage(ctx.scene.session.confirmationMessage?.message_id)
            .catch(e => {
                console.log(e)
            })

            if (ctx.message != undefined && 'text' in ctx.message) {
                if (ctx.message.text.includes("Да")) {
                    console.log("Message sending approved!")
                    if (ctx.scene.session.textMessage != undefined) {
                        console.log(`Sending message`)
                        console.log(ctx.scene.session.textMessage)
                        const msg = ctx.scene.session.textMessage;
                        if ('text' in msg) {
                            ctx.sendMessage(`@${ctx.from?.username}\n${msg.text}`)
                            .catch(e => {
                                console.log(e)
                            })
                            botData.subscribed_users.forEach((user) => {
                                console.log(`Sending message to ${user}`)
                                console.log("sending msg")
                                bot.telegram.sendMessage(user, `@${ctx.from?.username}\n${msg.text}`)
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                        }
                        else if ('sticker' in msg) {
                            ctx.sendSticker(msg.sticker.file_id)
                            .catch(e => {
                                console.log(e)
                            })
                            botData.subscribed_users.forEach((user) => {
                                console.log(`Sending message to ${user}`)
                                bot.telegram.sendSticker(user, msg.sticker.file_id)
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                        }
                        else if ('photo' in msg) {
                            ctx.sendPhoto(msg.photo[0].file_id, 
                                {caption: `@${ctx.from?.username}\n${msg.caption}`})
                            .catch(e => {
                                console.log(e)
                            })
                            botData.subscribed_users.forEach((user) => {
                                console.log(`Sending message to ${user}`)
                                bot.telegram.sendPhoto(user, msg.photo[0].file_id, 
                                    {caption: `@${ctx.from?.username}\n${msg.caption}`})
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                        }
                        else if ('document' in msg) {
                            ctx.sendDocument(msg.document.file_id, 
                                {caption: `@${ctx.from?.username}\n${msg.caption}`})
                            .catch(e => {
                                console.log(e)
                            })
                            botData.subscribed_users.forEach((user) => {
                                console.log(`Sending message to ${user}`)
                                bot.telegram.sendDocument(user, msg.document.file_id, 
                                    {caption: `@${ctx.from?.username}\n${msg.caption}`})
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                        }
                        else {
                            ctx.reply(`@${ctx.from?.username} некорректный формат! Отправлять можно только текст, стикеры и одиночные фото или документы.`)
                            .catch(e => {
                                console.log(e)
                            })
                        }
                        
                    }
                }
                else {
                    console.log("Message sending canceled.")
                }
            }
            return ctx.scene.leave();
        }

    )

    const bot = new Telegraf<CumdebotContext>("5742788171:AAHFXeuK7KlWDEFFjqXS5C4DUMMlL5_5hrw")
    const stage = new Scenes.Stage<CumdebotContext>([sendWizard]);

    const jsonData = fs.readFileSync(botDataPath, "utf-8");
    const botData = JSON.parse(jsonData);

    bot.use(session())
    bot.use(stage.middleware())
    bot.launch()

    bot.start((ctx) => {
        const userId = ctx.from?.id;
        if (ctx.message.chat.type == "private") {
            if (userId != undefined) {
                if (!botData.subscribed_users.includes(userId)) {
                    botData.subscribed_users.push(userId);
                    writeBotData();
                    ctx.reply('Бот подключен')
                }
                else {
                    ctx.deleteMessage()
                    .catch(e => {
                        console.log(e)
                    })

                    ctx.reply(`@${ctx.from.username} вы уже подключены!`)
                }
            }
        }
        else {
            if (userId != undefined) {
                if (botData.subscribed_users.includes(userId)) {

                    ctx.deleteMessage()
                    .catch(e => {
                        console.log(e)
                    })

                    ctx.reply(`@${ctx.from.username} вы уже подключены!`)
                    return;
                }
            }
            ctx.reply(`@${ctx.from.username} чтобы подключиться, пишите мне в лс! Дуров не разрешает писать первым :(`)
        }
    })

    bot.command("end", (ctx) => {
        console.log(`${ctx.from.id} => /end`)
        const userId = ctx.from?.id;
        if (userId != undefined) {
            if (botData.subscribed_users.includes(userId)) {
                botData.subscribed_users = botData.subscribed_users.filter(item => item !== userId);
                writeBotData();
            }
            ctx.reply('Вы отключены от бота')
        }
    })

    bot.command("send", (ctx) => {
        console.log(`${ctx.from.id} => /send`)
        ctx.scene.enter("SEND_SCENE");
    })

    const writeBotData = () => {
        const newJson = JSON.stringify(botData, null, 2);
        fs.writeFileSync(botDataPath, newJson, 'utf-8');
        console.log("New Data written")
    }
}

initBot();