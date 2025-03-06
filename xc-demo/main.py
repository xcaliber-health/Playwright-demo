import uvicorn
import sys
import os
import contextlib


from langchain_openai import ChatOpenAI
from browser_use.agent.service import Agent
from dotenv import load_dotenv
import asyncio
from browser_use import BrowserConfig, Browser
from fastapi import FastAPI


app = FastAPI()

load_dotenv()

import asyncio
from browser_use import BrowserConfig,Browser
from browser_use.browser.context import BrowserContextConfig, BrowserContext

config = BrowserContextConfig(
    wait_for_network_idle_page_load_time=3.0,
    browser_window_size={'width': 1280, 'height': 1100},
    locale='en-US',
    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    highlight_elements=False,
    viewport_expansion=500,
    allowed_domains=['google.com', 'wikipedia.org'],
)

# Basic configuration
browser = Browser()
context = BrowserContext(browser=browser, config=config)

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
    base_url="https://xcaliber-litellm.xcaliberhealth.io/",
    api_key="sk-DTEDkyDf_sUw14xyRrhuGw",
)

async def main():
    print("Starting the application...")
    

@app.post("/start_vnc")
async def start_vnc():
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=llm,
        browser=browser,
    )
    result = agent.run()
    return {"success": True}

@app.get("/hello")
async def hello():
    return {"Hello": "World"}

if __name__ == "__main__":
    try:
        # Run uvicorn for the FastAPI app
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

        # Manage the event loop for asynchronous tasks
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
    finally:
        pending = asyncio.all_tasks(loop)
        for task in pending:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                loop.run_until_complete(task)
        loop.close()
