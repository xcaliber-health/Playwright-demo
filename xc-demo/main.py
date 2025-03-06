import uvicorn
from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import asyncio
from browser_use import BrowserConfig, Browser
from fastapi import FastAPI

load_dotenv()

app = FastAPI()

# Basic configuration
config = BrowserConfig(
    headless=False,
    disable_security=True
)

browser = Browser(config=config)

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
    base_url="https://xcaliber-litellm.xcaliberhealth.io/",
    api_key="sk-DTEDkyDf_sUw14xyRrhuGw",
)

async def main():
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=llm,
        browser=browser,
    )
    result = await agent.run()
    print(result)

@app.post("/start_vnc")
async def start_vnc():
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=llm,
        browser=browser,
    )
    result = await agent.run()
    return {"result": result}

@app.get("/hello")
async def hello():
    return {"Hello": "World"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
