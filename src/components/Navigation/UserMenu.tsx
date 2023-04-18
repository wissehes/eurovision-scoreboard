import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function UserMenu() {
  const { status: sessionStatus } = useSession();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) =>
    setMenuAnchor(event.currentTarget);

  const closeMenu = () => setMenuAnchor(null);

  return (
    <div>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={openMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>

      <Menu
        // sx={{ mt: "1rem" }}
        id="menu-appbar"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {sessionStatus == "authenticated" ? (
          <AuthenticatedMenu onClose={closeMenu} />
        ) : (
          <UnauthenticatedMenu />
        )}
      </Menu>
    </div>
  );
}

interface MenuProps {
  onClose: () => void;
}

function AuthenticatedMenu({ onClose }: MenuProps) {
  const { data } = useSession();

  return (
    <>
      <MenuItem onClick={onClose}>
        <Avatar /> {data?.user.name}
      </MenuItem>
      <MenuItem onClick={onClose}>Profile</MenuItem>
      <MenuItem onClick={onClose}>My account</MenuItem>
      <MenuItem onClick={() => void signOut()}>Sign out</MenuItem>
    </>
  );
}

function UnauthenticatedMenu() {
  return (
    <>
      <MenuItem onClick={() => void signIn()}>Sign in</MenuItem>
    </>
  );
}
