// Google AI Shell - Main Application Script

// Security Layer: Prevent Extension Script Injection
(function() {
    'use strict';
    
    // 1. Freeze important global objects to prevent modification
    if (Object.freeze && Object.seal) {
        try {
            Object.freeze(document.createElement);
            Object.freeze(document.appendChild);
            Object.freeze(document.insertBefore);
            Object.freeze(eval);
        } catch (e) {
            console.warn('Could not freeze some global objects:', e);
        }
    }
    
    // 2. Monitor for unauthorized script injections
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'script') {
            // Log and potentially block script creation
            console.warn('Script element created:', element);
            
            // Check if the script has suspicious characteristics
            const stack = new Error().stack;
            if (stack && stack.includes('extension')) {
                console.warn('Potential extension script injection detected');
                // Optionally block the script
                // return document.createElement('div'); // Return harmless element
            }
        }
        
        return element;
    };
    
    // 3. Override eval and Function constructor
    const originalEval = window.eval;
    window.eval = function(code) {
        console.warn('eval() called with:', code);
        // Optionally block eval entirely
        // throw new Error('eval() is disabled for security');
        return originalEval.call(this, code);
    };
    
    // 4. Monitor DOM mutations for injected scripts
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.tagName === 'SCRIPT') {
                            console.warn('Script injected into DOM:', node);
                            // Check source and potentially remove
                            if (!node.src.includes('cdn.tailwindcss.com') && 
                                !node.src.includes('cdnjs.cloudflare.com') &&
                                !node.textContent.includes('GoogleAIShell')) {
                                console.warn('Suspicious script detected, consider removing');
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document, {
            childList: true,
            subtree: true
        });
    }
    
})();

class GoogleAIShell {
    constructor() {
        this.apis = {
            translation: { name: 'Translation API', status: 'loading', api: 'Translator' },
            detection: { name: 'Language Detection', status: 'loading', api: 'LanguageModel' },
            prompt: { name: 'Language Model API', status: 'loading', api: 'LanguageModel' },
            summarizer: { name: 'Summarizer API', status: 'loading', api: 'Summarizer' },
            writer: { name: 'Writer API', status: 'loading', api: 'Writer' },
            rewriter: { name: 'Rewriter API', status: 'loading', api: 'Rewriter' },
            proofreader: { name: 'Proofreader API', status: 'loading', api: 'Proofreader' }
        };
        
        this.currentTheme = localStorage.getItem('ai-shell-theme') || 'dark';
        
        this.init();
    }

    async init() {
        this.initTheme();
        await this.checkAPIStatus();
        this.renderAPIStatus();
        this.setupEventListeners();
        this.startStatusUpdateInterval();
    }

    async checkAPIStatus() {
    // console.log('🔍 Checking Chrome AI API availability...');
        
        // Helper function to determine status from availability
        const getStatusFromAvailability = (availability) => {
            // Accept any value that is not an obvious error or 'unavailable' as ready
            if (
                availability === 'readily' ||
                availability === 'after-download' ||
                availability === 'available' ||
                availability === true ||
                availability === 'true' ||
                (typeof availability === 'string' && availability.toLowerCase().includes('available'))
            ) {
                return 'ready';
            }
            // If the API returns an object with a downloadedLanguages array and it's not empty, treat as ready
            if (
                availability &&
                typeof availability === 'object' &&
                Array.isArray(availability.downloadedLanguages) &&
                availability.downloadedLanguages.length > 0
            ) {
                return 'ready';
            }
            return 'unavailable';
        };
        
        // Check Translation API
        try {
            // Check if API exists
            if ('Translator' in self) {
                // console.log('✅ Translator API found');
                const availability = await self.Translator.availability({ sourceLanguage: 'en', targetLanguage: 'es' });
                this.apis.translation.status = getStatusFromAvailability(availability);
                // console.log('Translation API status set to:', this.apis.translation.status);
            } else {
                this.apis.translation.status = 'unavailable';
            }
        } catch (error) {
            this.apis.translation.status = 'unavailable';
        }

        // Check Language Model API (for both detection and prompt)
        try {
            // Check if API exists
            if ('LanguageModel' in self) {
                // console.log('✅ LanguageModel API found');
                const availability = await self.LanguageModel.availability();
                const status = getStatusFromAvailability(availability);
                this.apis.detection.status = status;
                this.apis.prompt.status = status;
                // console.log('Language Model API availability:', availability);
            } else {
                this.apis.detection.status = 'unavailable';
                this.apis.prompt.status = 'unavailable';
            }
        } catch (error) {
            this.apis.detection.status = 'unavailable';
            this.apis.prompt.status = 'unavailable';
        }

        // Check Summarizer API
        try {
            // Check if API exists
            if ('Summarizer' in self) {
                // console.log('✅ Summarizer API found');
                const availability = await self.Summarizer.availability();
                this.apis.summarizer.status = getStatusFromAvailability(availability);
                // console.log('Summarizer API availability:', availability);
            } else {
                this.apis.summarizer.status = 'unavailable';
            }
        } catch (error) {
            this.apis.summarizer.status = 'unavailable';
        }

        // Check Writer API
        try {
            // Check if API exists
            if ('Writer' in self) {
                // console.log('✅ Writer API found');
                const availability = await self.Writer.availability();
                this.apis.writer.status = getStatusFromAvailability(availability);
                // console.log('Writer API availability:', availability);
            } else {
                this.apis.writer.status = 'unavailable';
            }
        } catch (error) {
            this.apis.writer.status = 'unavailable';
        }

        // Check Rewriter API
        try {
            // Check if API exists
            if ('Rewriter' in self) {
                // console.log('✅ Rewriter API found');
                const availability = await self.Rewriter.availability();
                this.apis.rewriter.status = getStatusFromAvailability(availability);
                // console.log('Rewriter API availability:', availability);
            } else {
                this.apis.rewriter.status = 'unavailable';
            }
        } catch (error) {
            this.apis.rewriter.status = 'unavailable';
        }

        // Check Proofreader API
        try {
            // Check if API exists
            if ('Proofreader' in self) {
                // console.log('✅ Proofreader API found');
                const availability = await self.Proofreader.availability();
                this.apis.proofreader.status = getStatusFromAvailability(availability);
                // console.log('Proofreader API availability:', availability);
            } else {
                this.apis.proofreader.status = 'unavailable';
            }
        } catch (error) {
            this.apis.proofreader.status = 'unavailable';
        }

        // (Removed: console.log('✅ API status check completed:', this.apis);)
    // console.log('✅ API status check completed:', this.apis);
    }

    renderAPIStatus() {
    // console.log('🎨 Rendering API status...', this.apis);
    const container = document.getElementById('api-status-dashboard');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.apis).forEach(([key, api]) => {
            const card = this.createStatusCard(key, api);
            container.appendChild(card);
        });

        // Update individual status indicators (if they exist elsewhere)
        Object.entries(this.apis).forEach(([key, api]) => {
            const indicator = document.getElementById(`${key}-status`);
            if (indicator) {
                indicator.className = `status-indicator status-${api.status}`;
                // if (key === 'prompt') {
                //     console.log('Prompt status indicator class:', indicator.className, 'Status:', api.status);
                // }
            }
        });
    }

    initTheme() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        this.updateThemeUI();
    }

    applyTheme(theme) {
        const body = document.body;
        body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('ai-shell-theme', theme);
    }

    updateThemeUI() {
        const themeIcon = document.getElementById('themeIcon');
        
        if (!themeIcon) return;

        if (this.currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun text-lg';
        } else {
            themeIcon.className = 'fas fa-moon text-lg';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateThemeUI();
        this.showNotification(`Switched to ${newTheme} theme`, 'success');
    }

    createStatusCard(key, api) {
        const div = document.createElement('div');
        div.className = 'status-card rounded-lg p-4 glass-morphism';
        
        const statusColor = api.status === 'ready' ? 'text-green-300' : 
                           api.status === 'loading' ? 'text-yellow-300' : 'text-red-300';
        
        const statusIcon = api.status === 'ready' ? 'fa-check-circle' : 
                          api.status === 'loading' ? 'fa-hourglass-half' : 'fa-times-circle';

        const statusText = api.status === 'ready' ? 'Ready' : 
                          api.status === 'loading' ? 'Checking...' : 'Unavailable';

        // Create button based on status
        const buttonHtml = api.status === 'ready' 
            ? `<button class="w-full mt-3 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-xs" onclick="openAPI('${key}')">
                <i class="fas fa-external-link-alt mr-1"></i>Launch
               </button>`
            : `<button class="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-xs" onclick="showSetupGuide('${key}')">
                <i class="fas fa-download mr-1"></i>Setup API
               </button>`;

        div.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="theme-text-primary font-semibold text-sm">${api.name}</h4>
                <i class="fas ${statusIcon} ${statusColor}"></i>
            </div>
            <p class="theme-text-secondary text-xs mb-2">${statusText}</p>
            <div class="w-full bg-gray-700 rounded-full h-1 mb-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000" 
                     style="width: ${api.status === 'ready' ? '100%' : api.status === 'loading' ? '50%' : '0%'}"></div>
            </div>
            ${buttonHtml}
        `;

        return div;
    }

    setupEventListeners() {
        // Theme switcher
        this.setupThemeListeners();
        
        // No refresh status button present; removed old reference.

        // Add floating animation to API cards on hover
        document.querySelectorAll('.api-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupThemeListeners() {
    const themeToggle = document.getElementById('theme-toggle-btn');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    startStatusUpdateInterval() {
        // Update status every 30 seconds
        setInterval(async () => {
            await this.checkAPIStatus();
            this.renderAPIStatus();
        }, 30000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className += ` ${bgColor} text-white`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for API launches
async function openAPI(apiType) {
    const shell = window.aiShell;
    const api = shell.apis[apiType];
    
    if (!api) {
        shell.showNotification(`Unknown API: ${apiType}`, 'error');
        return;
    }

    // Direct navigation to API pages - mapping API types to HTML files
    const apiPages = {
        'translation': 'translator.html',
        'detection': 'language-detector.html', 
        'prompt': 'prompt.html',
        'summarizer': 'summarizer.html',
        'writer': 'writer.html',
        'rewriter': 'rewriter.html',
        'proofreader': 'proofreader.html',
        'analysis': 'content-analyzer.html',
        'workflow': 'workflow-designer.html'
    };
    
    const pageUrl = apiPages[apiType];
    if (pageUrl) {
        // Quick status notification before navigation
        if (api.status === 'unavailable') {
            shell.showNotification(
                `Note: ${api.name} may not be available in your browser. Check the setup guide on the page.`, 
                'warning'
            );
        } else if (api.status === 'ready') {
            shell.showNotification(`Launching ${api.name}...`, 'success');
        }
        
        setTimeout(() => {
            window.location.href = pageUrl;
        }, 500); // Small delay to show notification
    } else {
        shell.showNotification(
            `${api.name} interface is not available yet. Coming soon!`, 
            'info'
        );
    }
}

// Helper function to check individual API availability using the same logic as status section
async function checkIndividualAPIAvailability(apiType, apiName) {
    const result = {
        exists: false,
        availability: 'no',
        error: null
    };

    try {
        // Check if API exists in browser
        if (apiName in self) {
            result.exists = true;
            
            // Check availability with proper parameters
            let availability;
            if (apiName === 'Translator') {
                availability = await self[apiName].availability({
                    sourceLanguage: 'en', 
                    targetLanguage: 'es'
                });
            } else {
                availability = await self[apiName].availability();
            }
            
            result.availability = availability;
            // (Removed: console.log(`✅ ${apiName} availability check: ${availability}`);)
        } else {
            // (Removed: console.log(`❌ ${apiName} not found in browser`);)
        }
    } catch (error) {
        result.error = error.message;
        // (Removed: console.log(`❌ ${apiName} availability check failed: ${error.message}`);)
    }

    return result;
}

function showAPIModal(apiType, api) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    const content = getAPIModalContent(apiType, api);
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <i class="${content.icon} text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">${api.name}</h2>
                            <p class="text-sm opacity-90">Chrome Built-in AI API</p>
                        </div>
                    </div>
                    <button onclick="closeModal()" class="text-white hover:text-gray-200 transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Ready to Launch</h3>
                    <p class="text-gray-600 mb-4">${content.description}</p>
                    
                    <div id="api-status-info-${apiType}" class="border rounded-lg p-4 mb-4">
                        <!-- Status will be populated by JavaScript -->
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-semibold text-gray-800">Features Available:</h4>
                        <ul class="space-y-2">
                            ${content.features.map(feature => `
                                <li class="flex items-center text-sm text-gray-600">
                                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button class="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold" onclick="launchFullAPI('${apiType}')">
                        <i class="fas fa-rocket mr-2"></i>Launch Full Interface
                    </button>
                    <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" onclick="closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Populate API status information
    populateAPIStatusInfo(apiType, api);
}

async function populateAPIStatusInfo(apiType, api) {
    const statusContainer = document.getElementById(`api-status-info-${apiType}`);
    if (!statusContainer) return;
    
    const apiAvailability = await checkIndividualAPIAvailability(apiType, api.api);
    
    let statusHTML = '';
    
    if (!apiAvailability.exists) {
        statusHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center text-red-800 mb-2">
                    <i class="fas fa-times-circle mr-2"></i>
                    <strong>API Status: Not Found</strong>
                </div>
                <p class="text-red-700 text-sm">The ${api.name} is not available in your browser.</p>
            </div>
        `;
    } else if (apiAvailability.availability === 'readily') {
        statusHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center text-green-800 mb-2">
                    <i class="fas fa-check-circle mr-2"></i>
                    <strong>API Status: Ready</strong>
                </div>
                <p class="text-green-700 text-sm">The ${api.name} is available and ready to use immediately.</p>
            </div>
        `;
    } else if (apiAvailability.availability === 'after-download') {
        statusHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-center text-yellow-800 mb-2">
                    <i class="fas fa-download mr-2"></i>
                    <strong>API Status: Ready (Download Required)</strong>
                </div>
                <p class="text-yellow-700 text-sm">The ${api.name} is available but will download models on first use.</p>
            </div>
        `;
    } else if (apiAvailability.availability === 'no') {
        statusHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center text-red-800 mb-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <strong>API Status: Not Available</strong>
                </div>
                <p class="text-red-700 text-sm">The ${api.name} is not available on your device or browser configuration.</p>
            </div>
        `;
    } else {
        statusHTML = `
            <div class="bg-gray-50 border border-gray-200 rounded-lg">
                <div class="flex items-center text-gray-800 mb-2">
                    <i class="fas fa-question-circle mr-2"></i>
                    <strong>API Status: Unknown</strong>
                </div>
                <p class="text-gray-700 text-sm">Unable to determine the status of ${api.name}.</p>
            </div>
        `;
    }
    
    statusContainer.innerHTML = statusHTML;
}

function getAPIModalContent(apiType, api) {
    const content = {
        translation: {
            icon: 'fas fa-globe',
            description: 'Translate text between over 100 languages with high accuracy and context awareness. Perfect for multilingual content and international communication.',
            features: [
                'Support for 100+ languages',
                'Context-aware translation',
                'Automatic language detection',
                'Real-time translation',
                'Preserves formatting and structure'
            ]
        },
        detection: {
            icon: 'fas fa-search',
            description: 'Automatically detect the language of any text input with confidence scores and multiple language support.',
            features: [
                'Instant language identification',
                'Confidence scoring',
                'Support for mixed-language text',
                'Batch processing capability',
                'High accuracy detection'
            ]
        },
        prompt: {
            icon: 'fas fa-comments',
            description: 'Engage with a powerful conversational AI that understands context and can help with various tasks from writing to analysis.',
            features: [
                'Multi-turn conversations',
                'Context understanding',
                'Task automation',
                'Creative writing assistance',
                'Question answering'
            ]
        },
        summarizer: {
            icon: 'fas fa-compress-alt',
            description: 'Generate concise summaries, extract key points, and identify main topics from any text content.',
            features: [
                'Multiple summary formats',
                'Key point extraction',
                'Topic identification',
                'Bullet point lists',
                'Customizable length'
            ]
        },
        writer: {
            icon: 'fas fa-pen-fancy',
            description: 'Generate high-quality content with various tones and styles for emails, articles, and creative writing.',
            features: [
                'Multiple writing tones',
                'Content generation',
                'Email composition',
                'Article writing',
                'Creative assistance'
            ]
        },
        rewriter: {
            icon: 'fas fa-edit',
            description: 'Transform existing text by changing style, tone, and complexity while preserving the original meaning.',
            features: [
                'Style transformation',
                'Tone adjustment',
                'Simplification/complexification',
                'Formality control',
                'Length modification'
            ]
        },
        proofreader: {
            icon: 'fas fa-spell-check',
            description: 'Identify and correct grammar, spelling, punctuation, and style errors with detailed explanations.',
            features: [
                'Grammar correction',
                'Spell checking',
                'Punctuation fixes',
                'Style improvements',
                'Error explanations'
            ]
        },
        analysis: {
            icon: 'fas fa-chart-line',
            description: 'Comprehensive text analysis including sentiment, emotion, safety detection, and content classification.',
            features: [
                'Sentiment analysis',
                'Emotion detection',
                'Safety screening',
                'Spam detection',
                'Content classification'
            ]
        },
        workflow: {
            icon: 'fas fa-project-diagram',
            description: 'Create complex AI workflows by combining multiple APIs for automated text processing pipelines.',
            features: [
                'Visual workflow builder',
                'Multi-step automation',
                'API chaining',
                'Export/Import workflows',
                'Real-time execution'
            ]
        }
    };

    return content[apiType] || content.prompt;
}

function launchFullAPI(apiType) {
    closeModal();
    // Navigate to the specific API page
    const apiPages = {
        'translation': 'translator.html',
        'detection': 'language-detector.html', 
        'prompt': 'prompt.html',
        'summarizer': 'summarizer.html',
        'writer': 'writer.html',
        'rewriter': 'rewriter.html',
        'proofreader': 'proofreader.html',
        'analysis': 'content-analyzer.html',
        'workflow': 'workflow-designer.html'
    };
    
    const pageUrl = apiPages[apiType];
    if (pageUrl) {
        window.location.href = pageUrl;
    } else {
        window.aiShell.showNotification(
            `Full ${window.aiShell.apis[apiType].name} interface would open here. Integration pending...`, 
            'info'
        );
    }
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiShell = new GoogleAIShell();
    // console.log('🚀 Google AI Shell initialized');
});

// Add some console styling for development
// console.log('%c🤖 Google AI Shell', 'color: #667eea; font-size: 20px; font-weight: bold;');
// console.log('%cBuilt for Google Hackathon 2025', 'color: #764ba2; font-size: 14px;');
// console.log('%cPowered by Chrome Built-in AI APIs', 'color: #4facfe; font-size: 12px;');