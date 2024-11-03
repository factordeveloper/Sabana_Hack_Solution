document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const messageInput = document.getElementById('message-input');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    const recordButton = document.getElementById('record-button');
    let recognition; // Variable para SpeechRecognition

    // Toggle chat window
    chatbotToggle.addEventListener('click', function() {
        chatWindow.classList.toggle('show');
    });

    // Close chat
    closeChat.addEventListener('click', function() {
        chatWindow.classList.remove('show');
    });

    // Function to send user message to API
    async function sendUserMessage(message) {
        // Add user message
        addMessage(message, 'user-message');

        // Call API to get response
        const response = await fetch('http://127.0.0.1:8000/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        const botMessage = data.response; // Cambia según la estructura de tu respuesta

        // Add bot response to chat
        addMessage(botMessage, 'bot-message');

        // Reproducir respuesta de voz
        speak(botMessage);
    }

    // Send message on button click
    sendMessage.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message) {
            sendUserMessage(message);
            messageInput.value = '';
        }
    });

    // Add message to chat
    function addMessage(message, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Función para hablar
    function speak(text) {
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
    }

    // Inicializar SpeechRecognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-ES'; // Establecer el idioma
        recognition.interimResults = false; // No resultados intermedios
        recognition.maxAlternatives = 1; // Máximo de alternativas

        recognition.onresult = function(event) {
            const message = event.results[0][0].transcript;
            sendUserMessage(message); // Envía el mensaje reconocido
        };

        recognition.onerror = function(event) {
            console.error('Error en el reconocimiento de voz: ', event.error);
        };
    } else {
        console.warn('Speech Recognition no es soportado en este navegador.');
    }

    // Grabación de audio al hacer clic en el botón
    recordButton.addEventListener('click', function() {
        if (recognition) {
            recognition.start(); // Iniciar reconocimiento
            recordButton.textContent = "Detener grabación";
            recognition.onend = function() {
                recordButton.textContent = "Grabar audio"; // Cambiar el texto al detener
            };
        }
    });
});
