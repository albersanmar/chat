import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";

import { Avatar } from "@mui/material";

import { Person } from "@mui/icons-material";

import { blue } from "@mui/material/colors";
import { useRouter } from "next/router";
import { useState } from "react";

export default function room({ user, messages, roomId }) {
  const router = useRouter();

  const goTo = () => {
    if (!roomId) router.push(`/chat?userId=${user.id}`);
    else router.push(`/chat/${roomId}`);
  };

  const [numMessages, setNumMessages] = useState(
    messages ? messages.filter((m) => !m.read).length : 0
  );

  return (
    <div>
      <ListItem button onClick={goTo}>
        <Avatar sx={{ bgcolor: blue[500] }} style={{ marginRight: 10 }}>
          <Person />
        </Avatar>
        <ListItemText
          primary={user.name}
          secondary={messages ? messages[0].text : ""}
        />
        {messages && numMessages > 0 && (
          <div
            style={{
              backgroundColor: blue[500],
              color: "white",
              width: 20,
              borderRadius: 20,
              textAlign: "center",
            }}
          >
            {numMessages}
          </div>
        )}
      </ListItem>
      <Divider />
    </div>
  );
}
