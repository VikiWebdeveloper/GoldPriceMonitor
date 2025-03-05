self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    self.clients.claim();
});

// Function to show notification
function showNotification(pricePerOz, pricePerGm, pricePerGMINR, updatedAt) {
    self.registration.showNotification('Gold Price Update', {
        body: `Updated: ${updatedAt}\nPrice (USD/Oz): ${pricePerOz}\nPrice (USD/gm): ${pricePerGm}\nPrice (INR/gm): ${pricePerGMINR}`,
        icon: '/path/to/icon.png' // Optional: Add an icon for the notification
    });
}

// Function to fetch gold price and show notification
async function fetchAndNotify() {
    try {
        var response = await fetch("https://api.gold-api.com/price/XAU");
        var data = await response.json();
        var pricePerOz = data.price;
        var pricePerGm = convertperOzTopergms(pricePerOz);
        var pricePerGMINR = await getPriceInINR(pricePerGm);
        showNotification(pricePerOz, pricePerGm, pricePerGMINR, data.updatedAtReadable);
    } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);
    }
}

// Function to convert ounces to grams
function convertperOzTopergms(oz) {
    return oz / 28.3495;
}

// Function to get price in INR
async function getPriceInINR(dollars) {
    try {
        var response = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json");
        var data = await response.json();
        return dollars * data.usd.inr;
    } catch (error) {
        console.error(`Failed to fetch conversion rate: ${error.message}`);
    }
}

// Set an interval to fetch data and show notification every 10 seconds
setInterval(() => {
    fetchAndNotify();
}, 3*600000); // 10000 milliseconds = 10 seconds
