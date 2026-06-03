import * as React from "react";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import api from "../../api/api_utility";
import { useAuth } from "../../context/authContext";

/* ================= INTERFACES ================= */

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
}

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  totalItems: number;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    email: string;
    mobile: string;
    houseNumber?: string;
    address_line: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
}

/* ================= STATUS CHIP ================= */

const StatusChip = ({ status }: { status: string }) => {
  const colorMap: Record<string, any> = {
    placed: "info",
    pending: "warning",
    delivered: "success",
    cancelled: "error",
  };

  return (
    <Chip
      label={status}
      size="small"
      color={colorMap[status?.toLowerCase()] || "default"}
      sx={{ fontWeight: 600, textTransform: "capitalize" }}
    />
  );
};

/* ================= ROW COMPONENT ================= */

function Row({ row }: { row: Order }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          transition: "0.3s",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.03)",
          },
        }}
      >
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ fontWeight: 600 }}>
          {row.orderId}
        </TableCell>

        <TableCell>{row.shippingAddress.fullName}</TableCell>

        <TableCell>{row.shippingAddress.mobile}</TableCell>

        <TableCell sx={{ maxWidth: 250 }}>
          {row.shippingAddress.houseNumber},{" "}
          {row.shippingAddress.address_line},{" "}
          {row.shippingAddress.city},{" "}
          {row.shippingAddress.state}
        </TableCell>

        <TableCell>{row.shippingAddress.pincode}</TableCell>

        <TableCell sx={{ fontWeight: 600 }}>
          ₹{row.totalAmount}
        </TableCell>

        <TableCell>
          <StatusChip status={row.orderStatus} />
        </TableCell>

        <TableCell>
          <StatusChip status={row.paymentStatus} />
        </TableCell>

        <TableCell>
          {new Date(row.createdAt).toLocaleDateString()}
        </TableCell>
      </TableRow>

      {/* EXPANDABLE ITEMS */}
      <TableRow>
        <TableCell colSpan={10} sx={{ p: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                borderRadius: 2,
                backgroundColor: "#f9fafb",
                p: 2,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Image
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Qty
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {row.items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>

                      <TableCell>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            height: 50,
                            width: 50,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        ₹{item.price}
                      </TableCell>

                      <TableCell align="right">
                        {item.quantity}
                      </TableCell>

                      <TableCell align="right">
                        ₹{item.price * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function MyOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { isAuthenticated, isAuthLoading } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/v1/order/my-orders");
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    fetchOrders();
  }, [isAuthenticated, isAuthLoading]);

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="py-6 px-2">
      <h1 className="text-2xl font-bold mb-6">
        My Orders
      </h1>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            maxHeight: rowsPerPage > 5 ? 350 : "auto",
            overflowY: rowsPerPage > 5 ? "auto" : "visible",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 700 }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Phone
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Address
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Pincode
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Payment
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Date
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedOrders.map((row) => (
                <Row key={row._id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[3, 5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </Paper>
    </div>
  );
}