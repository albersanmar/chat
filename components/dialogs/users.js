import * as React from "react";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import List from "@mui/material/List";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";

import Room from "../room";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function users({ users, open, handleClose }) {
  const [openDialog, setOpenDialog] = useState(open);
  const [dataUsers, setDataUsers] = useState(users);

  useEffect(() => {
    setOpenDialog(open);
    return () => {
      openDialog;
    };
  }, [open]);

  useEffect(() => {
    setDataUsers(users);
    return () => {
      dataUsers;
    };
  }, [users]);

  return (
    <Dialog
      fullScreen
      open={openDialog}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Contacts
          </Typography>
        </Toolbar>
      </AppBar>
      <List>
        {dataUsers && dataUsers.map((u) => <Room user={u} key={u.id} />)}
      </List>
    </Dialog>
  );
}
