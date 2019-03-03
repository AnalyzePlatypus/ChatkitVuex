# Chatkit-Vuex

## Usage


```bash
npm i --save chatkit-vuex
```

```javascript
import ChatkitVuex from "chatkit-vuex";

const store = Vuex.Store({
  modules: {
    chatkit: ChatkitVuex
  }
});

new Vue({
  el: "#app",
  store
})

```

For dynamic install/code splitting, SSR, see [advanced topics](#advanced-topics)

##

## Reference

### Errors

The best way to handle errors is to inspect the HTTP response code.

See the [API docs](https://docs.pusher.com/chatkit/reference/api#response-and-error-codes)

* `200` Request was successful.
* `201` Request was processed and a new resource was created.
* `204` Request was understood, but there is no content to be returned.

* `400` Request body is malformed (invalid JSON).
* `401` Request unauthorized. Your token is invalid
* `403` User making the request is not authorized to access the resource.
* `404` Requested resource is not found.
* `422` Request body is well formed JSON, but contains a value whose type is unsupported.
* `503` Service unavailable due to load.

Some tips:

> * Your production code should never encounter a `400` or `422`.

> * `401` should prompt the user to login (or your code to refresh your auth token)

> * `403` should warn the user about the permissions issue (Better UX: never show users chats they cannot access, unless you have UI for applying for permission)

> * `503` Try again in several seconds

## Advanced Topics

### Dynamic Install

If you only need ChatKit for one part of your app, you can use Vue async components + Webpack code-splitting to load the Vuex module (incl. the Chatkit SDK) only when you need it.

1. Create a dynamic component (or mark an existing component as async)
2. Import the Vuex module in the component.
3. Call `Vue.use(ChatkitVuex)` in the component. Vue will hot-install the Vuex module as soon as it's loaded.

### Server-side Rendering

Server-side rendering is **not supported** at present.

(I don't think it makes sense for a real-time UI element that uses live connections to be server side rendered)
If you disagree, or can figure out how to implement this, open an issue an we'll talk about it.

### Permissions

The complete list of permissions, according to the [JS SDK integration tests](`https://github.com/pusher/chatkit-client-js/blob/73ee29b1826bbb8e6b2249cc1e38ccd63457fc4b/tests/integration/main.js#L120`)

| Permissions | Description |
| --- | --- |
|`message:create` | |
|`room:create` | |
|`room:get` | |
|`room:update` | |
|`room:delete` | |
|`room:messages:get` | |
|`room:typing_indicator:create` | |
|`room:members:add` | |
|`room:members:remove` | |
|`room:join` | |
|`room:leave` | |
|`presence:subscribe` | |
|`user:get` | |
|`user:rooms:get` | |
|`file:get` | |
|`file:create` | |
|`cursors:read:get` | |
|`cursors:read:set` | |

### Caveats
See the official docs [here](https://docs.pusher.com/chatkit/core-concepts#limitations) and [here](https://docs.pusher.com/chatkit/core-concepts#limits)
* Chatkit does not support editing messages.
* Max users in a room: 100
* Max message size: 5KB
* Max custom_data size when creating users: 5KB
* Max number of messages retrieved on resuming a room subscription: 100
* Max number of users which can be added or removed from a room in a single request: 10
* Max room name length: 60 characters
* Max user ID length: 160 characters
* Max attachment file size: 5MB

### Other

* Several JS features on Pusher's doc & marketing sites are broken in Safari (scrollable areas broken, tooltips not working)

## Contributing

`Chatkit-Vuex` was developed at LoanMower