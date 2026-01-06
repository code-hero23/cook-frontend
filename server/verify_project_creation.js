const postData = {
    name: "Test Project verification",
    projectCode: "TEST-VERIFY-" + Math.floor(Math.random() * 1000), // Randomize to avoid unique constraint error
    clientFirstName: "Test",
    clientLastName: "Client",
    clientEmail: "test.client@example.com",
    clientPhone: "9876543210",
    clientPassword: "password123",
    location: "Test Site Location",
    budget: 500000.00,
    handingOverMonth: "December",
    handingOverYear: "2025",
    startDate: new Date().toISOString(),
    status: "ONGOING"
};

console.log("Sending payload:", JSON.stringify(postData, null, 2));

fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
})
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(result => {
        console.log("---------------------------------------------------");
        console.log("HTTP Status:", result.status);
        console.log("Response Body:", JSON.stringify(result.body, null, 2));
        console.log("---------------------------------------------------");
        if (result.status === 201) {
            console.log("SUCCESS: Project created successfully!");
        } else {
            console.log("FAILURE: Project creation failed.");
        }
    })
    .catch(err => console.error("Network Error:", err));
