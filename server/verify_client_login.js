// Native fetch used in Node 20+

const loginData = {
    projectId: "TEST-VERIFY-985", // The code we created in the previous step
    password: "password123"
};

console.log("Attempting Client Login with:", loginData);

fetch('http://localhost:5000/api/client/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
})
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(result => {
        console.log("---------------------------------------------------");
        console.log("HTTP Status:", result.status);
        console.log("Response Body:", JSON.stringify(result.body, null, 2));
        console.log("---------------------------------------------------");
        if (result.status === 200) {
            console.log("SUCCESS: Client Logged in successfully!");
        } else {
            console.log("FAILURE: Client Login failed.");
        }
    })
    .catch(err => console.error("Network Error:", err));
