import { Box, Button } from "@mui/material";

import { useCookie, withCookie } from "next-cookie";

import { useRouter } from "next/router";

export default withCookie(function Home() {
  const router = useRouter();

  const login = () => router.push("/login");
  const register = () => router.push("/register");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      style={{ height: "100vh" }}
    >
      <div style={{ margin: 10 }}>
        <Button variant="contained" onClick={login}>
          Login
        </Button>
      </div>
      <div style={{ margin: 10 }}>
        <Button variant="text" onClick={register}>
          Register
        </Button>
      </div>
    </Box>
  );
});

export const getServerSideProps = async (ctx) => {
  const cookie = useCookie(ctx);
  const token = cookie.get("auth.token");

  if (token) {
    ctx.res.writeHead(301, {
      Location: "/rooms",
    });
    ctx.res.end();
  }
  return { props: { API_URL: process.env.API_URL } };
};
