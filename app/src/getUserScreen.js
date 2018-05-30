let roomName

function isFirefox() {
  var mediaSourceSupport = !!navigator.mediaDevices.getSupportedConstraints().mediaSource
  var matchData = navigator.userAgent.match(/Firefox/)
  var firefoxVersion = 0
  if (matchData && matchData[1]) {
    firefoxVersion = parseInt(matchData[1], 10)
  }
  return mediaSourceSupport && firefoxVersion >= 52
}

function isChrome() {
  return 'chrome' in window
}

function canScreenShare() {
  return isFirefox() || isChrome()
}

export default function getUserScreen() {
  var extensionId = 'GEORGE_LIMA'
  if (!canScreenShare()) {
    return Promise.reject("Can't share screen")
  }
  if (isChrome()) {
    return new Promise((resolve, reject) => {
      const request = {
        sources: ['screen'],
      }
      window.chrome.runtime.sendMessage(
        'bodncoafpihbhpfljcaofnebjkaiaiga',
        request,
        // response => {
        console.log,
        // if (response && response.type === 'success') {
        //   resolve({ streamId: response.streamId })
        // } else {
        //   reject(new Error('Could not get stream'))
        // }
        // },
      )
    }).then(response => {
      return navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: response.streamId,
          },
        },
      })
    })
  } else if (isFirefox()) {
    return navigator.mediaDevices.getUserMedia({
      video: {
        mediaSource: 'screen',
      },
    })
  }
}
