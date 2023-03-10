const axios = require('axios');
const axiosRateLimit = require('axios-rate-limit');
const fs = require('fs');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarypY0ZR04TrrTRUxDC',
  'Accept': '*/*',
  'Origin': 'https://github.com',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  'Accept-Language': 'en-US,en;q=0.9',
};

const limitedAxios = axiosRateLimit(axios.create(), {
  maxRequests: 30,
  perMilliseconds: 60 * 1000,
});

const platforms = {
  'github': 'https://github.com/',
};

async function checkUsernameAvailability(platform, username) {
  try {
    await limitedAxios.get(`${platforms[platform]}${username}`, { headers });
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return true;
    } else if (error.response && error.response.status === 429) {
      console.log("Too Many Requests - Sleeping");
      await new Promise(resolve => setTimeout(resolve, 10000));
      return false;
    } else {
      console.log(`Unknown Error: ${error.response.status}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return false;
    }
  }
}

async function main() {
  const usernames = fs.readFileSync('./wordlists/englishlowercase.txt', 'utf-8').split('\n');
  for (const platform in platforms) {
    fs.appendFileSync('./results.txt', `####${platform.toUpperCase()}####\n`);
    for (const username of usernames) {
      if (username.length >= 2 && username.length <= 8 
        && !username.includes("'") 
        && !username.includes(".") 
        && !username.includes("/") 
        && !username.includes("-")
        && !username.includes(" ")
        && !/\d/.test(username)) {
        const isAvailable = await checkUsernameAvailability(platform, username);
        if (isAvailable) {
          fs.appendFileSync('./results.txt', `${username}\n`);
        }
      }
    }
  }
}

main();
