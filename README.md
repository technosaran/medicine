# TeleMed - AI-Powered Telemedicine Platform

A modern telemedicine website powered by Google Gemini AI, featuring AI health assistance, video consultation capabilities, and a lightweight backend API with in-memory storage.

## Features

### 🤖 AI Health Assistant
- **Powered by Google Gemini AI** for intelligent health conversations
- Symptom analysis and health guidance
- Medication information and wellness tips
- Emergency guidance and when to seek professional care
- Conversation history and context awareness

### 📸 Medical Image Analysis
- **AI-powered image analysis** using Gemini Vision capabilities
- Support for X-rays, CT scans, MRI images, lab reports
- Skin condition and medical document analysis
- Detailed observations and abnormality detection
- Specialist recommendations and follow-up guidance
- Downloadable analysis reports

### 📹 Video Consultation
- WebRTC-based video calling
- Screen sharing capabilities
- Audio/video controls
- Session notes and patient management
- Real-time connection status

### 🎨 Modern UI/UX
- Responsive design for all devices
- Professional medical interface
- Smooth animations and transitions
- Accessible and user-friendly

## Quick Start

### 1. Start the Backend Server
```bash
# Install dependencies
npm install

# Start the server
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3000`

### 2. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for use in the application

### 3. Setup the Frontend
1. Open `index.html` in a web browser
2. Navigate to the AI Health Assistant
3. Enter your Gemini API key in the configuration panel
4. Start chatting with the AI health assistant!

### 4. For Video Consultation
1. Navigate to the Video Consultation page
2. Enter a Room ID and Patient Name
3. Allow camera and microphone access
4. Click "Join Consultation" to start

## File Structure

```
telemedicine-app/
├── server.js               # Backend API server (in-memory storage)
├── package.json           # Node.js dependencies
├── index.html             # Main landing page
├── chat.html              # AI-powered chat interface
├── image-analysis.html    # Medical image analysis page
├── consultation.html      # Video consultation room
├── test-api.html         # API testing tool
├── css/
│   └── style.css         # Complete styling
├── js/
│   ├── app.js            # Main application logic
│   ├── gemini.js         # Gemini AI integration
│   ├── image-analysis.js # Image analysis functionality
│   └── webrtc.js         # Video calling functionality
└── README.md             # This file
```

## Configuration

### Gemini API Setup
1. The application stores your API key locally in browser storage
2. Your API key is never sent to any server except Google's Gemini API
3. You can update your API key anytime in the chat interface

### Video Consultation Setup
- Uses WebRTC for peer-to-peer video communication
- Includes STUN servers for NAT traversal
- For production use, consider adding TURN servers for better connectivity

## Usage Examples

### AI Health Assistant
```
User: "I have a headache and feel nauseous. What could this be?"

AI: "Headaches combined with nausea can have several causes:

**Common causes:**
- Tension headaches
- Migraine
- Dehydration
- Stress or lack of sleep

**When to seek immediate care:**
- Severe, sudden headache
- Fever with headache
- Vision changes
- Neck stiffness

I recommend staying hydrated, resting in a quiet, dark room, and monitoring your symptoms. If symptoms worsen or persist, please consult a healthcare professional."
```

### Medical Image Analysis
```
User uploads an X-ray image with question: "Please check this chest X-ray for any abnormalities"

AI: "**Image Analysis - Chest X-ray**

**Observations:**
- Clear lung fields with normal lung markings
- Heart size appears within normal limits
- No obvious masses or consolidations visible
- Bone structures appear intact

**Assessment:**
- The chest X-ray appears to show normal findings
- No immediate abnormalities detected in this view

**Recommendations:**
- This analysis is for informational purposes only
- Always have medical images reviewed by a qualified radiologist
- If you have symptoms, consult with your healthcare provider
- Consider follow-up imaging if clinically indicated

**Important:** This AI analysis cannot replace professional radiological interpretation."
```

### Video Consultation Features
- Toggle video/audio on/off
- Share your screen with the doctor
- Take notes during the consultation
- Save session notes locally

## Security & Privacy

- **API Key Security**: Your Gemini API key is stored locally and only sent to Google's servers
- **In-Memory Storage**: All data is stored in server memory and will be lost when the server restarts
- **No Persistent Database**: No database required - perfect for development and testing
- **Local Notes**: Consultation notes are saved locally in your browser
- **WebRTC Security**: Video calls use encrypted peer-to-peer connections

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11+)
- **Mobile**: Responsive design works on all mobile browsers

## Limitations & Disclaimers

⚠️ **Important Medical Disclaimer**
- This AI assistant provides general health information only
- It cannot replace professional medical advice, diagnosis, or treatment
- Always consult qualified healthcare professionals for medical concerns
- In emergencies, call your local emergency services immediately

### Technical Limitations
- Video calling requires HTTPS in production
- Some features may require camera/microphone permissions
- Internet connection required for AI features

## Development

### Local Development
1. Start the backend server: `npm start` or `npm run dev`
2. Serve frontend files using a local web server (required for some features)
3. For HTTPS (required for camera access), use tools like:
   - `python -m http.server 8000` (then use ngrok for HTTPS)
   - Live Server extension in VS Code
   - Local development servers with SSL certificates

### Customization
- Modify `js/gemini.js` to adjust AI behavior and prompts
- Update `css/style.css` for styling changes
- Extend `js/webrtc.js` for additional video features

## API Usage & Costs

### Gemini API
- Free tier: 15 requests per minute
- Paid tier: Higher rate limits available
- Check [Google AI Pricing](https://ai.google.dev/pricing) for current rates

### Rate Limiting
The application includes basic rate limiting and error handling for the Gemini API.

## Deployment

### Static Hosting
Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### HTTPS Requirement
For production deployment with video features, HTTPS is required for:
- Camera and microphone access
- WebRTC functionality
- Service worker features (if added)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Troubleshooting

### API Connection Issues

If the API test fails, try these steps:

1. **Use the API Test Tool**
   - Open `test-api.html` in your browser
   - Follow the step-by-step testing process
   - Check the browser console for detailed error messages

2. **Common API Issues**
   - **Invalid API Key**: Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Quota Exceeded**: Check your API usage limits
   - **CORS Issues**: Serve files from a local web server (not file://)
   - **Network Issues**: Check your internet connection

3. **API Key Setup**
   - Ensure you're using a valid Gemini API key (not other Google API keys)
   - The key should start with "AIza..."
   - Make sure the key has proper permissions enabled

4. **Browser Console Debugging**
   - Open Developer Tools (F12)
   - Check the Console tab for error messages
   - Look for network errors in the Network tab

### Running Locally

For best results, serve the files using a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then access via `http://localhost:8000`

## Support

For issues and questions:
1. **First**: Use `test-api.html` to diagnose API issues
2. Check the browser console for error messages
3. Ensure your Gemini API key is valid and has quota
4. Verify camera/microphone permissions for video features
5. Test with different browsers if issues persist

---

**Built with ❤️ for accessible healthcare technology**