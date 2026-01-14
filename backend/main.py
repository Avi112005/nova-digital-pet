from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import threading
import time

app = FastAPI(title="Digital Pet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Pet Model (Authoritative)
# ----------------------------

class Pet:
    def __init__(self, name: str):
        self.name = name
        self.hunger = 50        # 0 = full, 100 = starving
        self.happiness = 70     # 0 = depressed, 100 = joyful
        self.last_updated = datetime.utcnow()

    def _apply_time_decay(self):
        now = datetime.utcnow()
        elapsed_minutes = (now - self.last_updated).total_seconds() / 60

        if elapsed_minutes <= 0:
            return

        # Time-based decay (THIS MAKES IT ALIVE)
        self.hunger = min(100, self.hunger + elapsed_minutes * 1.5)
        self.happiness = max(0, self.happiness - elapsed_minutes * 1.0)

        self.last_updated = now

    def feed(self):
        self._apply_time_decay()
        self.hunger = max(0, self.hunger - 25)
        self.happiness = min(100, self.happiness + 5)

    def play(self):
        self._apply_time_decay()

        if self.hunger >= 80:
            return False  # too hungry to play

        self.happiness = min(100, self.happiness + 20)
        self.hunger = min(100, self.hunger + 10)
        return True

    def mood(self):
        # Correct logic: hunger reduces mood
        mood_score = self.happiness - (self.hunger * 0.5)

        if mood_score >= 70:
            return "Delighted"
        if mood_score >= 50:
            return "Content"
        if mood_score >= 30:
            return "Neutral"
        return "Sad"

    def status(self):
        self._apply_time_decay()
        return {
            "name": self.name,
            "hunger": round(self.hunger),
            "happiness": round(self.happiness),
            "mood": self.mood(),
        }


pet = Pet("Nova")

# ----------------------------
# API Endpoints
# ----------------------------

@app.get("/status")
def get_status():
    return pet.status()

@app.post("/feed")
def feed_pet():
    pet.feed()
    return pet.status()

@app.post("/play")
def play_pet():
    success = pet.play()
    data = pet.status()
    data["action_allowed"] = success
    return data