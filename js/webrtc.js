class VideoConsultation {
    constructor() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isScreenSharing = false;
        
        // WebRTC configuration
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Control buttons
        document.getElementById('toggleVideo')?.addEventListener('click', () => this.toggleVideo());
        document.getElementById('toggleAudio')?.addEventListener('click', () => this.toggleAudio());
        document.getElementById('shareScreen')?.addEventListener('click', () => this.toggleScreenShare());
        document.getElementById('endCall')?.addEventListener('click', () => this.endCall());
        document.getElementById('joinCall')?.addEventListener('click', () => this.joinCall());
    }

    async initializeMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            this.updateConnectionStatus('Media initialized', 'connected');
            return true;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.updateConnectionStatus('Camera/microphone access denied', 'error');
            return false;
        }
    }

    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.configuration);

        // Add local stream tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, send this to the remote peer via signaling server
                console.log('ICE candidate:', event.candidate);
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            this.updateConnectionStatus(`Connection: ${state}`, 
                state === 'connected' ? 'connected' : 'error');
        };
    }

    async joinCall() {
        const roomId = document.getElementById('roomId').value;
        const patientName = document.getElementById('patientName').value;

        if (!roomId || !patientName) {
            alert('Please enter both Room ID and Patient Name');
            return;
        }

        // Initialize media first
        const mediaInitialized = await this.initializeMedia();
        if (!mediaInitialized) {
            return;
        }

        // Create peer connection
        await this.createPeerConnection();

        // In a real implementation, you would connect to a signaling server here
        // For demo purposes, we'll simulate a connection
        this.simulateConnection();
        
        this.updateConnectionStatus('Joining consultation...', 'connected');
    }

    simulateConnection() {
        // Simulate connection process for demo
        setTimeout(() => {
            this.updateConnectionStatus('Connected to consultation', 'connected');
        }, 2000);
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isVideoEnabled = videoTrack.enabled;
                
                const button = document.getElementById('toggleVideo');
                button.classList.toggle('active', this.isVideoEnabled);
                button.innerHTML = this.isVideoEnabled ? 
                    '<i class="fas fa-video"></i>' : 
                    '<i class="fas fa-video-slash"></i>';
            }
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isAudioEnabled = audioTrack.enabled;
                
                const button = document.getElementById('toggleAudio');
                button.classList.toggle('active', this.isAudioEnabled);
                button.innerHTML = this.isAudioEnabled ? 
                    '<i class="fas fa-microphone"></i>' : 
                    '<i class="fas fa-microphone-slash"></i>';
            }
        }
    }

    async toggleScreenShare() {
        if (!this.isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                if (this.peerConnection) {
                    const sender = this.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        await sender.replaceTrack(videoTrack);
                    }
                }
                
                this.localVideo.srcObject = screenStream;
                this.isScreenSharing = true;
                
                const button = document.getElementById('shareScreen');
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-stop"></i>';
                
                // Handle screen share end
                videoTrack.onended = () => {
                    this.stopScreenShare();
                };
                
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        } else {
            this.stopScreenShare();
        }
    }

    async stopScreenShare() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (this.peerConnection && videoTrack) {
                const sender = this.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            }
            
            this.localVideo.srcObject = this.localStream;
            this.isScreenSharing = false;
            
            const button = document.getElementById('shareScreen');
            button.classList.remove('active');
            button.innerHTML = '<i class="fas fa-desktop"></i>';
        }
    }

    endCall() {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Clear video elements
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        
        // Reset UI
        this.updateConnectionStatus('Call ended', 'error');
        document.getElementById('toggleVideo').classList.remove('active');
        document.getElementById('toggleAudio').classList.remove('active');
        document.getElementById('shareScreen').classList.remove('active');
    }

    updateConnectionStatus(message, type) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-circle"></i> ${message}`;
            statusElement.className = `status ${type}`;
        }
    }

    saveNotes() {
        const notes = document.getElementById('sessionNotes').value;
        const patientName = document.getElementById('patientName').value;
        const timestamp = new Date().toISOString();
        
        const sessionData = {
            patientName,
            notes,
            timestamp
        };
        
        // Save to localStorage (in a real app, this would go to a server)
        const savedSessions = JSON.parse(localStorage.getItem('consultationNotes') || '[]');
        savedSessions.push(sessionData);
        localStorage.setItem('consultationNotes', JSON.stringify(savedSessions));
        
        alert('Notes saved successfully!');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('localVideo')) {
        window.videoConsultation = new VideoConsultation();
        
        // Add save notes functionality
        document.getElementById('saveNotes')?.addEventListener('click', () => {
            window.videoConsultation.saveNotes();
        });
    }
});