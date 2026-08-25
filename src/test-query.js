// test-query.js
const mongoose = require('mongoose');
const { filterByQuery } = require('./controller/taskController'); // Imported here

async function testController() {
    try {
        await mongoose.connect("mongodb://localhost:27017/taskM");
        console.log("🛠️  Test script connected to MongoDB.");

        const mockReq = {
            query: {
                status: 'pending',     
                priority: 'high',
                searchData: ''         
            }
        };

        const mockRes = {
            statusCode: 200,
            status: function(code) {
                this.statusCode = code;
                return this; 
            },
            json: function(data) {
                console.log(`\n📬 Response Received (Status Code: ${this.statusCode}):`);
                console.log(JSON.stringify(data, null, 2));
                
                mongoose.connection.close();
                process.exit(0);
            }
        };

        console.log("🏃 Executing controller function...");
        
        // FIX: Changed from filterBystatusAndprority to filterByQuery to match your import!
        await filterByQuery(mockReq, mockRes);

    } catch (error) {
        console.error("❌ Test Script Error:", error);
        mongoose.connection.close();
    }
}

testController();

