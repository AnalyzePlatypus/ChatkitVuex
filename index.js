/*

# Wraps the entire Pusher Chatkit API in a nice Vuex module that can be watched

User 
  id
  name
  avatarURL
  custom_data
  presence

Room
  `id` int	The global identifier for the room on the instance.
  `isPrivate`	bool	If true the room is private, otherwise the room is public.
  `name`	string	The human readable name of the room (this needn’t be unique!)
  `users`	array	An array of all the users that are members of this room. Only accessible when subscribed to the room. See Users.
  `customData`

Message
  id
  text
  attachment
  sender
  room
  createdAt
  updatedAt

Cursor
  position
  updatedAt
  room
  user
  type

Presence
  "online", "offline", or "unknown"
*/


const state = {
  tokenProvider: undefined,
  currentUser: undefined,
  isConnected: false,
  currentRooms: undefined, // TODO
  typingUsers: []
}

const getters = {
  users: state => state.currentUser.users,
  usersInRoom: state => roomId => state.currentUser.rooms[roomId].users, // ???
  rooms: state => state.currentUser.rooms, // Needs Better name 'The rooms that the connected user is a member of. '
  roomSubscriptions: state => state.currentUser.roomSubscriptions, // The union of all the members of all the rooms that the current user is subscribed to.
  fellowUsers: state => state.currentUser.users,
  userPresences: (state, getters) => getters.fellowUsers.map(user => user.presence)
}

const mutations = {
  setTokenManager: (state, tokenManager) => {
    state.tokenManager = tokenManager;
  },
  setCurrentUser: (state, currentUserObject) => {
    state.currentUser = currentUserObject;
  },
  setUserPresence: (state, userId, presence) => {
    // TODO
  }
}

const actions = {
  /**
   * @function init
   * Initialize Chatkit
   * @param {object} options - Options object
   * @param {string} options.instanceLocator -
   * @param {integer} options.userId - 
   * @param {integer} [options.connectionTimeout] - 
   * @param {Logger} [options.logger] - 
   */
  connect: ({state}, {instanceLocator, userId, logger, connectionTimeout}) => {
    if(!state.tokenProvider) throw "Token Provider must be configured before connecting. (Set a provider with `setTokenProvider` first)"
    return new ChatManager({
      instanceLocator,
      userId,
      tokenProvider: state.tokenProvider,
      logger,
      connectionTimeout,
      onAddedToRoom:        room        => dispatch('_addedToRoom', room),
      onRemovedFromRoom:    room        => dispatch('_removedFromRoom', room),
      onRoomUpdated:        room        => dispatch('_roomUpdated', room),
      onRoomDeleted:        room        => dispatch('_roomDeleted', room),
      onUserStartedTyping: (room, user) => dispatch('_userStartedTyping', room, user),
      onUserStoppedTyping: (room, user) => dispatch('_userStoppedTyping', room, user),
      onUserJoinedRoom:    (room, user) => dispatch('_userJoinedRoom', room, user),
      onUserLeftRoom:      (room, user) => dispatch('_userLeftRoom', room, user),
      onNewReadCursor:     (cursor)     => dispatch('newReadCursor', cursor),
      onPresenceChanged:   (newPresenceState, user) => dispatch('_userPresenceChanged', newPresenceState, user),
    }).
    connect(userObject => {
      commit('setCurrentUser', userObject)
    });
  },

  /**
   * @function setTokenProvider
   * Initialize Chatkit
   * @param {object} options
   * @param {string} options.url - The URL that the ChatManager should make a POST request to in order to fetch a valid token. This will be either the test token provider or your own custom auth endpoint. See https://docs.pusher.com/chatkit/core-concepts#token-provider and https://docs.pusher.com/chatkit/reference/javascript#tokenprovider-arguments
   * @param {object} [options.queryParams] - An object of key–value pairs to be passed as query parameters along with the token request.
   * @param {object} [options.headers] - An object of key–value pairs to be passed as headers along with the token request.
   * @param {boolean} [options.useCredentials] - Whether to make requests with credentials, defaults to false.
   */
  setTokenProvider: ({commit}, {url, queryParams, headers, useCredentials}) => {
    const tokenProvider = new TokenProvider({
     url,
     queryParams,
     headers,
     withCredentials: useCredentials
    })
    commit('setTokenProvider', tokenProvider)
  },

  /**
   * @function disconnectAllSubscriptions
   * Disconnect from server (close all connections, cancels server hook descriptions, and marks the user as offline).
   * (Call when you're done with the chat, in your `destroyed` component hook, for example)
   */
  disconnectAllSubscriptions: ({state}) => {
    state.currentUser.disconnect()
  },

  // These are all internal callbacks

  // Room Callbacks

  _roomUpdated: ({state}, room) => {
    // TODO
    console.log(`Removed from room ${room.id}`);
  },

  _roomDeleted:     ({state}, room) => { console.log(`Room deleted ${room.id}`); },     // Not relevant (at the moment :) 
  _removedFromRoom: ({state}, room) => { console.log(`Removed from room ${room.id}`); },// Not relevant (at the moment :) 
  _addedToRoom:     ({state}, room) => { console.log(`Added to room ${room.id}`); },    // Not relevant (at the moment :) 
  

  // User Callbacks
  _userStartedTyping: ({state}, room, user) => {
    state.typingUsers.push(user.id);
  },
  _userStoppedTyping: ({state}, room, user) => {
    const index = state.typingUsers.findIndex(user.id);
    state.typingUsers[index] = undefined;
  },

  _userJoinedRoom: ({state}, room, user) => {}, // Not relevant (at the moment :) 
  _userLeftRoom: ({state}, room, user) => {},   // Not relevant (at the moment :) 

  _userPresenceChanged: ({state}, newPresenceState, user) => {
    // TODO
  },
  _setNewReadCursor: ({state}, newCursor) => {
    // TODO
  },


  // Joining current user to rooms
  joinRoom({state}, { roomId }) {
    return state.currentUser.joinRoom({ roomId });
  },

  leaveRoom({state}, { roomId}) {
    return state.currentUser.leaveRoom({ roomId });
  },

  getJoinableRooms: ({state}) => {
    return state.currentUser.getJoinableRooms();
  },
  

  subscribeToRoom({dispatch}, { roomId, messageLimit, hooks }){
    return state.currentUser.subscribeToRoom({
      roomId, 
      messageLimit, 
      hooks: {
        ...hooks,
        onMessage: (message) => dispatch('_messageArrived', message)
      }
    })
  },

  unsubscribeFromRoom({state}, {roomId}) {
    state.currentUser.roomSubscriptions[roomId].cancel();
  },

  // TODO: Attachments
  sendMessage({state}, {text,roomId, attachment}) {
    return state.currentUser.sendMessage({text, roomId, attachment})
  },

  _messageArrived({state}, message) {

  },

  /**
   * @function sendUserIsTypingEvent
   * Notify all users that the current user is typing.
   * @param {integer} roomId - The room the current user is typing in
   */
  sendUserIsTypingEvent({state}, roomId) {
    return state.currentUser.isTypingIn({ roomId: roomId });
  },

  /**
   * @function fetchMessages
   * Fetch all message for room
   * @param {object} options - Options object
   * @param options.roomId - roomID of the room to fetch messages from
   * @param {integer} [options.initialMessageId] - roomID of the room to fetch messages from
   * @param {'older' | 'newer'} [options.direction] - 'older' | 'newer' - 'older' for past messages, 'newer' for messages ahead of 'initialMessageId'. ('newer' has no effect if `initialMessageId` is not set)
   * @param {integer} [options.limit] - amount of messages to return (Default: 20. Max: 100)
   */
  fetchMessages: ({state}, {roomId, initialMessageId, direction, limit}) => {
    return state.currentUser.fetchMessages({
      roomId: roomId,
      initialId: initialMessageId,
      direction: direction,
      limit: limit,
    });
  },


  sendUserReadCursor({roomId,position}) {

  },

  // Get the read positon of any user // API readCursor silently defaults to currentUser. Poor design, do not expose!
  getReadCursor({roomId, userId}) {

  }, 

  


  //
  // Admin-level Functions
  //
  createRoom: ({state}, {name, private, addUserIds, customData}) => {
    return state.currentUser.createRoom({ name, private, addUserIds, customData });
  },
  updateRoom({roomId,name,private,customData}) {
    return state.currentUser.updateRoom({ roomId, name, private, customData });
  },
  deleteRoom({state}, { roomId }) { 
    return state.currentUser.deleteRoom({ roomId }) 
  },
  
  addUserToRoom: ({state}, {userId,roomId}) => {
    return state.currentUser.addUserToRoom({ userId, roomId });
  },
  removeUserFromRoom: ({userId,roomId}) => {
    return state.currentUser.removeUserFromRoom({ userId, roomId });
  },

  // Utility
  addLoggers({verbose,debug,info,warn,error}) {}
}



const vuexModule = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

export default vuexModule;