import { Search, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../../ui/themeToggle';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
//import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Divider from '@mui/material/Divider';
// import { FaRegUser } from 'react-icons/fa';
// import { FiLogOut } from 'react-icons/fi';
import { User, Settings, Lock, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { useNavigate } from 'react-router-dom';
import LogoutDialog from './logoutDialog';
import { useAuth } from '../../context/authContext';

interface NavbarProps {
    className?: string;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        width: '8px', // for example
        height: '8px',
        borderRadius: '50%',
        // You can position the badge here if needed
        '&::after': {
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
            transformOrigin: 'center',
        },
    },

    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

export function Navbar({ className }: NavbarProps) {

    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const navigate = useNavigate()
    const { user } = useAuth();

    return (
        <>
            <header className={cn("bg-white/95 backdrop-blur-sm sticky top-0 z-10 border-b dark:bg-gray-950")}>
                <div className="container flex items-center justify-between h-16 px-4">
                    <h1 className="text-lg font-semibold tracking-tight lg:text-xl"><span className='text-green-500'>Go-</span>Board</h1>
                    <div className="flex items-center gap-2 lg:gap-4">

                        <div className="relative hidden md:flex items-center h-9 rounded-md px-3 text-muted-foreground focus-within:text-foreground bg-muted/50 bg-slate-200 dark:bg-gray-600 focus-within:outline-none">
                            <Search className="h-4 w-4 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={cn(
                                    "flex w-full rounded-md border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                    "h-9 w-[200px] lg:w-[280px] bg-transparent border-none px-0 py-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <Tooltip title="Notifications">
                            <IconButton aria-label="bell" >
                                <Bell className='!text-animate-none dark:text-gray-50' />          {/*  this class not working check this later */}
                                <Badge badgeContent={2} color="primary" className='animate-pulse -top-[12px] right-[1px]'></Badge>
                            </IconButton>
                        </Tooltip>

                        {/* <Tooltip title="Account settings">
                        <div className="flex items-center gap-4 shadow-xs rounded-md cursor-pointer" onClick={handleClick}>
                            <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                variant="dot"
                                sx={{ ml: 1 }}
                                aria-controls={adminMenuOpen ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={adminMenuOpen ? 'true' : undefined}
                            >
                                <div className="overflow-hidden">
                                    <Avatar alt="Go" src="https://i.pravatar.cc/40"
                                        className="w-8 h-8 rounded-full"
                                    />
                                </div>
                            </StyledBadge>
                        </div>
                    </Tooltip>

                    <Menu
                        anchorEl={accanchorEl}
                        id="account-menu"
                        open={adminMenuOpen}
                        onClose={handleClose}
                        onClick={handleClose}
                        disableScrollLock={true}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    minWidth: 180,
                                    '& .MuiMenuItem-root': {
                                        py: 1, // reduce vertical padding
                                    },
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleClose} >
                            <Avatar /> Profile
                        </MenuItem>

                        <Divider />

                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <FaRegUser fontSize="small" />
                            </ListItemIcon>
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <FiLogOut fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu> */}

                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                {!user ? null :
                                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20">
                                    <AvatarImage
                                        src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                        alt={user?.fullName || "User"}
                                    />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
                                    </AvatarFallback>                               
                                </Avatar>
                                }
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.fullName || "Unknown User"}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email || "No Email"}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/adminprofile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/adminsettings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/adminchangepassword")}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    <span>Change Password</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => setShowLogoutDialog(true)}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />

        </>
    );
}
