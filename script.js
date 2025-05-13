const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainer = document.querySelector(".chats");
const suggestionItems = document.querySelector(".suggests__item");

const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById(".deleteButton");

// State Variables

let currentUserMessage = null;
let isGeneratingResponse = false;

const GOOGLE_API_KEY = "AIzaSyCgNrHM_iw8-n5D9nC5nXBs6KifJza7tuE";
const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;

// load saved data from local storage

const loadSavedChatHistory = () => {
    const savedConversations = JSON.parse(localStorage.getItem("saved-api-chats")) || [];
    const isLightTheme = localStorage.getItem("theme-color") === "light_mode";

    document.body.classList.toggle("light_mode", isLightTheme);
    themeToggleButton.innerHTML = isLightTheme ? '<i class="bx bx-moon"></i>' : '<i class="bx bx-sun"></i>';

    chatHistoryContainer.innerHTML = '';

    // Iterate through saved chat  history and display messages
    savedConversations.forEach(conversation => {
        // Display the user's message
        const userMessageHtml = `

            <div class="message__content">
                <img class="message__avatar" src="assets/profile.png"
                alt="User avatar">
                <p class="message__text">${conversation.userMessage}</p>
            </div>
        
        `;

        const outgoingMessageElement = createChatMessageElement
        (userMessageHtml, "message--outgoing");
        chatHistoryContainer.appendChild(outgoingMessageElement);

        // Display Api Response
        const responseText = conversation.apiResponse?.candidates?.[0]?.
        content?.parts?.[0]?.text;

        const parsedApiResponse = marked.parse(responseText); // Convert to HTML

        const rawApiResponse = responseText; // Plain text version

        const responseHtml = `
        
            <div class="message__content">
                <img class="message__avatar" src="assets/gemini.svg"
                alt="Gemini avatar">
                <p class="message__text"></p>
                <div class="message__loading-indicator hide">
                    <div class="message__loading-bar"></div>
                    <div class="message__loading-bar"></div>
                    <div class="message__loading-bar"></div>
                </div>
            </div>
            <span onClick="copyMessageToClipboard(this)"
            class="message__icon hide"><i class='bx bx-copy-alt'></i></
            span>
        
        `;

        const incomingMessageElement = createChatMessageElement
        (responseHtml, "message-incoming");
        chatHistoryContainer.appendChild(incomingMessageElement);

        const messageTextElement = incomingMessageElement.querySelector
        (".message__text");


        // Display saved chat without typing effect
        showTypingEffect(rawApiResponse, parsedApiResponse,
        messageTextElement, incomingMessageElement, true); // true

    });

    document.body.classList.toggle("hide-header", savedConversations.
    lenght > 0);
};

// create new chat message element
const createChatMessageElement = a(htmlContent, ...cssClass) => {
    const messageElement  = document.createElement("div");
    messageElement.classList.add("message", ...cssClass);
    messageElement.innerHTML = htmlContent;
    return messageElement;
};

// Show typing effect
const showTypingEffect = (rawText, htmlText, messageElement,
incomingMessageElement, skipEffect = false) => {
    const copyIconElement = incomingMessageElement.querySelector(".message__icon");
    copyIconElement.classList.add("hide"); // Initially

    if(skipEffect){
        messageElement.innerHTML = htmlText;
        hljs.highlightAll();
        addCopyButtonToCodeBlocks();
        copyIconElement.classList.remove("hide");
        isGeneratingResponse = false;
        return;
    }

    const wordsArray = rawText.split(' ');
    let wordIndex = 0;

    const typingInterval = setInterval(()=> {
        messageElement.innerHTML += (wordIndex === 0 ? '' : ' ') + 
        wordsArray[wordIndex++];
        if(wordIndex === wordsArray.lenght){
            clearInterval(typingInterval);
            isGeneratingResponse = false;
            messageElement.innerHTML = htmlText;
            hljs.highlightAll();
            addCopyButtonToCodeBlocks();
            copyIconElement.classList.remove("hide");
        }
    }, 75);
};


