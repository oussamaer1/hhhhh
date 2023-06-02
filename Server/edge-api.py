# ===========================================
#  This code is part from smabot
#  https://github.com/wildybytes/smabot.git
# ===========================================

# Import required library
from EdgeGPT import Chatbot, ConversationStyle
import json
import asyncio
from flask import Flask, request, jsonify

# create flask app and set bot_instance to none
app = Flask(__name__)
bot_instance = None

# function to create bot instance
def create_instance():
    global bot_instance
    cookies = json.loads(open("./edgegpt.json", encoding="utf-8").read())
    bot_instance = Chatbot(cookies=cookies)

# function to chat with bing
async def chat_async(question):
    answer = await bot_instance.ask(prompt=question, conversation_style=ConversationStyle.balanced, wss_link="wss://sydney.bing.com/sydney/ChatHub")
    bot_instance.last_answer = answer
    result = answer['item']['messages'][1]['text']
    return result

# handle for /chat
@app.route('/chat', methods=['POST'])
def chat():
    question = request.json.get('question')
    loop = asyncio.new_event_loop()
    result = loop.run_until_complete(chat_async(question))
    loop.close()
    return jsonify({'result': result})

# handle for /reset
@app.route('/reset', methods=['POST'])
def reset():
    loop = asyncio.new_event_loop()
    success = loop.run_until_complete(reset_async())
    loop.close()
    if success == "success":
        return jsonify({'result': "success"})
    else:
        return jsonify({'result': "error"})

# function to reset conversation
async def reset_async():
    await bot_instance.close()
    create_instance()
    return "success"

# run program
if __name__ == '__main__':
    create_instance()
    app.run(port=3891)
