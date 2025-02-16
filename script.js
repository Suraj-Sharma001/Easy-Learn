console.log("Quick Learn Extension Loaded!");

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "f") {
    // e.preventDefault();

    let main = document.querySelector(".main");

    if (!main) {
      console.log("Fetching HTML from:", chrome.runtime.getURL("index.html")); // Debugging
      fetch(chrome.runtime.getURL("index.html"))
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch HTML: ${res.status} ${res.statusText}`);
          }
          return res.text();
        })
        .then((html) => {
          console.log("Fetched HTML:", html); // Debugging
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const searchDiv = doc.querySelector(".main");
          document.body.appendChild(searchDiv);

          console.log("HTML injected into DOM"); // Debugging

          // Add event listeners after HTML is injected
          document.getElementById("btn").addEventListener("click", async () => {
            console.log("Search Button Clicked");
            const getInputFromUser = document.getElementById("search-input").value;

            if (!getInputFromUser.trim()) {
              document.querySelector(".output").innerHTML = `<p>Please enter a query!</p>`;
              return;
            }

            try {
              const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contents: [
                    { parts: [{ text: getInputFromUser }] }
                  ]
                }),
              });
              const dataFromAPI = await res.json();
              console.log("API Response:", dataFromAPI);
              document.querySelector(".output").innerHTML = `<p>${dataFromAPI.candidates[0].content.parts[0].text}</p>`;
            } catch (err) {
              document.querySelector(".output").innerHTML = `<p>Error: ${err.message}</p>`;
            }
          });

          // Close button functionality
          document.getElementById("close").addEventListener("click", () => {
            console.log("Closing Search Box...");
            searchDiv.remove();
            document.body.style.marginBottom = "0px";
          });
        })
        .catch((err) => {
          console.error("Error fetching or injecting HTML:", err);
        });
    }
  }

});


// console.log("Quick Learn Extension Loaded!");
// document.addEventListener("keydown", (e) => {
//   console.log("Keydown event detected:", e.key);
//   if (e.ctrlKey && e.key.toLowerCase === "f") {
//     // e.preventDefault();

//     let main = document.querySelector(".main")

//     if (!main) {
//       fetch(chrome.runtime.getURL("index.html"))
//         .then((res) => res.text())
//         .then((html) => {
//           const searchDiv = document.createElement("div");
//           searchDiv.className = "main";
//           searchDiv.innerHTML = html;
//           document.body.appendChild(searchDiv);

//           document.body.style.marginBottom = "150px";


//           // search btn functionality
//           document.getElementById("btn").addEventListener("click", async () => {
//             console.log("Search Button Clicked");
//             const getInputFromUser =
//               document.getElementById("search-input").value;

//               if (!getInputFromUser.trim()) {
//                 document.querySelector(".output").innerHTML = `<p>Please enter a query!</p>`;
//                 return;
//               }
//             //  Send a POST request to the AI API.
//             try {
//               const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                   contents : [
//                     {parts: [{text: getInputFromUser}]}
//                   ]
//                 }),
//               });
//               const dataFromAPI = await res.json();
//               console.log("API Response:", dataFromAPI);
//               document.querySelector(
//                 ".output"
//               ).innerHTML = `<p>${dataFromAPI.candidates[0].content.parts[0].text}</p>`;
//             } catch (err) {
//               document.querySelector(
//                 ".output"
//               ).innerHTML = `<p>${err.message}</p>`;
//             }
//           });
//           // use of X button
//           let closeBtn = document.getElementById('close')
//           closeBtn.addEventListener('click', ()=> {
//             console.log("Closing Search Box...");
//             searchDiv.remove()
//             document.body.style.marginBottom = "0px";
//           })
//         });
//     }
//   }
// });
