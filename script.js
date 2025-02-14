document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'f') {
        e.preventDefault()

        if(document.getElementsByClassName('main') === false) {
            fetch(chrome.runtime.getURL('index.html'))
            .then(res => res.text())
            .then(html => {
                const searchDiv = document.createElement('div')
                searchDiv.className = 'main'
                searchDiv.innerHTML = html
                document.body.appendChild(searchDiv)

                document.body.style.marginBottom = '150px'

                document.getElementById('btn').addEventListener('click', ()=> {
                    const getInputFromUser = document.getElementById('search-input').value

                    //  Send a POST request to the AI API.
                })
            })
        }
    }
})












// chrome.runtime.onMessage.addEventListener((req, sender, Sendres) => {
//     if(req.action === 'search') {
//         fetch('/url', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer API-KEY' 
//             },
//             body: JSON.stringify({query: req.query})
//         })
//         .then(res => res.json())
//         .then(data => Sendres({result: data.result}))
//         .catch(err => Sendres({result: "Error in fetching..." +  err.message}))
//         return true;
//     }
// })