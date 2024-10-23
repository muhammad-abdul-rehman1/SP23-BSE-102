// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Select all the buttons with the class 'show-description-btn'
    const buttons = document.querySelectorAll('.show-description-btn');

    // Loop through all buttons and attach a click event listener
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Log when the button is clicked
            console.log('Button clicked:', this.innerText);

            // Get the project file from the 'data-project' attribute
            const projectFile = this.getAttribute('data-project');
            const descriptionContainer = this.nextElementSibling;

            // Fetch the content of the project description from the respective .txt file
            fetch(projectFile)
                .then(response => {
                    // Check if the response is ok (status in the range 200-299)
                    if (!response.ok) {
                        throw new Error('Could not load the project description');
                    }
                    return response.text();
                })
                .then(data => {
                    // Display the content inside the description container
                    descriptionContainer.innerHTML = `<p>${data}</p>`;
                })
                .catch(error => {
                    // Display error message if fetching fails
                    descriptionContainer.innerHTML = `<p>Failed to load description: ${error.message}</p>`;
                });
        });
    });
});
