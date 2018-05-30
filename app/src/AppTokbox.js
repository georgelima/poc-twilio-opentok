import React, { Component } from 'react'
import styled from 'styled-components'
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react'

const URL = 'http://localhost:3000'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const PreviewWrapper = styled.div`
  width: 30%;
`

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      sessionId: null,
      token: null,
      isLoading: true,
    }
  }

  componentDidMount() {
    fetch(`${URL}/token-opentok`)
      .then(res => res.json())
      .then(({ sessionId, token }) =>
        this.setState({ sessionId, token, isLoading: false }),
      )
  }

  render() {
    return this.state.isLoading ? (
      'Loading...'
    ) : (
      <OTSession
        apiKey="46112712"
        sessionId={this.state.sessionId}
        token={this.state.token}
      >
        <OTPublisher />
        <OTStreams>
          <OTSubscriber />
        </OTStreams>
      </OTSession>
    )
  }
}

export default App
