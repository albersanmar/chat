import { useCookie, withCookie } from "next-cookie";

import axios from "axios";

import Chat from "../../components/chat";

export default withCookie(function ChatPage({
  API_URL,
  user,
  auth,
  room,
  messages,
}) {
  return (
    <div>
      <Chat
        API_URL={API_URL}
        auth={auth}
        user={user}
        room={room.id}
        messages={messages}
      />
    </div>
  );
});

export const getServerSideProps = async (ctx) => {
  const roomId = ctx.query.roomId;
  const token = ctx.req.cookies["auth.token"];

  if (!token) {
    ctx.res.writeHead(301, {
      Location: "/login",
    });
    ctx.res.end();
  }

  const API_URL = process.env.API_URL;

  let response = await axios.get(`${API_URL}api/v1/messages?roomId=${roomId}`);
  const messages = response.data.data.messages;

  response = await axios.get(`${API_URL}api/v1/rooms/${roomId}`);
  const room = response.data.data.room;

  response = await axios.get(`${API_URL}api/v1/users/me`, {
    headers: { Authorization: `bearer ${token}` },
  });
  const auth = { user: response.data.data.user };

  return {
    props: {
      API_URL: API_URL,
      messages: messages,
      room: room,
      user: room.userRooms.find((ur) => ur.userId !== auth.user.id).user,
      auth: auth,
    },
  };
};
