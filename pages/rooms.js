import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import { useCookie, withCookie } from "next-cookie";

import axios from "axios";

import DialogUsers from "../components/dialogs/users";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";

import AddIcon from "@mui/icons-material/Add";

import { Avatar, Fab } from "@mui/material";
import { Person } from "@mui/icons-material";
import { blue } from "@mui/material/colors";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Room from "../components/room";

import io from "socket.io-client";

const ITEM_HEIGHT = 48;

const sort = (a, b) => {
  let dateA = new Date(a.date);
  let dateB = new Date(b.date);

  if (dateA > dateB) return -1;
  else if (dateA < dateB) return 1;
  else return 0;
};

export default withCookie(function Rooms({
  cookie,
  token,
  API_URL,
  users,
  rooms,
  user,
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [dataUsers, setDataUsers] = useState(users);
  const [dataRooms, setDataRooms] = useState(rooms);
  const [anchorEl, setAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    initRealTime();
    return () => {
      socket;
    };
  }, []);

  const initRealTime = () => {
    const s = io(API_URL);
    s.emit("join", {
      users: [user.id],
    });
    s.on("receiveMessage", async (data) => {
      const message = data;
      let rs = dataRooms.slice();
      let index = rs.findIndex((r) => r.roomId === message.roomId);
      if (index !== -1) {
        rs[index].messages.unshift(message);
        setDataRooms(rs.slice());
      } else {
        let response = await axios.get(
          `${API_URL}api/v1/rooms/${message.roomId}`
        );
        const room = response.data.data.room;
        const userRoom = room.userRooms.find((ur) => ur.userId !== user.id);
        rs.unshift({
          id: userRoom.id,
          user: userRoom.user,
          messages: room.messages,
          roomId: room.id,
        });
        setDataRooms(rs.slice().sort(sort));
      }
    });
    setSocket(s);
  };

  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}api/v1/auth/logout`, {
        headers: { Authorization: `bearer ${token}` },
      });
      cookie.remove("auth.token");
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Ha ocurrido un error, no fue posible cerrar sesión");
    }
  };

  return (
    <div>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: blue[500] }} style={{ marginRight: 10 }}>
            <Person />
          </Avatar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {user.name}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="close"
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
            }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: "20ch",
              },
            }}
          >
            <MenuItem onClick={handleOpen}>New chat</MenuItem>
            <MenuItem onClick={logout}>Log out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <DialogUsers open={open} users={dataUsers} handleClose={handleClose} />
      <ToastContainer position="top-center" />
      <List>
        {dataRooms.map((ur) => (
          <Room
            user={ur.user}
            key={ur.id}
            messages={ur.messages}
            roomId={ur.roomId}
          />
        ))}
      </List>
      <Fab
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        color="primary"
        onClick={handleOpen}
      >
        <AddIcon />
      </Fab>
    </div>
  );
});

export const getServerSideProps = async (ctx) => {
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

  response = await axios.get(`${API_URL}api/v1/users/me`, {
    headers: { Authorization: `bearer ${token}` },
  });
  const user = response.data.data.user;

  response = await axios.get(`${API_URL}api/v1/user-rooms?userId=${user.id}`);
  const userRooms = response.data.data.userRooms;

  const rooms = userRooms
    .map((ur) => ({
      id: ur.id,
      user: ur.room.userRooms.find((u) => u.userId !== user.id).user,
      messages: ur.room.messages,
      roomId: ur.room.id,
      date: ur.room.messages[0].createdAt,
    }))
    .sort(sort);

  return {
    props: {
      token: token,
      API_URL: API_URL,
      users: users.filter(
        (u) => u.id !== user.id && !rooms.find((r) => r.user.id === u.id)
      ),
      rooms: rooms,
      user: user,
    },
  };
};
