const axios = require('axios')

axios.post(`https://api.au-syd.language-translator.watson.cloud.ibm.com/instances/ace5a640-bdf6-4aa3-a50b-6a47b4b79d8d/v3/translate?version=2018-05-01`,{
  text: ['Good morning friend', 'good morning miss, how are you doing?'],
  source: 'en-us',
  target: 'pt-br'
}, {
  auth: {
    username: "apiKey",
    password: "BJRJaG3Cm9_I5QTWAyn9iaV_xfER1aOKrvMIqhxkaMwr"
  }
})
