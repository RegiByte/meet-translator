import '../img/get_started16.png'
import '../img/get_started32.png'
import '../img/get_started48.png'
import '../img/get_started128.png'
import messageTypes from "./constants/messageTypes";
import settings from "./constants/settings";
import chunks from "./constants/chunks";
import htmlChunks from "./constants/htmlChunks";
import axios from 'axios'

chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: settings.ALLOWED_HOST}
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}])
	})

	chrome.pageAction.onClicked.addListener(tab => {
		chrome.tabs.query({
			active: true,
			currentWindow: true,
		}, function(tabs) {
			chrome.tabs.executeScript(tabs[0].id, {
				file: chunks.LISTEN_MEET
			}, function() {
				chrome.windows.create({
					url: chrome.runtime.getURL(htmlChunks.POPUP),
					type: 'popup',
					height: 250,
					width: 500
				})
			})
		})
  })

	const ports = []
	const getListenerPort = lookupPorts => lookupPorts.find(port => port.name === "listener")

	chrome.runtime.onConnect.addListener(port => {
		ports.push(port)
		port.onMessage.addListener(async msg => {
			if (msg.type === messageTypes.CAPTIONS_UPDATE && ports.length === 2) {
				const listener = getListenerPort(ports)
				if (!listener) return

        try {
          const {data: {translations}} = await
            axios.post(`https://api.au-syd.language-translator.watson.cloud.ibm.com/instances/ace5a640-bdf6-4aa3-a50b-6a47b4b79d8d/v3/translate?version=2018-05-01`,{
              text: msg.data.map(m => m.phrase),
              source: 'en-us',
              target: 'pt-br'
            }, {
              auth: {
                username: "apiKey",
                password: "BJRJaG3Cm9_I5QTWAyn9iaV_xfER1aOKrvMIqhxkaMwr"
              }
            })

          // translator.translate({
          //   text: msg.data.map(m => m.phrase),
          //   model_id: 'en-us',
          //   target: 'pt-br'
          // })

          listener.postMessage({
            type: messageTypes.CAPTIONS_UPDATE,
            data: msg.data.map(({phrase, ...rest}, index) => {
              return {
                ...rest,
                phrase: translations[index]?.translation || phrase
              }
            })
          })
        } catch(e) {
				  if (e.response) {
				    console.log(e.response.data)
          } else {
				    console.log(e.message)
          }
        }
			}
		})
	})
})
