# 📅 APTimetable — Campus Timetable & Classroom Finder

> Modern, minimalist Google Material You (Material 3) timetable viewer and study space finder for APU students.

[![Deploy to GitHub Pages](https://github.com/Kwan-desu/aptimetable/actions/workflows/deploy.yml/badge.svg)](https://github.com/Kwan-desu/aptimetable/actions/workflows/deploy.yml)

---

## 🌟 Key Features

- **🎨 Google Material You Design:**
  - Soft tonal surfaces, rounded containers, and dynamic color palettes:
    - 🔵 **Indigo Material** (Default)
    - 🟢 **Emerald Botanical**
    - 🌸 **Rose Material**
    - 🟠 **Amber Sunset**
    - 🟣 **Violet Lavender**
  - Instant Light / Dark Mode switching with memory.
- **⚡ Smart Gap Finder (Nearest Free Classroom to Wait):**
  - When you have a gap between classes ($\ge 20$ minutes), it parses your previous class location (e.g. `B-05-03`) and detects nearby empty rooms:
    - `Same floor` > `Same building` > `Nearby`.
    - Shows remaining free duration so you always know the closest spot to wait/study.
- **📅 5-Day School Week (MON – FRI):**
  - Automatically navigates to **today's weekday** on launch (defaults to Monday on weekends).
  - Saturday and Sunday completely excluded.
  - Zero horizontal scrolling: responsive 5-column touch grid.
- **📥 Add Week to Calendar (.ics):**
  - Single-tap **"Add Week"** button packages all classes of your selected week into an `.ics` file for Google Calendar, Outlook, or Apple Calendar.
- **🚪 Classroom Finder:**
  - Search any classroom, laboratory, or auditorium.
  - Filters by day, category, and time window presets ("Now +1h", "Morning", "Afternoon").
  - Inspect full daily schedule of any room.
- **💾 Full Persistence Memory:**
  - Remembers your intake code, preferred view mode (Daily / Weekly), group, and theme palette in `localStorage`.

---

## 🚀 Live Demo on GitHub Pages

This repository is configured with automated GitHub Actions to deploy to **GitHub Pages**:
- URL: `https://<your-username>.github.io/aptimetable/`

To enable GitHub Pages in your repository:
1. Go to **Settings** > **Pages**
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**
3. Push to `main` and your site is live!

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/Kwan-desu/aptimetable.git

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
