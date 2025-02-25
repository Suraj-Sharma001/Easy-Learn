const output = document.getElementById("output");

document.getElementById("btn").addEventListener("click", async () => {
  const search = document.getElementById("search-input").value;
  if (!search) {
    output.innerHTML = "<b style='color: red'>Please enter your query!</b>";
    output.style.display = "block";
    console.log("Empty search!!");
    return;
  } else {
    output.innerHTML = "<span>Searching...</span>";
    output.style.display = "block";
  }

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
    });
  
    const result_data = await res.json();
  
    if (result_data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      output.innerHTML = `<b>${result_data.candidates[0].content.parts[0].text}</b>`;
    } else {
      output.innerHTML = "<b style='color: green'>No Result Found!!</b>";
    }
  } catch (error) {
    output.innerHTML = "<b style='color: red'>Something went wrong, Please try again later!!</b>";
  }
});
