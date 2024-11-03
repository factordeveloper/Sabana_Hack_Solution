document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const messageInput = document.getElementById('message-input');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    const recordButton = document.getElementById('record-button'); // Botón de grabación
    let mediaRecorder;
    let audioChunks = [];

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

    // Grabación de audio
    recordButton.addEventListener('click', async function() {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onload = function() {
                    const message = reader.result; // Aquí puedes procesar el audio si lo necesitas
                    // Convertir audio a texto usando una API o servicio aquí (no incluido)
                    // Llamar a sendUserMessage con el texto resultante
                };
                reader.readAsDataURL(audioBlob);
                audioChunks = []; // Limpiar
            };

            mediaRecorder.start();
            recordButton.textContent = "Detener grabación";
        } else {
            mediaRecorder.stop();
            recordButton.textContent = "Grabar audio";
        }
    });
});
