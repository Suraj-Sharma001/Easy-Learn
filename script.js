document.getElementById('btn').addEventListener('click', async () => {
  const search = document.getElementById('search-input').value
  if(!search){
    console.log('Empty search!!')
    return;
  }

{apiKey}
{api_url}
  const res = await fetch(api_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{text: search}]
      }]
    })
  })

  const result_data = await res.json()

  const output = document.getElementById('output')
  if(result_data && result_data.candidates && result_data.candidates[0].content.parts[0].text) {
    output.innerHTML = result_data.candidates[0].content.parts[0].text
  } else {
    output.innerHTML = "No Result Found!!"
  }
})