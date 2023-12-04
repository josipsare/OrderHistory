const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {
   authenticate
} = require('@google-cloud/local-auth');
const {
   google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
   try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
   } catch (err) {
      return null;
   }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
   const content = await fs.readFile(CREDENTIALS_PATH);
   const keys = JSON.parse(content);
   const key = keys.installed || keys.web;
   const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
   });
   await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
   let client = await loadSavedCredentialsIfExist();
   if (client) {
      return client;
   }
   client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
   });
   if (client.credentials) {
      await saveCredentials(client);
   }
   return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getDetails(auth, id) {
   let product = {
      tyre: '',
      supplier: '',
      uf: '',
      date: '',
      arrival: ''

   }
   const gmail = google.gmail({
      version: 'v1',
      auth
   });
   const details = await gmail.users.messages.get({
      userId: 'me',
      id: id
   })

   var obj = {
      name: 'From',
      value: 'Josip Sare <josipsare3@gmail.com>'
   }

   var targeted = JSON.stringify(details.data.payload.headers).includes(JSON.stringify(obj))
   console.log(targeted)
   if (targeted) {
      //console.log((details.data.payload.parts[0].body.data))
      console.log(Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8'))
      product.tyre = Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8')
      product.supplier = Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8')
      product.uf = Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8')
      product.date = Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8')
      product.arrival = Buffer.from((details.data.payload.parts[0].body.data), 'base64').toString('utf8')
   }
   return product

}
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEmails(auth) {
   const list = []

   const gmail = google.gmail({
      version: 'v1',
      auth
   });
   const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: '10'
   });
   const mails = res.data.messages
   console.log("Emails:")
   for (const message of mails) {
      let prod = await getDetails(auth, message.id)
      console.log(prod)
      if (prod.tyre != '')
         list.push(prod)
   }
   console.log("printan listu odavde --------------------------------------")
   console.log(list)
   return list;
};

async function mails() {
   let client = await authorize()
   const list = await listEmails(client)
   console.log("printan listu odavde ----------- u mailsuuuuu---------------------------")
   console.log(list)
   return list
}

module.exports = mails