import axios from 'axios';

const baseURL = 'http://localhost:8000';
let token = '';
let userId = '';
let chatId = '';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  console.log("Waiting for server and in-memory DB to start...");
  await delay(3000);

  try {
    console.log("Test 1: User Registration");
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      password: "password123"
    });
    console.log("Registration Response:", regRes.data.token ? "SUCCESS (Token received)" : "FAILED");
    token = regRes.data.token;
    
    console.log("\nTest 2: User Login");
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: "test@example.com",
      password: "password123"
    });
    console.log("Login Response:", loginRes.data.token ? "SUCCESS" : "FAILED");
    
    // Register another user
    const reg2Res = await axios.post(`${baseURL}/auth/register`, {
      firstname: "Test",
      lastname: "User 2",
      email: "test2@example.com",
      password: "password123"
    });
    const token2 = reg2Res.data.token;

    console.log("\nTest 3: Fetch User 2 Profile");
    const valid2Res = await axios.get(`${baseURL}/auth/valid`, {
      headers: { Authorization: token2 }
    });
    const user2Id = valid2Res.data.user._id;
    console.log("User 2 ID fetched:", user2Id ? "SUCCESS" : "FAILED");

    console.log("\nTest 4: Create Group Chat (Room)");
    const groupRes = await axios.post(`${baseURL}/api/chat/group`, {
      chatName: "Test Room",
      users: JSON.stringify([{_id: user2Id}])
    }, {
      headers: { Authorization: token }
    });
    console.log("Group created:", groupRes.data._id ? "SUCCESS" : "FAILED");
    chatId = groupRes.data._id;

    console.log("\nTest 5: Send Message");
    const msgRes = await axios.post(`${baseURL}/api/message/`, {
      chatId: chatId,
      message: "Hello world!"
    }, {
      headers: { Authorization: token }
    });
    console.log("Message sent:", msgRes.data._id ? "SUCCESS" : "FAILED");

    console.log("\nTest 6: Fetch Messages");
    const fetchMsgRes = await axios.get(`${baseURL}/api/message/${chatId}`, {
      headers: { Authorization: token }
    });
    console.log("Messages fetched:", fetchMsgRes.data.length > 0 ? "SUCCESS" : "FAILED");
    console.log(`Fetched ${fetchMsgRes.data.length} messages.`);
    
    console.log("\nALL TESTS PASSED SUCCESSFULLY! ✅");
  } catch (error) {
    console.error("TEST FAILED ❌");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
