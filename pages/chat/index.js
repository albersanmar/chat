import { useCookie, withCookie } from "next-cookie";

import axios from "axios";

import Chat from "../../components/chat";

export default withCookie(function chat({ API_URL, user, auth }) {
  return (
    <div>
      <Chat API_URL={API_URL} auth={auth} user={user} />
    </div>
  );
});

export const getServerSideProps = async (ctx) => {
  const userId = ctx.query.userId;
  const cookie = useCookie(ctx);
  const token = cookie.get("auth.token");

  if (!token) {
    ctx.res.writeHead(301, {
      Location: "/login",
    });
    ctx.res.end();
  }

  const API_URL = process.env.API_URL;

  let response = await axios.get(`${API_URL}api/v1/users/${userId}`);
  const user = response.data.data.user;

  response = await axios.get(`${API_URL}api/v1/users/me`, {
    headers: { Authorization: `bearer ${token}` },
  });
  const auth = { user: response.data.data.user };

  return { props: { API_URL: API_URL, user, auth: auth } };
};
