from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
load_dotenv()

import asyncio
from browser_use import BrowserConfig,Browser

# Basic configuration
config = BrowserConfig(
    headless=False,
    disable_security=True,
    highlight_elements=False,
    wait_for_network_idle_page_load_time=3.0,
    maximum_wait_page_load_time=5.0
)

browser = Browser(config=config)

llm =  model=ChatOpenAI(
            model= "gpt-4o",
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

asyncio.run(main())