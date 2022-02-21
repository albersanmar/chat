import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { Box, Avatar, TextField, Button, Container } from "@mui/material";
import { Person, ArrowBackIos, Send, Sync } from "@mui/icons-material";
import { blue } from "@mui/material/colors";

import IconButton from "@mui/material/IconButton";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

import io from "socket.io-client";

const styleNotOwner = {
  backgroundColor: "#40e0d0",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 10,
  marginRight: 25,
};

const styleOwner = {
  backgroundColor: "#4a8cff",
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 0,
  marginLeft: 25,
  color: "white",
};

export default function Chat({ API_URL, auth, room, user, messages, users }) {
  const router = useRouter();

  const [roomId, setRoomId] = useState(room || null);
  const [text, setText] = useState("");
  const [sendMessage, setSendMessage] = useState(true);
  const [dataMessages, setMessages] = useState(
    messages
      ? messages.map((m) => ({
          id: m.id,
          text: m.text,
          owner: m.userId === auth.user.id,
        }))
      : []
  );
  const [clicked, setClicked] = useState({ send: false });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (sendMessage) {
      scrollTop();
      setSendMessage(false);
    }
    return () => {
      dataMessages;
    };
  }, [dataMessages]);

  useEffect(() => {
    initRealTime();
    readMessages();
    return () => {
      socket;
    };
  }, []);

  const scrollTop = () => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#messages"
    );
    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const readMessages = async () => {
    for (let m of messages) {
      await axios.put(`${API_URL}api/v1/messages/${m.id}`, {
        read: true,
      });
    }
  };

  const initRealTime = () => {
    const s = io(API_URL);
    s.emit("join", {
      room: roomId,
      users: users,
    });
    s.on("receiveMessage", (data) => {
      const message = data;
      if (message.userId !== auth.user.id) {
        const exist = dataMessages.find((m) => m.id === message.id);
        if (!exist) {
          let msgs = dataMessages.slice();
          msgs.push({ id: message.id, text: message.text, owner: false });
          setMessages(msgs.slice());
          setSendMessage(true);
        }
      }
    });
    setSocket(s);
  };

  const send = async () => {
    setClicked({ send: true });
    try {
      let response,
        room_id = roomId;
      /*if (!roomId) {
        response = await axios.post(`${API_URL}api/v1/rooms`, {
          users: [user.id, auth.user.id],
        });
        setRoomId(response.data.data.room.id);
        room_id = response.data.data.room.id;
      }*/
      response = await axios.post(`${API_URL}api/v1/messages`, {
        userId: auth.user.id,
        // roomId: room_id,
        text: text,
      });
      const message = response.data.data.message;
      let msgs = dataMessages.slice();
      msgs.push({ id: message.id, text: text, owner: true });
      setMessages(msgs.slice());
      socket.emit("sendMessage", {
        message: message,
        //room: roomId,
        users: users,
      });
      setText("");
      setSendMessage(true);
    } catch (error) {
      console.log(error);
      toast.error("Ha ocurrido un error, no fue posible enviarme");
    }
    setClicked({ send: false });
  };

  return (
    <div>
      <AppBar sx={{ position: "fixed" }}>
        <Toolbar>
          {/*<IconButton
            edge="start"
            color="inherit"
            aria-label="close"
            style={{ marginLeft: 5 }}
            onClick={() => router.back()}
          >
            <ArrowBackIos />
          </IconButton>*/}
          <Avatar
            sx={{ bgcolor: blue[500] }}
            style={{ marginRight: 5, marginLeft: 5 }}
          >
            <Person />
          </Avatar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {user.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <ToastContainer position="top-center" />
      <Container style={{ marginBottom: 70, marginTop: 60 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {dataMessages.map((m) => (
            <div
              key={m.id}
              style={{
                ...(m.owner ? styleOwner : styleNotOwner),
                marginBottom: 10,
                padding: 10,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              }}
            >
              {m.text}
            </div>
          ))}
        </Box>
      </Container>
      <div id="messages"></div>
      <Box
        sx={{
          position: "fixed",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "white",
        }}
        style={{ bottom: 0, left: 0, right: 0, height: 65 }}
      >
        <Box sx={{ flexGrow: 1 }} style={{ marginLeft: 10 }}>
          <TextField
            value={text}
            onChange={(v) => setText(v.target.value)}
            label="Message"
            variant="outlined"
            margin="dense"
            style={{ width: "100%" }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
          style={{ marginLeft: 10, marginRight: 10 }}
        >
          <Button
            variant="contained"
            sx={{ borderRadius: 100 }}
            size="small"
            onClick={send}
            disabled={text === "" || clicked.send}
          >
            <Send />
          </Button>
        </Box>
      </Box>
    </div>
  );
}
