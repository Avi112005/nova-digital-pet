class PetApp {
  constructor() {
    this.apiBaseUrl = "http://localhost:8000"
    this.petData = null
    this.syncTimer = null

    // 🎵 Sound (single reusable instance)
    this.meowSound = new Audio("./sounds/meow.mp3")
    this.meowSound.volume = 0.6

    this.cacheElements()
    this.setupEventListeners()
    this.init()
  }

  /* -----------------------------
     Init
  ----------------------------- */

  async init() {
    await this.fetchStatus()
    this.startAutoSync()
  }

  /* -----------------------------
     DOM Caching
  ----------------------------- */

  cacheElements() {
    this.hungerBar = document.getElementById("hunger-bar")
    this.hungerValue = document.getElementById("hunger-value")

    this.happinessBar = document.getElementById("happiness-bar")
    this.happinessValue = document.getElementById("happiness-value")

    this.feedBtn = document.getElementById("feed-btn")
    this.playBtn = document.getElementById("play-btn")

    this.moodIcon = document.querySelector(".mood-icon")
    this.moodText = document.querySelector(".mood-text")

    this.loadingEl = document.getElementById("loading")
  }

  /* -----------------------------
     Events
  ----------------------------- */

  setupEventListeners() {
    this.feedBtn.addEventListener("click", () => this.performAction("feed"))
    this.playBtn.addEventListener("click", () => this.performAction("play"))
  }

  /* -----------------------------
     API Calls
  ----------------------------- */

  async fetchStatus() {
    try {
      this.setLoading(true)

      const res = await fetch(`${this.apiBaseUrl}/status`)
      if (!res.ok) throw new Error("Failed to fetch status")

      const data = await res.json()
      this.updateUI(data)
    } catch (err) {
      console.error(err)
      this.showDisconnectedState()
    } finally {
      this.setLoading(false)
    }
  }

  async performAction(action) {
    try {
      this.disableButtons(true)
      this.setLoading(true)

      const res = await fetch(`${this.apiBaseUrl}/${action}`, {
        method: "POST",
      })

      if (!res.ok) throw new Error(`Failed to ${action}`)

      const data = await res.json()
      this.updateUI(data)

      // 🔊 Play sound only if action is allowed
      if (action === "play" && data.action_allowed === false) {
        this.flashWarning("Too hungry to play 😴")
      } else {
        this.playMeow()
      }
    } catch (err) {
      console.error(err)
      this.showDisconnectedState()
    } finally {
      this.disableButtons(false)
      this.setLoading(false)
    }
  }

  /* -----------------------------
     UI Rendering
  ----------------------------- */

  updateUI(data) {
    this.petData = data

    this.animateProgress(this.hungerBar, data.hunger)
    this.hungerValue.textContent = `${data.hunger}%`

    this.animateProgress(this.happinessBar, data.happiness)
    this.happinessValue.textContent = `${data.happiness}%`

    this.updateMood(data.mood)
  }

  updateMood(mood) {
    const icons = {
      Delighted: "✨",
      Content: "😊",
      Neutral: "😐",
      Sad: "😢",
    }

    this.moodText.textContent = mood
    this.moodIcon.textContent = icons[mood] || "🙂"
  }

  /* -----------------------------
     Animations
  ----------------------------- */

  animateProgress(bar, target) {
    const start = parseFloat(bar.style.width) || 0
    const delta = target - start
    let step = 0
    const steps = 30

    const animate = () => {
      step++
      const value = start + (delta * step) / steps
      bar.style.width = `${value}%`
      if (step < steps) requestAnimationFrame(animate)
    }

    animate()
  }

  flashWarning(text) {
    const original = this.moodText.textContent
    this.moodText.textContent = text
    this.moodText.style.color = "#fca5a5"

    setTimeout(() => {
      this.moodText.style.color = ""
      this.moodText.textContent = original
    }, 1500)
  }

  /* -----------------------------
     Sound
  ----------------------------- */

  playMeow() {
    this.meowSound.currentTime = 0
    this.meowSound.play().catch(() => {
      // autoplay restriction ignored safely
    })
  }

  /* -----------------------------
     Utilities
  ----------------------------- */

  disableButtons(disabled) {
    this.feedBtn.disabled = disabled
    this.playBtn.disabled = disabled
    this.feedBtn.style.opacity = disabled ? "0.5" : "1"
    this.playBtn.style.opacity = disabled ? "0.5" : "1"
  }

  setLoading(show) {
    this.loadingEl.classList.toggle("active", show)
  }

  showDisconnectedState() {
    this.moodIcon.textContent = "⚠️"
    this.moodText.textContent = "Disconnected"
  }

  startAutoSync() {
    this.syncTimer = setInterval(() => {
      this.fetchStatus()
    }, 30000) // sync backend time decay every 30s
  }
}

/* -----------------------------
   Boot
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  new PetApp()
})