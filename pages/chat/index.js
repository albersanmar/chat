import { withCookie } from "next-cookie";

import axios from "axios";

import Chat from "../../components/chat";
import { useEffect, useState } from "react";

export default withCookie(function ChatPage({
  API_URL,
  auth,
  messages,
  users,
}) {  
  return (
    <div>
      <Chat
        API_URL={API_URL}
        auth={auth}
        user={auth.user}
        users={users}
        messages={messages}
      />
    </div>
  );
});

export const getServerSideProps = async (ctx) => {
  const userId = ctx.query.userId;
  const token = ctx.req.cookies["auth.token"];

  if (!token) {
    ctx.res.writeHead(301, {
      Location: "/login",
    });
    ctx.res.end();
  }

  const API_URL = process.env.API_URL;

  let response = await axios.get(`${API_URL}api/v1/users`);
  const users = response.data.data.users;

  response = await axios.get(`${API_URL}api/v1/messages`);
  const messages = response.data.data.messages;

  console.log(messages);
  response = await axios.get(`${API_URL}api/v1/users/me`, {
    headers: { Authorization: `bearer ${token}` },
  });
  const auth = { user: response.data.data.user };

  return {
    props: {
      API_URL: API_URL,
      user: auth.user,
      users: users,
      auth: auth,
      messages: messages,
    },
  };
};
