# 🐾 Nova – Digital Pet Simulator

Nova is a digital pet simulator where a virtual pet’s hunger, happiness, and mood change over time and in response to user interactions like feeding and playing.

The project focuses on clean architecture with backend-driven logic and a modern interactive web UI.

---

## Features

- Time-based hunger and happiness decay  
- Backend-controlled mood system  
- Interactive web UI with animations  
- Sound feedback on user actions  
- Clear separation of frontend and backend  

---

## Tech Stack

- **Backend:** Python, FastAPI  
- **Frontend:** HTML, CSS, Vanilla JavaScript  

---

## Project Structure

backend/ # FastAPI backend
frontend/ # Web UI


---

## Running Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Open frontend/index.html in a browser to use the app.