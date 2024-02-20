import json
import asyncio
import sys
import os
import re 
import random
import time
import logging
from difflib import SequenceMatcher

from telethon import TelegramClient, events, sync
from telethon.tl.types import InputMessagesFilterEmpty, MessageActionTopicCreate
from telethon.tl.types import UpdateNewChannelMessage, UpdateNewMessage
from telethon.tl.patched import MessageService
from telethon import functions
from telethon import errors
from telethon import events
from telethon.tl.custom import Button
from telethon.tl.functions.users import GetFullUserRequest
from telethon.events.newmessage import NewMessage
from telethon.tl.types import PeerUser, PeerChat, PeerChannel

logging.basicConfig(
    filename='cumdesign.log', filemode='w', encoding='utf-8',
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S')

# Creating logger
mylogs = logging.getLogger(__name__)
mylogs.setLevel(0)

# Handler - 1
log_file = logging.FileHandler("cumdesign.log")
fileformat = logging.Formatter("%(asctime)s %(message)s", "%Y-%m-%d %H:%M:%S")
log_file.setLevel(0)
log_file.setFormatter(fileformat)

# Handler - 3
stream = logging.StreamHandler()
stream.setLevel(0)
stream.setFormatter(fileformat)

# Adding all handlers to the logs
mylogs.addHandler(log_file)
mylogs.addHandler(stream)

TG_TOKEN = "5742788171:AAHFXeuK7KlWDEFFjqXS5C4DUMMlL5_5hrw"
TG_APP_ID = "24636622"
TG_API_HASH = "061e236ee07c9f7124b50e568e5d5441"
TG_NAME = "cumdesign_bot"

CLIENT = None

""" TG INITIALIZATION """
log_tg = f"[Bot][Telegram] - "
async def TG_init():
    mylogs.info(f"{log_tg} Making Telegram client")
    global CLIENT

    # Create Telegram client
    CLIENT = TelegramClient('CumdesignBot', TG_APP_ID, TG_API_HASH)
    await CLIENT.start(bot_token=TG_TOKEN)

""" 
//...SSSSSSS..........................................
//..SSSSSSSSS.........................................
//..SSSSSSSSSS........................................
//.SSSSS..SSSS...eeeeee..errrrrrrvvv..vvvv..eeeeee....
//.SSSSS........eeeeeeee.errrrrrrvvv..vvvv.eeeeeeee...
//..SSSSSSS....Seee.eeee.errrr..rvvv.vvvv.veee.eeee...
//...SSSSSSSSS.Seee..eeeeerrr....vvvvvvvv.veee..eeee..
//.....SSSSSSS.Seeeeeeeeeerrr....vvvvvvvv.veeeeeeeee..
//........SSSSSSeeeeeeeeeerrr....vvvvvvv..veeeeeeeee..
//.SSSS....SSSSSeee......errr.....vvvvvv..veee........
//.SSSSSSSSSSSSSeee..eeeeerrr.....vvvvvv..veee..eeee..
//..SSSSSSSSSS..eeeeeeee.errr.....vvvvv....eeeeeeee...
//...SSSSSSSS....eeeeee..errr......vvvv.....eeeeee....
"""

states = {}
class State:
    pass
class State_Default(State):
    pass
class State_SendWaiting(State):
    pass
class State_ConfirmPending(State):
    message: str = ""
    def __init__(self, message) -> None:
        super().__init__()
        self.message = message

messages_to_delete = []

log_serve = "[Bot][Serve] - "
async def serve():
    mylogs.info(f"{log_serve} Start serving")
    global CLIENT; global shbank_data

    CLIENT.add_event_handler(tg_handler, events.NewMessage)
    await CLIENT.run_until_disconnected()

async def tg_handler(event):
    global CLIENT

    message = None
    user_id = ""

    if type(event) is NewMessage.Event: 
        message = event.message
        user_id = get_user_obj(message).user_id

    # Get or create state machine
    state = None
    if not user_id in states:
        states[user_id] = State_Default()
    state = states[user_id]

    if type(state) is State_Default:
        # React to commands
        await Command(message)
    if type(state) is State_SendWaiting:
        await c_send_waited(message, get_user_obj(message))
    if type(state) is State_ConfirmPending:
        await c_send_confirmed(message, get_user_obj(message))

async def Command(message):
    mylogs.info(f"{log_serve} Command received \"{message.message}\"")
    # Find command in list
    if "/" in message.message:
        for key, value in COMMANDS.items():
            # There's different pattern for commands in groups
            command = key if not is_chat(message) else f"{key}@{TG_NAME}"
            if command in message.message:
                # Call command
                await value(message, get_user_obj(message))

def is_chat(message):
    if message.from_id is None:
        return False
    return True

def get_user_obj(message):
    if message.from_id is None:
        return message.peer_id 
    return message.from_id

async def get_user(user_obj):
    return await CLIENT.get_entity(user_obj.user_id)

def get_chat_obj(message):
    if hasattr(message, "peer_id"):
        return message.peer_id
    return None


log_command = "[Bot][Command] - "
async def c_start(message, user_id_obj):
    u = await get_user(user_id_obj)
    mylogs.info(f"{log_command} Started for: {u.username}")
    # Add user to data
    if not user_id_obj.user_id in bot_data['subscribed_users']:
        bot_data['subscribed_users'].append(user_id_obj.user_id)
        core_dumpData()
        await c_Reply(message, 'Вы подписались на Cumdesign, ждите спам от старосты!')

async def c_end(message, user_id_obj):
    u = await get_user(user_id_obj)
    mylogs.info(f"{log_command} Ended for: {u.username}")
    # Remove user from data
    if user_id_obj.user_id in bot_data['subscribed_users']:
        bot_data['subscribed_users'].remove(user_id_obj.user_id)
        core_dumpData()
        await c_Reply(message, 'Вы отписались от Cumdesign-рассылки!')

async def c_send(message, user_id_obj):
    if user_id_obj.user_id in bot_data['admins']:
        u = await get_user(user_id_obj)
        mylogs.info(f"{log_command} Waiting message from {u.username}")
        # Change state to 'waiting'
        states[user_id_obj.user_id] = State_SendWaiting()
        to_del = await c_Reply(message, 'Жду инфу, которую нужно разослать!')

        messages_to_delete.append(message)
        messages_to_delete.append(to_del)
    else:
        mylogs.info(f"{log_command} {user_id_obj.user_id} tried to use /send command without rights!!!!")

async def c_send_waited(message, user_id_obj):
    u = await get_user(user_id_obj)
    mylogs.info(f"{log_command} Received message from: {u.username}, waiting for confirmation")  
    msg = message.message

    # Change state to 'confirm pending'
    states[user_id_obj.user_id] = State_ConfirmPending(msg)
    to_del = await c_Reply(message, "Точно отправить?")
    messages_to_delete.append(to_del)

async def c_send_confirmed(message, user_id_obj):
    # Change state to 'default'
    msg = states[user_id_obj.user_id].message
    states[user_id_obj.user_id] = State_Default()

    if "Да".casefold() in message.message.casefold():
        mylogs.info(f"{log_command} Mailing confirmed, mailing started")
        to_del = await c_SendMessage(message, "Рассылка началась!!!")

        messages_to_delete.append(to_del)
        messages_to_delete.append(message)

        mylogs.info(f"{log_command} Mailing started")
        for user in bot_data['subscribed_users']:
            await asyncio.sleep(0.1)
            user_entity = await CLIENT.get_entity(user)
            mylogs.info(f"{log_command} Sending mail to: {user_entity.username}")
            await CLIENT.send_message(user_entity, msg)

        await c_DeleteToDel(message)
    else:
        mylogs.info(f"{log_command} Mailing cancelled")  
        to_del = await c_Reply(message, "Рассылка отменена.")

        messages_to_delete.append(to_del)
        messages_to_delete.append(message)
        await c_DeleteToDel(message)

async def c_DeleteToDel(message):
    await asyncio.sleep(3)
    if is_chat(message):
        return await CLIENT.delete_messages(get_chat_obj(message), messages_to_delete) 
    else:
        return await CLIENT.delete_messages(get_user_obj(message), messages_to_delete) 


async def c_Reply(message, reply):
    if is_chat(message):
        return await CLIENT.send_message(get_chat_obj(message), message=reply, reply_to=message) 
    else:
        return await CLIENT.send_message(get_user_obj(message), message=reply, reply_to=message) 

async def c_SendMessage(message, reply):
    if is_chat(message):
        return await CLIENT.send_message(get_chat_obj(message), message=reply) 
    else:
        return await CLIENT.send_message(get_user_obj(message), message=reply) 


COMMANDS = {
    "/start" : c_start,
    "/end" : c_end,
    "/send" : c_send,
}

"""         
//....CCCCCCC.................................
//...CCCCCCCCC................................
//..CCCCCCCCCCC...............................
//..CCCC...CCCCC...oooooo..rrrrrrre.eeeeee....
//.CCCC.....CCC..ooooooooo.rrrrrrreeeeeeeee...
//.CCCC..........oooo.ooooorrrrr..eeee.eeee...
//.CCCC.........oooo...oooorrrr...eeee..eeee..
//.CCCC.........oooo...oooorrrr...eeeeeeeeee..
//.CCCC.....CCC.oooo...oooorrrr...eeeeeeeeee..
//..CCCC...CCCCCoooo...oooorrrr...eeee........
//..CCCCCCCCCCC..oooo.ooooorrrr...eeee..eeee..
//...CCCCCCCCCC..ooooooooo.rrrr....eeeeeeee...
//....CCCCCCC......oooooo..rrrr.....eeeeee....
"""

log_core = "[Bot][Core] - "

""" DATA """
bot_data = {}
bot_data_path = "bot_data.json"
bot_data_template = {
    "subscribed_users": [],
    "admins": []
}

def core_readData(silent=False):
    if not silent: mylogs.info(f"{log_core} Reading Data")
    global bot_data

    try:
        with open(bot_data_path, "r", encoding='utf8') as data_file:
            bot_data = json.load(data_file)
    except FileNotFoundError:        
        core_makeFile()

    except json.decoder.JSONDecodeError:
        # Make a backup copy of corrupted file
        i = 2
        corrupted_path = bot_data_path.replace('.json', "_corrupted.json")
        if os.path.exists(corrupted_path):
            new_corrupted_path = corrupted_path.replace('_corrupted', f"_corrupted{str(i)}")
            while os.path.exists(new_corrupted_path):
                new_corrupted_path = corrupted_path.replace('_corrupted', f"_corrupted{str(i)}")
                i += 1
            os.rename(bot_data_path, new_corrupted_path)
        else:
            os.rename(bot_data_path, corrupted_path)
        
        # Write over current file
        core_makeFile()

def core_makeFile():
    mylogs.info(f"{log_core} Creating Data File")
    with open(bot_data_path, 'w', encoding='utf8') as data_file:
        json.dump(bot_data_template, data_file, indent=4, ensure_ascii=False)
    core_readData()

def core_dumpData(silent=False):
    if not silent: mylogs.info(f"{log_core} Dumping Data")
    global bot_data
    with open(bot_data_path, "w", encoding='utf8') as data_file:
        json.dump(bot_data, data_file, indent=4, ensure_ascii=False)

""" 
//.MMMMMM...MMMMMM...........iiii.............
//.MMMMMM...MMMMMM...........iiii.............
//.MMMMMM...MMMMMM............................
//.MMMMMMM.MMMMMMM..aaaaaa...iiii.nnnnnnnn....
//.MMMMMMM.MMMMMMM.aaaaaaaa..iiii.nnnnnnnnn...
//.MMMMMMM.MMMMMMMaaaa.aaaaa.iiii.nnnn.nnnnn..
//.MMMMMMMMMMMMMMM....aaaaaa.iiii.nnnn..nnnn..
//.MMMMMMMMMMMMMMM.aaaaaaaaa.iiii.nnnn..nnnn..
//.MMMMMMMMMMMMMMMaaaaaaaaaa.iiii.nnnn..nnnn..
//.MMMM.MMMMM.MMMMaaaa.aaaaa.iiii.nnnn..nnnn..
//.MMMM.MMMMM.MMMMaaaa.aaaaa.iiii.nnnn..nnnn..
//.MMMM.MMMMM.MMMMaaaaaaaaaa.iiii.nnnn..nnnn..
//.MMMM.MMMMM.MMMM.aaaaaaaaa.iiii.nnnn..nnnn..
 """

""" 
# Available commands:
#
# --serve — default bot mod, serving for incoming messages
# -s/--status — check if bot was restricted by the telegram side
# -h/--help — get list of commands
#
 """

log_main = "[Main] - "

async def main(args):
    mylogs.info(f"{log_main} Logging started")
    await TG_init()
    if "--status" in args or "-s" in args:
        me = await CLIENT.get_me()
        mylogs.info(f"{log_main} Restriction status - {me.restricted}")
        if me.restricted:
            mylogs.info(f"{log_main} Restriction reason - {me.restriction_reason}")

    if "serve" in args:
        core_readData()
        await serve()

    mylogs.info(f"{log_main} End of logging")

if __name__ == '__main__':
    if "--help" in sys.argv or "-h" in sys.argv:
        print(
"""Commands:
    serve                   Default bot mode, serving for incoming messages.

Options:
    -s, --status            Check if bot was restricted by the telegram side, if yes - for whatever reason.
    -h, --help              Show help for commands.""")
    else:
        asyncio.run(main(sys.argv))
