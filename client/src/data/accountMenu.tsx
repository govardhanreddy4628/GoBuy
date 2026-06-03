// src/data/accountMenu.js
import { FaRegUser, FaRegHeart } from "react-icons/fa";
import { IoBagCheckOutline, IoLocationOutline } from "react-icons/io5";

export const accountMenu = [
  {
    id: "profile",
    label: "My Profile",
    icon: <FaRegUser />,
    path: "profile",
  },
  {
    id: "list",
    label: "My Wish List",
    icon: <FaRegHeart />,
    path: "list",
  },
  {
    id: "orders",
    label: "My Orders",
    icon: <IoBagCheckOutline />,
    path: "orders",
  },
  {
    id: "address",
    label: "My Address",
    icon: <IoLocationOutline />,
    path: "address",
  },
];
