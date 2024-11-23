const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const sendButton = document.getElementById("send-button");

// Function to add a message to the chat
function addMessage(content, sender, type = "text") {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  if (type === "text") {
    messageElement.textContent = content;
  } else if (type === "image") {
    const img = document.createElement("img");
    img.src = content;
    img.alt = "Image";
    img.style.maxWidth = "60%";
    messageElement.appendChild(img);
  } else if (type === "video") {
    const video = document.createElement("video");
    video.src = content;
    video.controls = true;
    video.style.maxWidth = "100%";
    messageElement.appendChild(video);
  } else if (type === "link") {
    const link = document.createElement("a");
    link.href = content;
    link.textContent = content;
    link.target = "_blank";
    messageElement.appendChild(link);
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message to the chatbot
function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Add user message to chat
  addMessage(message, "user");

  // Clear input field
  userInput.value = "";

  // Send message to Rasa server
  fetch("http://localhost:5005/webhooks/rest/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sender: "user", message: message }),
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((response) => {
        // Check if the response contains an image, video, or link
        if (response.text) {
          addMessage(response.text, "bot", "text");
        }
        if (response.image) {
          addMessage(response.image, "bot", "image");
        }
        if (response.video) {
          addMessage(response.video, "bot", "video");
        }
        if (response.link) {
          addMessage(response.link, "bot", "link");
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      addMessage("Error connecting to bot!", "bot", "text");
    });
}

// Event listener for send button
sendButton.addEventListener("click", sendMessage);

// Event listener for Enter key
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
