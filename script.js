const output = document.getElementById("output")
const searchInput = document.getElementById("search-input")
const btn = document.getElementById("btn")
const bot = document.getElementById("bot")

// function to add message to the chat
function addMessage(content, isUserPre = false) {
  const msg = document.createElement("div")
  msg.style.padding = "10px"
  msg.style.margin = "5px 0"
  msg.style.borderRadius = "8px"
  msg.style.fontSize = "14px"
  msg.style.wordWrap = "break-word"

  if (isUserPre) {
    msg.style.background = "rgba(0, 255, 0, 0.2)"
    msg.style.textAlign = "right"
  } else {
    msg.style.background = "rgba(255, 255, 255, 0.1)"
    msg.style.textAlign = "left"
  }

  msg.innerHTML = content
  output.appendChild(msg)
  output.scrollTop = output.scrollHeight // Auto-scroll
}


// function to send message to the chat
async function sendMessage() {
  const search = searchInput.value.trim()
  if(search == false) {
    addMessage("<b style='color: red'>Please enter your query!</b>")
    return
  }


addMessage(search, true)
searchInput.value = ""

// show the loading message
addMessage("<h3>Searching...</h3>")

  const apiKey = ""
  const api_url = ``

  try {
    const res = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: search }],
          },
        ],
      }),
    })

    const result_data = await res.json()
        output.lastChild.innerHTML = result_data?.candidates?.[0]?.content?.parts?.[0]?.text || "<i>No response found.</i>"
    } catch (error) {
        output.lastChild.innerHTML = "<b style='color: red'>Error! Try again.</b>"
    }
}

// Handle button click
btn.addEventListener("click", sendMessage)

// Handle "Enter" key press
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage()
})


// Close chatbot on "X" key press
document.addEventListener("keydown", function (event) {
  if (event.key === "x" || event.key === "X") {
      bot.style.display = "none"; // Hides chatbot when "X" is pressed
  }
})