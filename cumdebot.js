"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBot = void 0;
var telegraf_1 = require("telegraf");
var fs = require("fs");
// import botData from 'bot_data.json' assert {type: "json"};
// import botData from 'bot_data_debug.json' assert {type: "json"};
var botDataPath = "bot_data.json";
function initBot() {
    return __awaiter(this, void 0, void 0, function () {
        var sendWizard, bot, stage, jsonData, botData, writeBotData;
        var _this = this;
        return __generator(this, function (_a) {
            sendWizard = new telegraf_1.Scenes.WizardScene('SEND_SCENE', 
            // step 0
            function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
                            if (!(userId != undefined && botData.admins.includes(userId))) return [3 /*break*/, 2];
                            console.log("".concat(userId, " is admin!"));
                            try {
                                ctx.deleteMessage();
                            }
                            catch (e) {
                                console.log(e);
                            }
                            _a = ctx.scene.session;
                            return [4 /*yield*/, ctx.sendMessage("\u0416\u0434\u0443 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043E\u0442 @".concat((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username))];
                        case 1:
                            _a.waitingMessage = _d.sent();
                            return [2 /*return*/, ctx.wizard.next()];
                        case 2:
                            try {
                                ctx.deleteMessage();
                            }
                            catch (e) {
                                console.log(e);
                            }
                            return [2 /*return*/, ctx.scene.leave()];
                    }
                });
            }); }, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (ctx.message != undefined) {
                                if ('media_group_id' in ctx.message) {
                                    console.log("Media group!! Retreat!!");
                                    return [2 /*return*/, ctx.scene.leave()];
                                }
                                try {
                                    ctx.deleteMessage((_b = ctx.scene.session.waitingMessage) === null || _b === void 0 ? void 0 : _b.message_id);
                                }
                                catch (e) {
                                    console.log(e);
                                }
                                ctx.scene.session.textMessage = ctx.message;
                                console.log(ctx.scene.session.textMessage);
                                ctx.scene.session.messageAuthor = (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username;
                                console.log("Message received!");
                            }
                            _a = ctx.scene.session;
                            return [4 /*yield*/, ctx.sendMessage("Отправляем? (Да/Нет)")];
                        case 1:
                            _a.confirmationMessage = _d.sent();
                            return [2 /*return*/, ctx.wizard.next()];
                    }
                });
            }); }, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var msg_1;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    try {
                        ctx.deleteMessage();
                    }
                    catch (e) {
                        console.log(e);
                    }
                    try {
                        ctx.deleteMessage((_a = ctx.scene.session.textMessage) === null || _a === void 0 ? void 0 : _a.message_id);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    try {
                        ctx.deleteMessage((_b = ctx.scene.session.confirmationMessage) === null || _b === void 0 ? void 0 : _b.message_id);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    if (ctx.message != undefined && 'text' in ctx.message) {
                        if (ctx.message.text.includes("Да")) {
                            console.log("Message sending approved!");
                            if (ctx.scene.session.textMessage != undefined) {
                                console.log("Sending message");
                                console.log(ctx.scene.session.textMessage);
                                msg_1 = ctx.scene.session.textMessage;
                                if ('text' in msg_1) {
                                    ctx.sendMessage(msg_1);
                                    botData.subscribed_users.forEach(function (user) {
                                        console.log("Sending message to ".concat(user));
                                        try {
                                            bot.telegram.sendMessage(user, msg_1);
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                else if ('sticker' in msg_1) {
                                    ctx.sendSticker(msg_1.sticker.file_id);
                                    botData.subscribed_users.forEach(function (user) {
                                        console.log("Sending message to ".concat(user));
                                        try {
                                            bot.telegram.sendSticker(user, msg_1.sticker.file_id);
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                else if ('photo' in msg_1) {
                                    ctx.sendPhoto(msg_1.photo[0].file_id, { caption: "@".concat((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username, "\n").concat(msg_1.caption) });
                                    botData.subscribed_users.forEach(function (user) {
                                        var _a;
                                        console.log("Sending message to ".concat(user));
                                        try {
                                            bot.telegram.sendPhoto(user, msg_1.photo[0].file_id, { caption: "@".concat((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username, "\n").concat(msg_1.caption) });
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                else if ('document' in msg_1) {
                                    ctx.sendDocument(msg_1.document.file_id, { caption: "@".concat((_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username, "\n").concat(msg_1.caption) });
                                    botData.subscribed_users.forEach(function (user) {
                                        var _a;
                                        console.log("Sending message to ".concat(user));
                                        try {
                                            bot.telegram.sendDocument(user, msg_1.document.file_id, { caption: "@".concat((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username, "\n").concat(msg_1.caption) });
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                else {
                                    ctx.reply("@".concat((_e = ctx.from) === null || _e === void 0 ? void 0 : _e.username, " \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442! \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u0435\u043A\u0441\u0442, \u0441\u0442\u0438\u043A\u0435\u0440\u044B \u0438 \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0435 \u0444\u043E\u0442\u043E \u0438\u043B\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B."));
                                }
                            }
                        }
                        else {
                            console.log("Message sending canceled.");
                        }
                    }
                    return [2 /*return*/, ctx.scene.leave()];
                });
            }); });
            bot = new telegraf_1.Telegraf("5742788171:AAHFXeuK7KlWDEFFjqXS5C4DUMMlL5_5hrw");
            stage = new telegraf_1.Scenes.Stage([sendWizard]);
            jsonData = fs.readFileSync(botDataPath, "utf-8");
            botData = JSON.parse(jsonData);
            bot.use((0, telegraf_1.session)());
            bot.use(stage.middleware());
            bot.launch();
            bot.start(function (ctx) {
                var _a;
                var userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                if (ctx.message.chat.type == "private") {
                    if (userId != undefined) {
                        if (!botData.subscribed_users.includes(userId)) {
                            botData.subscribed_users.push(userId);
                            writeBotData();
                            ctx.reply('Бот подключен');
                        }
                        else {
                            try {
                                ctx.deleteMessage();
                            }
                            catch (e) {
                                console.log(e);
                            }
                            ctx.reply("@".concat(ctx.from.username, " \u0432\u044B \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u044B!"));
                        }
                    }
                }
                else {
                    if (userId != undefined) {
                        if (botData.subscribed_users.includes(userId)) {
                            try {
                                ctx.deleteMessage();
                            }
                            catch (e) {
                                console.log(e);
                            }
                            ctx.reply("@".concat(ctx.from.username, " \u0432\u044B \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u044B!"));
                            return;
                        }
                    }
                    ctx.reply("@".concat(ctx.from.username, " \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F, \u043F\u0438\u0448\u0438\u0442\u0435 \u043C\u043D\u0435 \u0432 \u043B\u0441! \u0414\u0443\u0440\u043E\u0432 \u043D\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 \u043F\u0438\u0441\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u043C :("));
                }
            });
            bot.command("end", function (ctx) {
                var _a;
                console.log("".concat(ctx.from.id, " => /end"));
                var userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                if (userId != undefined) {
                    if (botData.subscribed_users.includes(userId)) {
                        botData.subscribed_users = botData.subscribed_users.filter(function (item) { return item !== userId; });
                        writeBotData();
                    }
                    ctx.reply('Вы отключены от бота');
                }
            });
            bot.command("send", function (ctx) {
                console.log("".concat(ctx.from.id, " => /send"));
                ctx.scene.enter("SEND_SCENE");
            });
            writeBotData = function () {
                var newJson = JSON.stringify(botData, null, 2);
                fs.writeFileSync(botDataPath, newJson, 'utf-8');
                console.log("New Data written");
            };
            return [2 /*return*/];
        });
    });
}
exports.initBot = initBot;
initBot();
