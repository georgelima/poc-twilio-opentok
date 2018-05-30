import React, { Component } from 'react'
import Video from 'twilio-video'
import styled from 'styled-components'

import getUserScreen from './getUserScreen'

import './index.css'

const URL = 'http://localhost:3000'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f3f4f7;
  background-size: cover;
  padding: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`

const RoomNameInput = styled.input`
  padding: 10px;
  background: none;
  border: 3px solid #7d3f98;
  border-radius: 5px;
  outline: none;
  width: 250px;
  margin-right: 10px;
`

const CreateRoomButton = styled.button`
  padding: 10px;
  color: white;
  background-color: #7d3f98;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f47721;
  }
`

const TracksWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-left: 10px;

  video {
    max-width: 250px;
    height: auto;
    margin-left: 5px;
  }
`

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      identity: null,
      token: null,
      roomName: '',
      isInRoom: false,
      activeRoom: null,
      localMedia: null,
      tracks: [],
      rooms: [],
      isLoading: false,
    }

    this.localTrackRef = React.createRef()
    this.remoteTrackRef = React.createRef()
  }

  componentDidMount() {
    fetch(`${URL}/token`)
      .then(result => result.json())
      .then(({ identity, token }) => {
        this.setState({
          identity,
          token,
        })
      })
      .catch(error => console.info(error))

    fetch(`${URL}/rooms`)
      .then(result => result.json())
      .then(rooms => this.setState({ rooms }))
      .catch(error => console.info(error))
  }

  joinRoom(room) {
    this.setState({ isLoading: true })

    const roomName = room || this.state.roomName

    if (!roomName) return alert('Please enter the room name')

    Video.connect(this.state.token, {
      name: roomName,
    }).then(
      async room => {
        this.setState({
          activeRoom: room,
          isInRoom: true,
          localMedia: true,
          rooms: this.state.rooms.filter(room => room !== roomName).concat(roomName),
        })

        this.onParticipantConnect(room.localParticipant)

        room.participants.forEach(participant => this.onParticipantConnect(participant))
        room.on('participantConnected', participant =>
          this.onParticipantConnect(participant),
        )

        room.on('participantDisconnected', participant =>
          this.onParticipantDisconnect(participant),
        )
        room.once('disconnected', error =>
          room.participants.forEach(participant =>
            this.onParticipantDisconnect(participant),
          ),
        )

        this.setState({ isLoading: false })
      },
      error => console.log(error),
    )
  }

  leaveRoom() {
    this.onParticipantDisconnect(this.state.activeRoom.localParticipant)
    this.state.activeRoom.disconnect()
    this.setState({ isInRoom: false, localMedia: false })
  }

  onParticipantConnect(participant) {
    const div = document.createElement('div')
    div.id = participant.sid

    participant.on('trackAdded', track => this.onTrackAdded(div, track))
    participant.tracks.forEach(track => this.onTrackAdded(div, track))
    participant.on('trackRemoved', this.onTrackRemoved)

    document.getElementById('tracksWrapper').appendChild(div)
  }

  onParticipantDisconnect(participant) {
    participant.tracks.forEach(this.onTrackRemoved)
    document.getElementById(participant.sid).remove()
  }

  onTrackAdded(div, track) {
    div.append(track.attach())
  }

  onTrackRemoved(track) {
    track.detach().forEach(element => element.remove())
  }

  render() {
    return (
      <Container>
        <div>
          <RoomNameInput
            onChange={evt => this.setState({ roomName: evt.target.value })}
            placeholder="Room name"
          />
          {this.state.isLoading ? (
            <CreateRoomButton disabled>Loading</CreateRoomButton>
          ) : this.state.isInRoom ? (
            <CreateRoomButton onClick={() => this.leaveRoom()}>Leave</CreateRoomButton>
          ) : (
            <CreateRoomButton onClick={() => this.joinRoom()}>Join</CreateRoomButton>
          )}
        </div>
        <TracksWrapper id="tracksWrapper" />
      </Container>
    )
  }
}

export default App
