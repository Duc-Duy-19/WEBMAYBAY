
fetch('html/body/destinations.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('destinations-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading destinations content:', error);
    });

