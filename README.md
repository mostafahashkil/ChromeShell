# Chrome AI Shell

A modern dashboard for exploring and testing Chrome's built-in AI APIs (Gemini nano, LanguageModel, Translator, etc). No external API keys required—everything runs locally in your browser.

## Features
- **API Status Dashboard**: See availability of all supported Chrome AI APIs at a glance.
- **One-click Launch**: Open demo pages for translation, summarization, rewriting, proofing, and more.
- **Theme Support**: Toggle between light and dark mode.
- **Modular UI**: Easily extend with new APIs or features.
- **No Backend Required**: 100% static, works with any static file server.

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd ChromeShell
   ```
2. **Serve the files locally:**
   - With Python:
     ```sh
     python -m http.server 8080
     ```
   - Or with Node.js:
     ```sh
     npx http-server -p 8080
     ```
3. **Open your browser:**
   Go to [http://localhost:8080](http://localhost:8080)

## Project Structure
- `index.html` — Main dashboard UI
- `app.js` — Main application logic
- `*.html` — Demo pages for each API (translator, summarizer, etc)
- `security.js` — Security and CSP logic
- `tailwindcss` — Used via CDN for styling

## Requirements
- Chrome 122+ (for built-in AI APIs)
- No build step required

## Security
- Aggressive Content Security Policy (CSP)
- No external scripts except Tailwind and FontAwesome
- No user data leaves your browser

## License
MIT

## Images

You can add screenshots or diagrams to this section. Place your images in the `images/` folder and reference them like this:

```
![Dashboard Screenshot](images/Homepage.png)
```

Example placeholder (replace with your own image):

![Dashboard Screenshot](images/Homepage.png)

---

**Chrome AI Shell** is built for rapid prototyping and demoing Chrome's on-device AI features. Contributions welcome!
