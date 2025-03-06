import os
import platform
import subprocess
from fastapi import FastAPI

app = FastAPI()
@app.post("/start_vnc")
async def start_vnc():
    # system = platform.system()
    # if system == "Windows":
    #     # Start VNC server on Windows
    #     subprocess.Popen(["C:\\Path\\To\\TightVNC\\tvnserver.exe", "-run"])
    #     # Start Websockify on Windows
    #     subprocess.Popen(["websockify", "--web", ".", "6080", "localhost:5900"])
    # elif system == "Linux":
    #     # Start VNC server on Linux
    #     subprocess.Popen(["vncserver", ":1"])
    #     # Start Websockify on Linux
    #     subprocess.Popen(["websockify", "--web", ".", "6080", "localhost:5901"])
    return {"url": "http://localhost:6080/vnc.html"}

@app.post("/stop_vnc")
async def stop_vnc():
    # system = platform.system()
    # if system == "Windows":
    #     # Stop VNC server on Windows
    #     subprocess.Popen(["taskkill", "/IM", "tvnserver.exe", "/F"])
    # elif system == "Linux":
    #     # Stop VNC server on Linux
    #     subprocess.Popen(["vncserver", "-kill", ":1"])
    return {"message": "VNC server stopped"}

if __name__ == "__main__":
    import uvicorn
