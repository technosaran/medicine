// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiResponseTimes: [],
            imageUploadTimes: [],
            renderTimes: [],
            errorCounts: {}
        };
        this.setupMonitoring();
    }

    setupMonitoring() {
        this.monitorAPIPerformance();
        this.monitorRenderPerformance();
        this.monitorErrors();
        this.setupPerformanceReporting();
    }

    monitorAPIPerformance() {
        // Wrap Gemini API calls to measure performance
        const originalSendMessage = window.GeminiHealthAssistant?.prototype.sendMessage;
        if (originalSendMessage) {
            window.GeminiHealthAssistant.prototype.sendMessage = async function(message) {
                const startTime = performance.now();
                try {
                    const result = await originalSendMessage.call(this, message);
                    const endTime = performance.now();
                    window.performanceMonitor?.recordAPIResponse(endTime - startTime, 'text');
                    return result;
                } catch (error) {
                    const endTime = performance.now();
                    window.performanceMonitor?.recordAPIError(error, endTime - startTime);
                    throw error;
                }
            };
        }
    }

    recordAPIResponse(responseTime, type) {
        this.metrics.apiResponseTimes.push({
            time: responseTime,
            type: type,
            timestamp: Date.now()
        });

        // Keep only last 100 measurements
        if (this.metrics.apiResponseTimes.length > 100) {
            this.metrics.apiResponseTimes.shift();
        }

        // Log slow responses
        if (responseTime > 10000) { // 10 seconds
            console.warn(`Slow API response: ${responseTime}ms for ${type}`);
        }
    }

    recordAPIError(error, responseTime) {
        const errorType = error.message.includes('quota') ? 'quota_exceeded' :
                         error.message.includes('key') ? 'invalid_key' :
                         error.message.includes('network') ? 'network_error' : 'unknown';

        this.metrics.errorCounts[errorType] = (this.metrics.errorCounts[errorType] || 0) + 1;
        
        console.error(`API Error (${errorType}): ${error.message} - Response time: ${responseTime}ms`);
    }

    monitorRenderPerformance() {
        // Monitor message rendering performance
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('message-render')) {
                    this.metrics.renderTimes.push({
                        time: entry.duration,
                        timestamp: Date.now()
                    });
                }
            }
        });
        observer.observe({ entryTypes: ['measure'] });
    }

    monitorErrors() {
        window.addEventListener('error', (event) => {
            const errorType = event.error?.name || 'javascript_error';
            this.metrics.errorCounts[errorType] = (this.metrics.errorCounts[errorType] || 0) + 1;
            
            console.error('JavaScript Error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errorCounts['unhandled_promise'] = 
                (this.metrics.errorCounts['unhandled_promise'] || 0) + 1;
            
            console.error('Unhandled Promise Rejection:', event.reason);
        });
    }

    setupPerformanceReporting() {
        // Create performance dashboard
        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.style.display = 'none';
        dashboard.innerHTML = `
            <div class="performance-panel">
                <h3>Performance Metrics</h3>
                <div class="metric-group">
                    <h4>API Performance</h4>
                    <div id="api-metrics"></div>
                </div>
                <div class="metric-group">
                    <h4>Error Counts</h4>
                    <div id="error-metrics"></div>
                </div>
                <div class="metric-group">
                    <h4>System Info</h4>
                    <div id="system-metrics"></div>
                </div>
                <button onclick="window.performanceMonitor.exportMetrics()">Export Metrics</button>
                <button onclick="window.performanceMonitor.clearMetrics()">Clear Metrics</button>
            </div>
        `;
        document.body.appendChild(dashboard);

        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'performance-toggle';
        toggleButton.innerHTML = '📊';
        toggleButton.title = 'Show Performance Metrics';
        toggleButton.onclick = () => this.toggleDashboard();
        document.body.appendChild(toggleButton);

        // Update dashboard periodically
        setInterval(() => this.updateDashboard(), 5000);
    }

    toggleDashboard() {
        const dashboard = document.getElementById('performance-dashboard');
        dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        if (dashboard.style.display === 'block') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        const apiMetrics = document.getElementById('api-metrics');
        const errorMetrics = document.getElementById('error-metrics');
        const systemMetrics = document.getElementById('system-metrics');

        if (!apiMetrics) return;

        // API metrics
        const avgResponseTime = this.metrics.apiResponseTimes.length > 0 ?
            this.metrics.apiResponseTimes.reduce((sum, m) => sum + m.time, 0) / this.metrics.apiResponseTimes.length :
            0;

        apiMetrics.innerHTML = `
            <p>Average Response Time: ${avgResponseTime.toFixed(0)}ms</p>
            <p>Total API Calls: ${this.metrics.apiResponseTimes.length}</p>
            <p>Last Response: ${this.metrics.apiResponseTimes.length > 0 ? 
                this.metrics.apiResponseTimes[this.metrics.apiResponseTimes.length - 1].time.toFixed(0) + 'ms' : 'N/A'}</p>
        `;

        // Error metrics
        errorMetrics.innerHTML = Object.entries(this.metrics.errorCounts)
            .map(([type, count]) => `<p>${type}: ${count}</p>`)
            .join('') || '<p>No errors recorded</p>';

        // System metrics
        systemMetrics.innerHTML = `
            <p>Memory Usage: ${this.getMemoryUsage()}</p>
            <p>Connection: ${navigator.onLine ? 'Online' : 'Offline'}</p>
            <p>User Agent: ${navigator.userAgent.substring(0, 50)}...</p>
        `;
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB / ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`;
        }
        return 'Not available';
    }

    exportMetrics() {
        const metrics = {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemed-performance-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearMetrics() {
        this.metrics = {
            apiResponseTimes: [],
            imageUploadTimes: [],
            renderTimes: [],
            errorCounts: {}
        };
        this.updateDashboard();
    }
}

// Performance dashboard styles
const performanceStyles = document.createElement('style');
performanceStyles.textContent = `
    .performance-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    #performance-dashboard {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #667eea;
        border-radius: 12px;
        padding: 20px;
        z-index: 1001;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .performance-panel h3 {
        color: #667eea;
        margin-bottom: 20px;
        text-align: center;
    }

    .metric-group {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .metric-group h4 {
        color: #333;
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
    }

    .metric-group p {
        margin: 5px 0;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(performanceStyles);

// Initialize performance monitoring
window.performanceMonitor = new PerformanceMonitor();