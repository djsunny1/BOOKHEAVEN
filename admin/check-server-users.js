// Check if the Node.js server is running and start it if it's not
document.addEventListener('DOMContentLoaded', function() {
    // Function to check if the server is running
    async function checkServer() {
        try {
            const response = await fetch('http://localhost:8002/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Server is running');
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Server is not running:', error);
            return false;
        }
    }
    
    // Function to show server status message
    function showServerStatus(isRunning) {
        const statusElement = document.getElementById('serverStatus');
        if (!statusElement) return;
        
        if (isRunning) {
            statusElement.textContent = 'Server Status: Running';
            statusElement.className = 'server-status server-running';
        } else {
            statusElement.textContent = 'Server Status: Not Running';
            statusElement.className = 'server-status server-not-running';
        }
    }
    
    // Check server status on page load
    checkServer().then(isRunning => {
        showServerStatus(isRunning);
        
        if (!isRunning) {
            // Show a message to the user
            alert('The Node.js server is not running. Please start the server to enable real-time updates to users.\n\nRun this command in the terminal:\nnode backend/server.js');
        }
    });
});
