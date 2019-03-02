/*

# Wraps the entire Pusher Chatkit API in a nice Vuex module that can be watched

User 
  id
  name
  avatarURL
  presence

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
  chatManager: undefined,
  currentUser: undefined,
  isConnected: false,
  typingUsers: []
}

const getters = {
  users: state => state.currentUser.users,
  usersInRoom: state => roomId => state.currentUser.rooms[roomId].users, // ???
  rooms: state => state.currentUser.rooms, // Needs Better name 'The rooms that the connected user is a member of. '
  roomSubscriptions: state => state.currentUser.roomSubscriptions, // The union of all the members of all the rooms that the current user is subscribed to.
  fellowUsers: state => state.currentUser.users 
}

const mutations = {

}

const actions = {
  // 
  init: (context, {instanceLocator, userId, tokenProvider, logger, connectionTimeout}) => {
    // call .connect
  },
  setTokenManager: (options) => {
    options.url;
    options.queryParams;
    options.header;
    options.withCredentials
  },

  connect: ({state, dispatch}) => {
     return state.chatManager.connect({
      onAddedToRoom:     room => dispatch('addedToRoom', room),
      onRemovedFromRoom: room => dispatch('removedFromRoom', room),
      onRoomUpdated:     room => dispatch('roomUpdated', room),
      onRoomDeleted:     room => dispatch('roomDeleted', room)
     });
  },

  addedToRoom: ({state}, room) => {},
  removedFromRoom: ({state}, room) => {},
  roomUpdated: ({state}, room) => {},
  roomDeleted: ({state}, room) => {},


  disconnect: ({state}) => state.chatManager.connect(),

  disconnectAllSubscriptions: ({state}) => state.currentUser.disconnect(),

  addedToRoom: ({state}, roomId) => {},
  removedFromRoom: ({state}, roomId) => {},
  roomUpdated: ({state}, roomId) => {},
  roomDeleted: ({state}, roomId) => {},

  onUserStartedTyping: ({state}, roomId, userId) => {
    state.typingUsers.push(userId);
  },
  onUserStoppedTyping: ({state}, roomId, userId) => {
    const index = state.typingUsers.findIndex(userId);
    state.typingUsers[index] = undefined;
  },

  onUserJoinedRoom: ({state}, roomId, userId) => {},
  onUserLeftRoom: ({state}, roomId, userId) => {},
  onPresenceChanged: ({state}, newPresenceState, userId) => {},
  onNewReadCursor: ({state}, newCursor) => {},

  createRoom: ({name, private, addUserIds, customData}) => {
    options.name
    options.private
    options.addUserIds
    options.customData
  },
  updateRoom({roomId,name,private,customData}) {},
  deleteRoom({ roomId: someRoomID }) {},

  fetchMessages: () => {
    options.roomId;
    options.initialId;
    options.direction;
    options.limit;
  },
  
  addUserToRoom: ({userId,roomId}) => {},
  removeUserFromRoom: ({userId,roomId}) => {},
  getJoinableRooms: () => {},

  joinRoom({ roomId: someRoomID }) {},
  leaveRoom({ roomId: someRoomID }) {},
  
  subscribeToRoom({
    roomId,
    messageLimit,
    hooks: {
      onMessage,
      onUserStartedTyping,
      onUserStoppedTyping,
      onUserJoined,
      onUserLeft,
      onPresenceChanged,
      onNewReadCursor
    },
  }){},

  unsubscribeFromRoom({state}, {roomId}) {
    state.currentUser.roomSubscriptions[roomId].cancel();
  },

  sendMessage({text,roomId, attachment: { file,name }}) {},

  isTypingIn({ roomId: someRoomId }) {},

  setReadCursor({roomId,position}) {},
  getReadCursor({roomId, userId}) {}, // API readCursor silently defaults to currentUser. Poor design, do not expose!

  addLoggers({verbose,debug,info,warn,error}) {}
}



const vuexModule = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}