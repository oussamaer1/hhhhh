# ===========================================
#  This code is part from smabot
#  https://github.com/wildybytes/smabot.git
# ===========================================

# Import required library
import json
import asyncio
from flask import Flask, request, jsonify
from Bard import Chatbot

# Set ur Cookies value
cookies = ""

# create flask app
app = Flask(__name__)

# handle for chat async
async def chat_async(question):
    chatbot = Chatbot(cookies)
    requesttobard = chatbot.ask(question)
    if requesttobard == "":
        return "Bard not return any response"
    else:
        return requesttobard["content"]

# handle for /chat
@app.route('/chat', methods=['POST'])
def chat():
    question = request.json.get('question')
    loop = asyncio.new_event_loop()
    result = loop.run_until_complete(chat_async(question))
    loop.close()
    return jsonify({'result': result})

# run program
if __name__ == '__main__':
    app.run(port=3892)
